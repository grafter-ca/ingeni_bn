import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { EmailService } from '../libs/nodemail/email.service.js';
import { UserRole, Prisma } from '../../generated/prisma/client.js';

export interface EmailNotificationResult {
  success: boolean;
  messageId: string | null;
  reason?: string;
}

export interface LiveSessionQueryOptions {
  currentUserId?: string;
  clientIp?: string | null;
  city?: string | null;
  country?: string | null;
}

const SAFE_USER_SELECT = {
  id: true,
  name: true,
  email: true,
  emailVerified: true,
  image: true,
  phone: true,
  role: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  private async safeSendEmail(
    recipientEmail: string | null | undefined,
    subject: string,
    html: string,
    text: string,
  ): Promise<EmailNotificationResult> {
    const cleanEmail = recipientEmail?.trim();
    if (!cleanEmail) {
      return {
        success: false,
        messageId: null,
        reason: 'NO_RECIPIENT_EMAIL',
      };
    }

    try {
      const sent: any = await this.emailService.sendMail(
        cleanEmail,
        subject,
        html,
      );

      return {
        success: true,
        messageId: sent?.messageId ?? sent?.id ?? null,
      };
    } catch (err: any) {
      this.logger.warn(
        `Failed to send email ("${subject}") to ${cleanEmail}: ${err?.message || err}`,
      );
      return {
        success: false,
        messageId: null,
        reason: err?.message || 'EMAIL_SEND_FAILED',
      };
    }
  }

  /** Create a domain user record (prefer Better Auth signUp for standard user registration) */
  async create(data: Prisma.UserCreateInput) {
    const existing = await this.prisma.user.findUnique({
      where: { email: data.email },
      select: { id: true },
    });
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    try {
      const user = await this.prisma.user.create({
        data,
        select: SAFE_USER_SELECT,
      });

      const emailNotification = await this.safeSendEmail(
        user.email,
        'Welcome to Our Platform',
        `<p>Hello ${user.name || 'there'},</p><p>Your account has been created.</p>`,
        `Hello ${user.name || 'there'}, your account has been created.`,
      );

      return { ...user, emailNotification };
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2002'
      ) {
        throw new ConflictException(
          'A user with those unique details already exists',
        );
      }
      throw err;
    }
  }

  /** Find all users with optional role, search, and pagination */
  async findAll(
    role?: UserRole,
    search?: string,
    limit: number = 10,
    offset: number = 0,
  ) {
    const safeLimit = Math.min(Math.max(Number(limit) || 10, 1), 100);
    const safeOffset = Math.max(Number(offset) || 0, 0);
    const trimmedSearch = search?.trim();

    return this.prisma.user.findMany({
      where: {
        ...(role && { role }),
        ...(trimmedSearch && {
          OR: [
            { name: { contains: trimmedSearch, mode: 'insensitive' } },
            { email: { contains: trimmedSearch, mode: 'insensitive' } },
            { phone: { contains: trimmedSearch, mode: 'insensitive' } },
          ],
        }),
      },
      take: safeLimit,
      skip: safeOffset,
      orderBy: { createdAt: 'desc' },
      select: {
        ...SAFE_USER_SELECT,
        _count: { select: { sessions: true, accounts: true } },
      },
    });
  }

  /** Find a user by ID */
  async findOneById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        ...SAFE_USER_SELECT,
        vendor: { select: { id: true, storeName: true, isActive: true } },
      },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  /** Find a user by email */
  async findOneByEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
      select: SAFE_USER_SELECT,
    });
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
    return user;
  }

  /** Update user profile (whitelist allowed profile fields in controller DTO) */
  async updateProfile(id: string, data: Prisma.UserUpdateInput) {
    try {
      return await this.prisma.user.update({
        where: { id },
        data,
        select: SAFE_USER_SELECT,
      });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === 'P2025') {
          throw new NotFoundException(`User with ID ${id} not found`);
        }
        if (err.code === 'P2002') {
          throw new ConflictException('Email or phone is already in use');
        }
      }
      throw err;
    }
  }

  /** Direct role change — strictly admin only */
  async updateRole(
    currentUserRole: UserRole | string,
    targetUserId: string,
    newRole: UserRole,
  ) {
    if (currentUserRole !== 'admin') {
      throw new ForbiddenException('Only admins can update user roles.');
    }

    const updatedUser = await this.prisma.$transaction(async (tx) => {
      const existing = await tx.user.findUnique({
        where: { id: targetUserId },
        select: { id: true, name: true },
      });
      if (!existing) {
        throw new NotFoundException(`User with ID ${targetUserId} not found`);
      }

      const user = await tx.user.update({
        where: { id: targetUserId },
        data: { role: newRole },
        select: SAFE_USER_SELECT,
      });

      if (newRole === 'vendor') {
        await this.ensureVendorProfileTx(tx, targetUserId, user.name);
      }

      return user;
    });

    const emailNotification = await this.safeSendEmail(
      updatedUser.email,
      `Your Account Role Is Now ${String(newRole).toUpperCase()}`,
      `<p>Hello ${updatedUser.name || 'there'},</p><p>Your account role has been updated to <strong>${newRole}</strong>.${
        newRole === 'vendor'
          ? ' Your vendor store profile is now ready.'
          : ''
      }</p>`,
      `Hello ${updatedUser.name || 'there'}, your account role has been updated to ${newRole}.`,
    );

    return { ...updatedUser, emailNotification };
  }

  /** User submits a role upgrade request & receives confirmation email */
  async requestRoleUpgrade(userId: string, requestedRole: UserRole) {
    if (requestedRole === 'admin') {
      throw new ForbiddenException('Cannot self-request the admin role.');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    if (user.role === requestedRole) {
      throw new BadRequestException(
        `User already has the ${requestedRole} role.`,
      );
    }

    const emailNotification = await this.safeSendEmail(
      user.email,
      `Role Upgrade Request Received (${String(requestedRole).toUpperCase()})`,
      `<p>Hello ${user.name || 'there'},</p><p>We received your request to upgrade your account to <strong>${requestedRole}</strong>. An administrator will review and notify you once approved.</p>`,
      `Hello ${user.name || 'there'}, we received your request to upgrade your account to ${requestedRole}.`,
    );

    return {
      userId,
      currentRole: user.role,
      requestedRole,
      status: 'PENDING_ADMIN_APPROVAL',
      emailNotification,
    };
  }

  /** Admin approves role upgrade to target role (e.g. 'vendor') */
  async approveRoleUpgrade(
    adminId: string,
    targetUserId: string,
    approvedRole: UserRole = 'vendor' as UserRole,
  ) {
    const updatedUser = await this.prisma.$transaction(async (tx) => {
      const admin = await tx.user.findUnique({
        where: { id: adminId },
        select: { id: true, role: true },
      });
      if (!admin || admin.role !== 'admin') {
        throw new ForbiddenException('Only admins can approve role changes.');
      }

      const targetUser = await tx.user.findUnique({
        where: { id: targetUserId },
        select: { id: true, name: true },
      });
      if (!targetUser) {
        throw new NotFoundException('Target user not found.');
      }

      const user = await tx.user.update({
        where: { id: targetUserId },
        data: { role: approvedRole },
        select: SAFE_USER_SELECT,
      });

      if (approvedRole === 'vendor') {
        await this.ensureVendorProfileTx(tx, targetUserId, user.name);
      }

      return user;
    });

    const emailNotification = await this.safeSendEmail(
      updatedUser.email,
      `Role Upgrade Approved: ${String(approvedRole).toUpperCase()}`,
      `<p>Hello ${updatedUser.name || 'there'},</p><p>Your request for the <strong>${approvedRole}</strong> role has been approved.</p>`,
      `Hello ${updatedUser.name || 'there'}, your request for the ${approvedRole} role has been approved.`,
    );

    return { ...updatedUser, emailNotification };
  }

  /** Remove a user & send closure notice */
  async remove(id: string) {
    try {
      const deletedUser = await this.prisma.user.delete({
        where: { id },
        select: SAFE_USER_SELECT,
      });

      const emailNotification = await this.safeSendEmail(
        deletedUser.email,
        'Account Closed',
        `<p>Hello ${deletedUser.name || 'there'},</p><p>Your account has been removed from our platform.</p>`,
        `Hello ${deletedUser.name || 'there'}, your account has been removed from our platform.`,
      );

      return { ...deletedUser, emailNotification };
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === 'P2025') {
          throw new NotFoundException(`User with ID ${id} not found`);
        }
        if (err.code === 'P2003') {
          throw new ConflictException(
            'Cannot delete user while linked records (orders, vendor store, etc.) exist.',
          );
        }
      }
      throw err;
    }
  }

  /** Return live session users & location/IP metadata from PostgreSQL */
  async findLiveSessions(
    windowMinutes: number = 60,
    optionsOrUserId?: LiveSessionQueryOptions | string,
  ) {
    const options: LiveSessionQueryOptions =
      typeof optionsOrUserId === 'string'
        ? { currentUserId: optionsOrUserId }
        : (optionsOrUserId ?? {});

    const now = new Date();
    const cutoff = new Date(now.getTime() - windowMinutes * 60 * 1000);

    const activeSessions = await this.prisma.session.findMany({
      where: {
        expiresAt: { gt: now },
        OR: [
          { updatedAt: { gte: cutoff } },
          ...(options.currentUserId ? [{ userId: options.currentUserId }] : []),
        ],
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        userId: true,
        ipAddress: true,
        userAgent: true,
        createdAt: true,
        updatedAt: true,
        expiresAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            image: true,
            emailVerified: true,
          },
        },
      },
    });

    const byUser = new Map<
      string,
      {
        userId: string;
        user: (typeof activeSessions)[number]['user'];
        isLive: boolean;
        activeSessionCount: number;
        lastActiveAt: Date;
        ipAddress: string | null;
        locationLabel: string;
        userAgent: string | null;
      }
    >();

    for (const s of activeSessions) {
      const effectiveIp =
        s.ipAddress ||
        (options.currentUserId && s.userId === options.currentUserId
          ? (options.clientIp ?? null)
          : null);

      const locationLabel = this.resolveLocationFromSession(effectiveIp, {
        city: options.city,
        country: options.country,
      });

      const lastActive = s.updatedAt || s.createdAt;
      const existing = byUser.get(s.userId);

      if (!existing) {
        byUser.set(s.userId, {
          userId: s.userId,
          user: s.user,
          isLive: true,
          activeSessionCount: 1,
          lastActiveAt: lastActive,
          ipAddress: effectiveIp,
          locationLabel,
          userAgent: s.userAgent || null,
        });
      } else {
        existing.activeSessionCount += 1;
        if (lastActive > existing.lastActiveAt) {
          existing.lastActiveAt = lastActive;
          existing.ipAddress = effectiveIp || existing.ipAddress;
          existing.locationLabel = this.resolveLocationFromSession(
            effectiveIp || existing.ipAddress,
            { city: options.city, country: options.country },
          );
          existing.userAgent = s.userAgent || existing.userAgent;
        }
      }
    }

    return {
      windowMinutes,
      liveUsersCount: byUser.size,
      totalActiveSessions: activeSessions.length,
      liveUsers: Array.from(byUser.values()),
    };
  }

  /** Derives a human-readable location label from IP / geo headers */
  private resolveLocationFromSession(
    ipAddress?: string | null,
    geo?: { city?: string | null; country?: string | null },
  ): string {
    const cleanIp = ipAddress
      ? ipAddress.replace(/^::ffff:/, '').trim()
      : null;
    const isLocal =
      !cleanIp ||
      cleanIp === '127.0.0.1' ||
      cleanIp === '::1' ||
      cleanIp.startsWith('192.168.') ||
      cleanIp.startsWith('10.');

    if (geo?.city && geo?.country) {
      return `${geo.city}, ${geo.country}`;
    }
    if (geo?.country) {
      return geo.country;
    }
    if (isLocal) {
      return 'Local Network (Dev)';
    }
    return `IP ${cleanIp}`;
  }

  private async ensureVendorProfileTx(
    tx: Prisma.TransactionClient,
    userId: string,
    userName?: string | null,
  ) {
    const existingVendor = await tx.vendor.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!existingVendor) {
      const baseName = userName?.trim() || 'Merchant';
      await tx.vendor.create({
        data: {
          userId,
          storeName: `${baseName}'s Store`,
        },
      });
    }
  }
}