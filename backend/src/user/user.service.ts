import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { UserRole, Prisma } from '../../generated/prisma/index.js';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  /** Create a new user */
  async create(data: Prisma.UserCreateInput) {
    const existing = await this.prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw new ConflictException('Email already registered');

    return this.prisma.user.create({ data });
  }

  /** Find all users with optional role, search, and pagination */
  async findAll(
    role?: UserRole,
    search?: string,
    limit: number = 10,
    offset: number = 0
  ) {
    return this.prisma.user.findMany({
      where: {
        ...(role && { role }),
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { phone: { contains: search } },
          ],
        }),
      },
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { sessions: true, accounts: true } } },
    });
  }

  /** Find a user by ID */
  async findOneById(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id }, include: { accounts: true } });
    if (!user) throw new NotFoundException(`User with ID ${id} not found`);
    return user;
  }

  /** Find a user by email */
  async findOneByEmail(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new NotFoundException(`User with email ${email} not found`);
    return user;
  }

  /** Update user profile (general fields) */
  async updateProfile(id: string, data: Partial<Prisma.UserUpdateInput>) {
    try {
      return await this.prisma.user.update({ where: { id }, data });
    } catch (err) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }

  /** Direct role change, only allowed by admin */
  async updateRole(currentUserRole: UserRole, targetUserId: string, newRole: UserRole) {
    if (newRole === 'admin' && currentUserRole !== 'admin') {
      throw new ForbiddenException('Only admins can assign the admin role.');
    }
    if (currentUserRole !== 'admin' && newRole !== 'vendor') {
      throw new ForbiddenException('You do not have permission to change this user’s role.');
    }

    const user = await this.prisma.user.update({
      where: { id: targetUserId },
      data: { role: newRole },
    });

    // Auto-create vendor profile if upgrading to vendor
    if (newRole === 'vendor') {
      const existingVendor = await this.prisma.vendor.findUnique({
        where: { userId: targetUserId },
      });
      if (!existingVendor) {
        await this.prisma.vendor.create({
          data: {
            userId: targetUserId,
            storeName: `${user.name}'s Store`,
          },
        });
      }
    }

    return user;
  }

  /** User requests a role upgrade (pendingRole is set) */
  async requestRoleUpgrade(userId: string, requestedRole: UserRole) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { role: requestedRole },
    });

    // Auto-create vendor profile if upgrading to vendor
    if (requestedRole === 'vendor') {
      const existingVendor = await this.prisma.vendor.findUnique({
        where: { userId },
      });
      if (!existingVendor) {
        await this.prisma.vendor.create({
          data: {
            userId,
            storeName: `${user.name}'s Store`,
          },
        });
      }
    }

    return user;
  }
  
  /** Admin approves role upgrade */
  async approveRoleUpgrade(adminId: string, targetUserId: string) {
    const admin = await this.prisma.user.findUnique({ where: { id: adminId } });
    if (!admin || admin.role !== 'admin') {
      throw new ForbiddenException('Only admins can approve role changes.');
    }

    const targetUser = await this.prisma.user.findUnique({ where: { id: targetUserId } });
    if (!targetUser) throw new NotFoundException('Target user not found.');
    if (!targetUser.role) throw new ForbiddenException('No pending role change request.');

    const updatedUser = await this.prisma.user.update({
      where: { id: targetUserId },
      data: { role: targetUser.role },
    });

    // Auto-create vendor profile if upgrading to vendor
    if (targetUser.role === 'vendor') {
      const existingVendor = await this.prisma.vendor.findUnique({
        where: { userId: targetUserId },
      });
      if (!existingVendor) {
        await this.prisma.vendor.create({
          data: {
            userId: targetUserId,
            storeName: `${updatedUser.name}'s Store`,
          },
        });
      }
    }

    return updatedUser;
  }

  /** Remove a user */
  async remove(id: string) {
    try {
      return await this.prisma.user.delete({ where: { id } });
    } catch (err) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }
}