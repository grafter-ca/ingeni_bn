import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  EmailService,
  type EmailDispatchResult,
} from '../libs/nodemail/email.service.js';
import { SocketGateway } from '../socket/socket.gateway.js';
import {
  OrderStatus,
  AdminRequestStatus,
} from '../../generated/prisma/client.js';

@Injectable()
export class VendorsService {
  private readonly logger = new Logger(VendorsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly socketGateway: SocketGateway,
  ) {}

  private async safeSendEmail(
    to: string | null | undefined,
    subject: string,
    html: string,
    contextLabel: string,
  ): Promise<EmailDispatchResult> {
    if (!to || !to.trim()) {
      return {
        success: false,
        messageId: null,
        reason: 'No recipient email address available',
      };
    }

    try {
      return await this.emailService.sendMail(to.trim(), subject, html);
    } catch (err) {
      this.logger.error(`Failed to send email [${contextLabel}] to ${to}:`, err);
      return {
        success: false,
        messageId: null,
        reason: 'SMTP dispatch error',
      };
    }
  }

  async findAll() {
    return this.prisma.vendor.findMany({
      include: {
        user: { select: { email: true, name: true, id: true, phone: true } },
      },
    });
  }

  async getVendorById(identifier: string) {
    let vendor = await this.prisma.vendor.findUnique({
      where: { id: identifier },
      include: { products: true, user: true },
    });

    if (!vendor) {
      vendor = await this.prisma.vendor.findUnique({
        where: { userId: identifier },
        include: { products: true, user: true },
      });
    }

    return vendor;
  }

  async create(data: {
    storeName: string;
    userId: string;
    description?: string;
    address?: string;
    phone?: string;
    user?: { id: string; name: string; email: string };
  }) {
    const user = await this.prisma.user.findUnique({
      where: { id: data.userId },
    });
    if (!user) {
      throw new NotFoundException('Associated user account not found.');
    }

    const existingVendor = await this.prisma.vendor.findUnique({
      where: { userId: data.userId },
    });
    if (existingVendor) {
      throw new BadRequestException(
        'A vendor profile already exists for this user account.',
      );
    }

    const vendor = await this.prisma.$transaction(async (tx) => {
      const createdVendor = await tx.vendor.create({
        data: {
          storeName: data.storeName,
          userId: data.userId,
          description: data.description,
          address: data.address,
          phone: data.phone,
          isActive: true,
        },
        include: { user: true, products: true },
      });

      await tx.user.update({
        where: { id: data.userId },
        data: { role: 'vendor' },
      });

      await tx.adminRequest.updateMany({
        where: {
          userId: data.userId,
          type: 'ONBOARDING',
          status: AdminRequestStatus.PENDING,
        },
        data: {
          status: AdminRequestStatus.RESOLVED,
          vendorId: createdVendor.id,
        },
      });

      return createdVendor;
    });

    this.socketGateway.emitToAll('vendor:approved', {
      vendorId: vendor.id,
      role: 'vendor',
      storeName: vendor.storeName,
      userId: vendor.userId,
    });

    const emailNotification = await this.safeSendEmail(
      vendor.user?.email,
      `Welcome to Ingeni Store: Your Storefront "${vendor.storeName}" is Approved & Live!`,
      `<h3>Hello ${vendor.user?.name || 'Valued Partner'},</h3>
       <p>Congratulations! Your vendor profile and store <strong>${vendor.storeName}</strong> have been approved and are now active.</p>
       ${vendor.address ? `<p><strong>Location:</strong> ${vendor.address}</p>` : ''}
       ${vendor.phone ? `<p><strong>Contact Phone:</strong> ${vendor.phone}</p>` : ''}
       <p>You can now sign in to your vendor dashboard, add products, and manage orders.</p>`,
      'vendor-approved',
    );

    return {
      ...vendor,
      emailNotification,
    };
  }

  async requestOnboarding(
    user: { id?: string; name?: string; email?: string },
    businessDescription: string,
  ) {
    const cleanDescription = businessDescription?.trim();
    if (!cleanDescription || cleanDescription.length < 10) {
      throw new BadRequestException(
        'Please provide a detailed business description (minimum 10 characters).',
      );
    }

    if (!user || !user.email) {
      throw new BadRequestException(
        'Authentication context missing or invalid email provided.',
      );
    }

    const dbUser = user.id
      ? await this.prisma.user.findUnique({ where: { id: user.id } })
      : await this.prisma.user.findUnique({ where: { email: user.email } });

    if (dbUser) {
      const existingVendor = await this.prisma.vendor.findUnique({
        where: { userId: dbUser.id },
      });
      if (existingVendor) {
        throw new BadRequestException(
          'You already have an active vendor profile registered.',
        );
      }
    }

    const savedRecord = await this.prisma.adminRequest.create({
      data: {
        userId: dbUser?.id ?? null,
        vendorId: null,
        type: 'ONBOARDING',
        message: cleanDescription,
        status: AdminRequestStatus.PENDING,
      },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
      },
    });

    const applicantName = dbUser?.name || user.name || 'Valued User';
    const applicantEmail = dbUser?.email || user.email;

    const formattedRequest = {
      id: savedRecord.id,
      user: {
        id: dbUser?.id || user.id || `user_${savedRecord.id}`,
        name: applicantName,
        email: applicantEmail,
      },
      businessDescription: savedRecord.message,
      submittedAt: savedRecord.createdAt.toISOString(),
    };

    try {
      await this.emailService.sendVendorOnboardingRequest(
        applicantName,
        applicantEmail,
        cleanDescription,
      );
    } catch (emailError) {
      this.logger.error(
        'Failed to dispatch vendor onboarding admin email:',
        emailError,
      );
    }

    const emailNotification = await this.safeSendEmail(
      applicantEmail,
      'Vendor Onboarding Request Received - Ingeni Store',
      `<h3>Hello ${applicantName},</h3>
       <p>We have received your vendor onboarding request and saved it for admin review.</p>
       <p><strong>Submitted Business Details:</strong></p>
       <blockquote>${cleanDescription}</blockquote>
       <p>We will notify you by email as soon as your application is reviewed.</p>`,
      'onboarding-receipt',
    );

    this.socketGateway.emitToAll('vendor:request-created', formattedRequest);

    return {
      success: true,
      request: formattedRequest,
      emailNotification,
      message:
        'Your vendor onboarding request has been saved and confirmation email sent.',
    };
  }

  async findPendingRequests() {
    const rows = await this.prisma.adminRequest.findMany({
      where: {
        type: 'ONBOARDING',
        status: AdminRequestStatus.PENDING,
      },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return rows.map((row) => ({
      id: row.id,
      user: {
        id: row.user?.id || row.userId || '',
        name: row.user?.name || 'Unnamed User',
        email: row.user?.email || '',
        phone: row.user?.phone || '',
      },
      businessDescription: row.message,
      submittedAt: row.createdAt.toISOString(),
    }));
  }

  async rejectVendorRequest(requestId: string, reason?: string) {
    const existing = await this.prisma.adminRequest.findUnique({
      where: { id: requestId },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    if (!existing) {
      throw new NotFoundException('Vendor request not found.');
    }

    await this.prisma.adminRequest.update({
      where: { id: requestId },
      data: {
        status: AdminRequestStatus.REJECTED,
        ...(reason ? { adminNotes: reason } : {}),
      },
    });

    const emailNotification = await this.safeSendEmail(
      existing.user?.email,
      'Vendor Onboarding Application Update - Ingeni Store',
      `<h3>Hello ${existing.user?.name || 'Valued User'},</h3>
       <p>Thank you for your interest in selling on Ingeni Store. After reviewing your application, your vendor onboarding request was not approved at this time.</p>
       ${reason ? `<p><strong>Notes:</strong> ${reason}</p>` : ''}
       <p>You may reach out to support or submit an updated request in the future.</p>`,
      'onboarding-rejected',
    );

    return { success: true, emailNotification };
  }

  async approveVendorRequest(data: {
    userId: string;
    storeName: string;
    description: string;
    address: string;
    phone: string;
  }) {
    const user = await this.prisma.user.findUnique({
      where: { id: data.userId },
    });
    if (!user) {
      throw new NotFoundException('Associated user account not found.');
    }

    const existingVendor = await this.prisma.vendor.findUnique({
      where: { userId: data.userId },
    });
    if (existingVendor) {
      throw new BadRequestException(
        'A vendor profile already exists for this user account.',
      );
    }

    return this.create({
      storeName: data.storeName,
      description: data.description,
      address: data.address,
      phone: data.phone,
      userId: data.userId,
    });
  }

  async getVendorFinancials(userId: string) {
    const vendor = await this.getVendorById(userId);
    if (!vendor) {
      throw new NotFoundException('Vendor profile not found.');
    }

    const orders = (await this.findVendorOrders(vendor.id)) as Array<{
      totalAmount: number | any;
      paymentMethod: string;
      paymentStatus: string;
      status: string;
      items: Array<{
        quantity: number;
        vendorId?: string;
        vendorEarnings?: number | any;
        priceAtPurchase?: number | any;
        product: {
          vendorId: string;
          price: number | any;
        };
      }>;
    }>;

    let totalRevenue = 0;
    let rawNetEarnings = 0;

    orders.forEach((order) => {
      const isPaid = order.paymentStatus === 'SUCCESS';
      const isDelivered = order.status === 'DELIVERED';

      const vendorItems = order.items.filter(
        (item) => (item.vendorId || item.product.vendorId) === vendor.id,
      );

      vendorItems.forEach((item) => {
        const itemPrice = Number(
          item.priceAtPurchase || item.product.price || 0,
        );
        const qty = Number(item.quantity || 1);
        const lineTotal = itemPrice * qty;

        totalRevenue += lineTotal;

        if (isPaid && isDelivered) {
          const storedEarnings = Number(item.vendorEarnings || 0);
          const computedEarnings =
            storedEarnings > 0 ? storedEarnings : lineTotal * (1 - 0.08);
          rawNetEarnings += computedEarnings;
        }
      });
    });

    const requests = await this.prisma.adminRequest.findMany({
      where: { vendorId: vendor.id },
      orderBy: { createdAt: 'desc' },
    });

    const totalApprovedCashouts = requests
      .filter((req) => req.type === 'CASHOUT' && req.status === 'RESOLVED')
      .reduce((sum, req) => sum + Number(req.amount || 0), 0);

    const netBalance = Math.max(0, rawNetEarnings - totalApprovedCashouts);

    return {
      totalRevenue,
      netBalance,
      requests,
    };
  }

  async toggleVendorStatus(id: string, currentStatus: boolean) {
    const newStatus = !currentStatus;
    const vendor = await this.prisma.vendor.update({
      where: { id },
      data: { isActive: newStatus },
      include: { user: true },
    });

    const emailNotification = await this.safeSendEmail(
      vendor.user?.email,
      `Storefront Status Updated (${newStatus ? 'Active' : 'Paused'}) - Ingeni Store`,
      `<h3>Hello ${vendor.user?.name || 'Valued Partner'},</h3>
       <p>The status of your store <strong>${vendor.storeName}</strong> has been set to <strong>${newStatus ? 'ACTIVE' : 'INACTIVE'}</strong>.</p>`,
      'vendor-status-toggled',
    );

    return {
      ...vendor,
      emailNotification,
    };
  }

  async update(identifier: string, data: any) {
    const { storeName, description, address, phone, isActive } = data;

    let vendor = await this.prisma.vendor.findUnique({
      where: { id: identifier },
      include: { user: true },
    });
    if (!vendor) {
      vendor = await this.prisma.vendor.findUnique({
        where: { userId: identifier },
        include: { user: true },
      });
    }

    if (!vendor) {
      throw new NotFoundException('Vendor profile not found for update.');
    }

    const updatedFields: string[] = [];
    if (storeName !== undefined && storeName !== vendor.storeName)
      updatedFields.push('Store Name');
    if (description !== undefined && description !== vendor.description)
      updatedFields.push('Description');
    if (address !== undefined && address !== vendor.address)
      updatedFields.push('Address');
    if (phone !== undefined && phone !== vendor.phone)
      updatedFields.push('Phone');
    if (isActive !== undefined && isActive !== vendor.isActive)
      updatedFields.push('Store Status');

    const updatedVendor = await this.prisma.vendor.update({
      where: { id: vendor.id },
      data: {
        ...(storeName !== undefined && { storeName }),
        ...(description !== undefined && { description }),
        ...(address !== undefined && { address }),
        ...(phone !== undefined && { phone }),
        ...(isActive !== undefined && { isActive }),
      },
      include: { user: true },
    });

    const recipientEmail = updatedVendor.user?.email;
    const recipientName = updatedVendor.user?.name || 'Valued Partner';

    let emailNotification: EmailDispatchResult = {
      success: false,
      messageId: null,
      reason: 'No recipient email available',
    };

    if (recipientEmail) {
      try {
        emailNotification =
          await this.emailService.sendVendorProfileUpdateAlert(
            recipientEmail,
            recipientName,
            updatedVendor.storeName,
            updatedFields,
          );
      } catch (e) {
        this.logger.error('Failed to email vendor on profile update:', e);
        emailNotification = {
          success: false,
          messageId: null,
          reason: 'SMTP dispatch error',
        };
      }
    }

    return {
      ...updatedVendor,
      emailNotification,
    };
  }

  async remove(id: string) {
    const existing = await this.prisma.vendor.findUnique({
      where: { id },
      include: { user: true },
    });

    const deleted = await this.prisma.vendor.delete({ where: { id } });

    if (existing?.user?.email) {
      await this.safeSendEmail(
        existing.user.email,
        `Vendor Profile Removed - Ingeni Store`,
        `<h3>Hello ${existing.user.name || 'Valued Partner'},</h3>
         <p>Your vendor profile for <strong>${existing.storeName}</strong> has been removed from Ingeni Store.</p>`,
        'vendor-removed',
      );
    }

    return deleted;
  }

  async getVendorMetrics(id: string) {
    const count = await this.prisma.product.count({ where: { vendorId: id } });
    return { productCount: count };
  }

  async updateAdminRequestStatus(
    requestId: string,
    status: string,
    adminNotes?: string,
  ) {
    const request = await this.prisma.adminRequest.findUnique({
      where: { id: requestId },
      include: {
        vendor: { include: { user: true } },
        user: true,
      },
    });

    if (!request) {
      throw new NotFoundException('Admin request record not found.');
    }

    const rawStatus = (status || 'PENDING').trim().toUpperCase();
    let normalizedStatus: AdminRequestStatus;

    switch (rawStatus) {
      case 'APPROVED':
      case 'RESOLVED':
        normalizedStatus = AdminRequestStatus.RESOLVED;
        break;
      case 'PROCESSING':
        normalizedStatus = AdminRequestStatus.PROCESSING;
        break;
      case 'REJECTED':
        normalizedStatus = AdminRequestStatus.REJECTED;
        break;
      case 'PENDING':
        normalizedStatus = AdminRequestStatus.PENDING;
        break;
      default:
        throw new BadRequestException(`Invalid status value: ${status}`);
    }

    const updated = await this.prisma.adminRequest.update({
      where: { id: requestId },
      data: {
        status: normalizedStatus,
        adminNotes: adminNotes || null,
      },
    });

    if (request.vendorId || request.userId) {
      this.socketGateway.emitToAll('admin:request-updated', {
        id: updated.id,
        vendorId: request.vendorId,
        userId: request.userId,
        status: updated.status,
        adminNotes: updated.adminNotes,
        type: updated.type,
      });
    }

    const recipientEmail = request.vendor?.user?.email || request.user?.email;
    const recipientName =
      request.vendor?.storeName || request.user?.name || 'Valued Partner';

    const emailNotification = await this.safeSendEmail(
      recipientEmail,
      `Update on your ${request.type} Request - Ingeni Store`,
      `<h3>Hello ${recipientName},</h3>
       <p>Your request regarding <strong>"${request.message}"</strong> has been updated to: <strong>${normalizedStatus}</strong>.</p>
       ${request.amount ? `<p><strong>Amount:</strong> RWF ${Number(request.amount).toLocaleString()}</p>` : ''}
       ${adminNotes ? `<p><strong>Admin Note:</strong> ${adminNotes}</p>` : ''}`,
      'admin-request-status-updated',
    );

    return {
      ...updated,
      emailNotification,
    };
  }

  async deleteAdminRequest(id: string) {
    const request = await this.prisma.adminRequest.findUnique({
      where: { id },
      include: {
        vendor: { include: { user: true } },
        user: true,
      },
    });

    if (!request) {
      throw new NotFoundException('Admin request record not found.');
    }

    const deleted = await this.prisma.adminRequest.delete({
      where: { id },
    });

    const recipientEmail = request.vendor?.user?.email || request.user?.email;
    const recipientName =
      request.vendor?.storeName || request.user?.name || 'Valued Partner';

    const emailNotification = await this.safeSendEmail(
      recipientEmail,
      `${request.type} Request Archived - Ingeni Store`,
      `<h3>Hello ${recipientName},</h3>
       <p>Your ${request.type} request (<strong>"${request.message}"</strong>) has been archived/closed by the administration team.</p>`,
      'admin-request-deleted',
    );

    return {
      ...deleted,
      emailNotification,
    };
  }

  async findVendorOrders(vendorId?: string) {
    const resolvedVendor = vendorId ? await this.getVendorById(vendorId) : null;
    const targetVendorId = resolvedVendor?.id;

    return this.prisma.order
      .findMany({
        ...(targetVendorId && {
          where: {
            items: {
              some: {
                product: { vendorId: targetVendorId },
              },
            },
            OR: [
              { paymentMethod: 'MOBILE_MONEY' },
              { paymentMethod: 'CASH_ON_DELIVERY', paymentStatus: 'SUCCESS' },
            ],
          },
        }),
        include: {
          items: {
            include: { product: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      })
      .catch(() => []);
  }

  async updateOrderStatus(orderId: string, status: string) {
    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: { status: status as OrderStatus },
      include: {
        items: {
          include: {
            product: {
              include: { vendor: { include: { user: true } } },
            },
          },
        },
      },
    });

    const notifiedEmails = new Set<string>();
    for (const item of updatedOrder.items || []) {
      const vendorEmail = item.product?.vendor?.user?.email;
      const vendorName =
        item.product?.vendor?.storeName ||
        item.product?.vendor?.user?.name ||
        'Vendor';
      if (vendorEmail && !notifiedEmails.has(vendorEmail)) {
        notifiedEmails.add(vendorEmail);
        await this.safeSendEmail(
          vendorEmail,
          `Order #${updatedOrder.orderNumber || updatedOrder.id} Status: ${status} - Ingeni Store`,
          `<h3>Hello ${vendorName},</h3>
           <p>Order <strong>${updatedOrder.orderNumber || updatedOrder.id}</strong> containing your product <strong>${item.product?.title || 'Item'}</strong> is now <strong>${status}</strong>.</p>`,
          'order-status-vendor-alert',
        );
      }
    }

    return updatedOrder;
  }

  async getSettings(userId: string) {
    let vendor = await this.getVendorById(userId);
    if (!vendor) {
      vendor = await this.prisma.vendor.create({
        data: {
          userId: userId,
          storeName: 'Ingeni Store',
          phone: '+250728680460',
          isActive: true,
        },
        include: { products: true, user: true },
      });
    }

    let settings = await this.prisma.vendorSettings.findUnique({
      where: { vendorId: vendor.id },
    });

    if (!settings) {
      settings = await this.prisma.vendorSettings.create({
        data: {
          vendorId: vendor.id,
          storeName: vendor.storeName || 'Ingeni Store',
          ownerName: vendor.user?.name || 'Ingeni Store Representative',
          supportEmail: vendor.user?.email || 'support@ingenistore.rw',
          phone: vendor.phone || '+250728680460',
          momoNumber: '+250728680460',
          theme: 'dark',
          autoAcceptOrders: true,
          emailAlerts: true,
        },
      });
    }

    return settings;
  }

  async updateSettings(userId: string, payload: any) {
    const vendor = await this.getVendorById(userId);
    if (!vendor) {
      throw new NotFoundException(
        'Vendor profile not found for this user account.',
      );
    }

    const cleanPhone = payload.phone?.trim() || null;
    const cleanEmail = payload.supportEmail?.trim() || null;
    const cleanStoreName = payload.storeName?.trim() || null;
    const cleanOwnerName = payload.ownerName?.trim() || null;

    let canUpdateStoreName = false;
    if (cleanStoreName) {
      const storeOwner = await this.prisma.vendor.findFirst({
        where: {
          storeName: cleanStoreName,
          id: { not: vendor.id },
        },
      });
      if (storeOwner) {
        throw new BadRequestException(
          `The store name "${cleanStoreName}" is already used by another store. Please choose a unique store name.`,
        );
      }
      canUpdateStoreName = true;
    }

    let canUpdateUserPhone = false;
    if (cleanPhone) {
      const phoneOwner = await this.prisma.user.findFirst({
        where: {
          phone: cleanPhone,
          id: { not: vendor.userId },
        },
      });
      canUpdateUserPhone = !phoneOwner;
    }

    let canUpdateUserEmail = false;
    if (cleanEmail) {
      const emailOwner = await this.prisma.user.findFirst({
        where: {
          email: cleanEmail,
          id: { not: vendor.userId },
        },
      });
      canUpdateUserEmail = !emailOwner;
    }

    const updatedSettings = await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: vendor.userId },
        data: {
          ...(cleanOwnerName && { name: cleanOwnerName }),
          ...(canUpdateUserEmail && cleanEmail && { email: cleanEmail }),
          ...(canUpdateUserPhone && cleanPhone && { phone: cleanPhone }),
        },
      });

      await tx.vendor.update({
        where: { id: vendor.id },
        data: {
          ...(canUpdateStoreName &&
            cleanStoreName && { storeName: cleanStoreName }),
          ...(cleanPhone && { phone: cleanPhone }),
        },
      });

      return await tx.vendorSettings.upsert({
        where: { vendorId: vendor.id },
        update: {
          storeName:
            canUpdateStoreName && cleanStoreName
              ? cleanStoreName
              : vendor.storeName,
          ownerName: cleanOwnerName ?? vendor.user?.name ?? '',
          supportEmail: cleanEmail ?? vendor.user?.email ?? '',
          phone: cleanPhone ?? vendor.phone ?? '',
          momoNumber: payload.momoNumber?.trim() || cleanPhone || '',
          theme: payload.theme || 'dark',
          autoAcceptOrders: Boolean(payload.autoAcceptOrders ?? true),
          emailAlerts: Boolean(payload.emailAlerts ?? true),
        },
        create: {
          vendorId: vendor.id,
          storeName:
            canUpdateStoreName && cleanStoreName
              ? cleanStoreName
              : vendor.storeName || 'Ingeni Store',
          ownerName:
            cleanOwnerName || vendor.user?.name || 'Ingeni Store Representative',
          supportEmail: cleanEmail || vendor.user?.email || 'support@ingenistore.rw',
          phone: cleanPhone || vendor.phone || '+250728680460',
          momoNumber: payload.momoNumber?.trim() || cleanPhone || '+250728680460',
          theme: payload.theme || 'dark',
          autoAcceptOrders: Boolean(payload.autoAcceptOrders ?? true),
          emailAlerts: Boolean(payload.emailAlerts ?? true),
        },
      });
    });

    const notifyTarget = cleanEmail || vendor.user?.email;
    const emailNotification = await this.safeSendEmail(
      notifyTarget,
      'Storefront Settings Updated - Ingeni Store',
      `<h3>Hello ${cleanOwnerName || vendor.user?.name || 'Valued Partner'},</h3>
       <p>Your store settings for <strong>${updatedSettings.storeName}</strong> have been updated.</p>`,
      'vendor-settings-updated',
    );

    return {
      ...updatedSettings,
      emailNotification,
    };
  }

  async submitAdminRequest(
    userId: string,
    payload: { type: string; amount?: string; message: string },
  ) {
    const cleanMessage = payload?.message?.trim();
    if (!cleanMessage) {
      throw new BadRequestException(
        'Message parameter is required for admin communication.',
      );
    }

    const vendor = await this.prisma.vendor
      .findUnique({
        where: { userId },
      })
      .catch(() => null);

    const requestType =
      payload.type?.trim() || (vendor ? 'SUPPORT' : 'SELLER_REQUEST');

    const created = await this.prisma.adminRequest.create({
      data: {
        vendorId: vendor ? vendor.id : null,
        userId: userId,
        type: requestType,
        amount: payload.amount ? String(payload.amount) : null,
        message: cleanMessage,
        status: AdminRequestStatus.PENDING,
      },
      include: {
        vendor: { select: { storeName: true, phone: true } },
        user: { select: { id: true, name: true, email: true, phone: true } },
      },
    });

    const emailNotification = await this.safeSendEmail(
      created.user?.email,
      `${requestType} Request Submitted - Ingeni Store`,
      `<h3>Hello ${created.user?.name || 'Valued User'},</h3>
       <p>Your <strong>${requestType}</strong> request has been submitted and is currently <strong>PENDING</strong> review.</p>
       ${created.amount ? `<p><strong>Amount:</strong> RWF ${Number(created.amount).toLocaleString()}</p>` : ''}
       <p><strong>Message:</strong> ${cleanMessage}</p>`,
      'admin-request-created',
    );

    return {
      ...created,
      emailNotification,
    };
  }

  async findAllAdminRequests() {
    return this.prisma.adminRequest.findMany({
      include: {
        vendor: { select: { storeName: true, phone: true } },
        user: { select: { id: true, name: true, email: true, phone: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getStorefrontMetrics() {
    const [revenueAgg, activeOrdersCount, productCount] = await Promise.all([
      this.prisma.order
        .aggregate({
          _sum: { totalAmount: true },
        })
        .catch(() => ({ _sum: { totalAmount: 0 } })),

      this.prisma.order
        .count({
          where: { status: { not: OrderStatus.DELIVERED } },
        })
        .catch(() => 0),

      this.prisma.product.count().catch(() => 0),
    ]);

    return {
      revenue: revenueAgg._sum.totalAmount || 0,
      activeOrders: activeOrdersCount,
      productCount: productCount,
    };
  }
}