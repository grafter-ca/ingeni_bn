import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { EmailService, type EmailDispatchResult } from '../libs/nodemail/email.service.js';
import { SocketGateway } from '../socket/socket.gateway.js';
import { OrderStatus, AdminRequestStatus } from '../../generated/prisma/client.js';

@Injectable()
export class VendorsService {
  private readonly logger = new Logger(VendorsService.name);
  private pendingRequestsCache: Array<{
    id: string;
    user: { id: string; name: string; email: string };
    businessDescription: string;
    submittedAt: string;
  }> = [];

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly socketGateway: SocketGateway,
  ) {}

  async findAll() {
    return this.prisma.vendor.findMany({
      include: { user: { select: { email: true, name: true, id: true, phone: true } } },
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
    const user = await this.prisma.user.findUnique({ where: { id: data.userId } });
    if (!user) {
      throw new NotFoundException('Associated user account not found.');
    }

    const existingVendor = await this.prisma.vendor.findUnique({ where: { userId: data.userId } });
    if (existingVendor) {
      throw new BadRequestException('A vendor profile already exists for this user account.');
    }

    const vendor = await this.prisma.vendor.create({
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

    await this.prisma.user.update({
      where: { id: data.userId },
      data: { role: 'vendor' },
    });

    this.socketGateway.emitToAll('vendor:approved', {
      vendorId: vendor.id,
      role: 'vendor',
      storeName: vendor.storeName,
      userId: vendor.userId,
    });

    this.pendingRequestsCache = this.pendingRequestsCache.filter((req) => req.user.id !== data.userId);

    let emailNotification: EmailDispatchResult = {
      success: false,
      messageId: null,
      reason: 'No email address on user account',
    };

    if (vendor.user?.email) {
      try {
        emailNotification = await this.emailService.sendMail(
          vendor.user.email,
          `Welcome to the Storefront: ${vendor.storeName} is Live!`,
          `<h3>Hello ${vendor.user.name || 'Valued Partner'},</h3>
           <p>Your store <strong>${vendor.storeName}</strong> has been successfully set up by the administration team.</p>`,
        );
      } catch (emailError) {
        this.logger.error('Failed to send vendor approval email:', emailError);
        emailNotification = { success: false, messageId: null, reason: 'SMTP dispatch error' };
      }
    }

    return {
      ...vendor,
      emailNotification,
    };
  }

  async requestOnboarding(
    user: { id?: string; name?: string; email?: string },
    businessDescription: string,
  ) {
    if (!businessDescription || businessDescription.trim().length < 10) {
      throw new BadRequestException(
        'Please provide a detailed business description (minimum 10 characters).',
      );
    }

    if (!user || !user.email) {
      throw new BadRequestException('Authentication context missing or invalid email provided.');
    }

    if (user.id) {
      const existingVendor = await this.prisma.vendor.findUnique({ where: { userId: user.id } });
      if (existingVendor) {
        throw new BadRequestException('You already have an active vendor profile registered.');
      }
    }

    const userId = user.id || `temp-${Date.now()}`;
    const userName = user.name || 'Valued User';
    const userEmail = user.email;

    const newRequest = {
      id: 'req_' + Date.now(),
      user: { id: userId, name: userName, email: userEmail },
      businessDescription,
      submittedAt: new Date().toISOString(),
    };

    this.pendingRequestsCache.unshift(newRequest);

    try {
      await this.emailService.sendVendorOnboardingRequest(userName, userEmail, businessDescription);
    } catch (emailError) {
      this.logger.error('Failed to dispatch vendor onboarding email:', emailError);
    }

    this.socketGateway.emitToAll('vendor:request-created', newRequest);

    return {
      success: true,
      message: 'Your vendor onboarding request has been successfully submitted.',
    };
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
        const itemPrice = Number(item.priceAtPurchase || item.product.price || 0);
        const qty = Number(item.quantity || 1);
        const lineTotal = itemPrice * qty;

        totalRevenue += lineTotal;

        if (isPaid && isDelivered) {
          const storedEarnings = Number(item.vendorEarnings || 0);
          const computedEarnings = storedEarnings > 0 ? storedEarnings : lineTotal * (1 - 0.08);
          rawNetEarnings += computedEarnings;
        }
      });
    });

    const requests = await this.prisma.adminRequest.findMany({
      where: { vendorId: vendor.id },
      orderBy: { createdAt: 'desc' },
    });

    const totalApprovedCashouts = requests
      .filter((req) => req.type === 'CASHOUT' && req.status === 'APPROVED')
      .reduce((sum, req) => sum + Number(req.amount || 0), 0);

    const netBalance = Math.max(0, rawNetEarnings - totalApprovedCashouts);

    return {
      totalRevenue,
      netBalance,
      requests,
    };
  }

  async findPendingRequests() {
    return this.pendingRequestsCache;
  }

  async rejectVendorRequest(requestId: string) {
    this.pendingRequestsCache = this.pendingRequestsCache.filter((req) => req.id !== requestId);
    return { success: true };
  }

  async approveVendorRequest(data: {
    userId: string;
    storeName: string;
    description: string;
    address: string;
    phone: string;
  }) {
    const user = await this.prisma.user.findUnique({ where: { id: data.userId } });
    if (!user) {
      throw new NotFoundException('Associated user account not found.');
    }

    const existingVendor = await this.prisma.vendor.findUnique({ where: { userId: data.userId } });
    if (existingVendor) {
      throw new BadRequestException('A vendor profile already exists for this user account.');
    }

    if (user.email) {
      try {
        await this.emailService.sendMail(
          user.email,
          'Your Vendor Profile Has Been Approved',
          `<h3>Hello ${user.name},</h3>
           <p>Congratulations! Your vendor profile for <strong>${data.storeName}</strong> has been approved.</p>
           <p>You can now start listing your products and serving your customers.</p>`,
        );
      } catch (e) {
        this.logger.error('Failed to email vendor on profile approval:', e);
      }
    }

    return this.create({
      storeName: data.storeName,
      description: data.description,
      address: data.address,
      phone: data.phone,
      userId: data.userId,
    });
  }

  async toggleVendorStatus(id: string, currentStatus: boolean) {
    const newStatus = !currentStatus;
    const vendor = await this.prisma.vendor.update({
      where: { id },
      data: { isActive: newStatus },
      include: { user: true },
    });

    return vendor;
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
    if (storeName !== undefined && storeName !== vendor.storeName) updatedFields.push('Store Name');
    if (description !== undefined && description !== vendor.description) updatedFields.push('Description');
    if (address !== undefined && address !== vendor.address) updatedFields.push('Address');
    if (phone !== undefined && phone !== vendor.phone) updatedFields.push('Phone');
    if (isActive !== undefined && isActive !== vendor.isActive) updatedFields.push('Store Status');

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
        emailNotification = await this.emailService.sendVendorProfileUpdateAlert(
          recipientEmail,
          recipientName,
          updatedVendor.storeName,
          updatedFields,
        );
      } catch (e) {
        this.logger.error('Failed to email vendor on profile update:', e);
        emailNotification = { success: false, messageId: null, reason: 'SMTP dispatch error' };
      }
    }

    return {
      ...updatedVendor,
      emailNotification,
    };
  }

  async remove(id: string) {
    return this.prisma.vendor.delete({ where: { id } });
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
    const recipientName = request.vendor?.storeName || request.user?.name || 'Valued Partner';

    let emailNotification: EmailDispatchResult = {
      success: false,
      messageId: null,
      reason: 'No recipient email available',
    };

    if (recipientEmail) {
      try {
        emailNotification = await this.emailService.sendMail(
          recipientEmail,
          `Update on your ${request.type} Request - Ingeni Store`,
          `<h3>Hello ${recipientName},</h3>
           <p>Your request regarding <strong>"${request.message}"</strong> has been updated to: <strong>${normalizedStatus}</strong>.</p>
           ${adminNotes ? `<p><strong>Admin Note:</strong> ${adminNotes}</p>` : ''}`,
        );
      } catch (e) {
        this.logger.error('Failed to email vendor/user on request status change:', e);
        emailNotification = { success: false, messageId: null, reason: 'SMTP dispatch error' };
      }
    }

    return {
      ...updated,
      emailNotification,
    };
  }

  async deleteAdminRequest(id: string) {
    const request = await this.prisma.adminRequest.findUnique({
      where: { id },
    });

    if (!request) {
      throw new NotFoundException('Admin request record not found.');
    }

    return this.prisma.adminRequest.delete({
      where: { id },
    });
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
    return this.prisma.order.update({
      where: { id: orderId },
      data: { status: status as OrderStatus },
    });
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
      throw new NotFoundException('Vendor profile not found for this user account.');
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

    return await this.prisma.$transaction(async (tx) => {
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
          ...(canUpdateStoreName && cleanStoreName && { storeName: cleanStoreName }),
          ...(cleanPhone && { phone: cleanPhone }),
        },
      });

      return await tx.vendorSettings.upsert({
        where: { vendorId: vendor.id },
        update: {
          storeName: canUpdateStoreName && cleanStoreName ? cleanStoreName : vendor.storeName,
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
          ownerName: cleanOwnerName || vendor.user?.name || 'Ingeni Store Representative',
          supportEmail: cleanEmail || vendor.user?.email || 'support@ingenistore.rw',
          phone: cleanPhone || vendor.phone || '+250728680460',
          momoNumber: payload.momoNumber?.trim() || cleanPhone || '+250728680460',
          theme: payload.theme || 'dark',
          autoAcceptOrders: Boolean(payload.autoAcceptOrders ?? true),
          emailAlerts: Boolean(payload.emailAlerts ?? true),
        },
      });
    });
  }

  async submitAdminRequest(
    userId: string,
    payload: { type: string; amount?: string; message: string },
  ) {
    if (!payload.message) {
      throw new BadRequestException('Message parameter is required for admin communication.');
    }

    const vendor = await this.prisma.vendor
      .findUnique({
        where: { userId },
      })
      .catch(() => null);

    return this.prisma.adminRequest.create({
      data: {
        vendorId: vendor ? vendor.id : null,
        userId: userId,
        type: payload.type || 'CASHOUT',
        amount: payload.amount ? String(payload.amount) : null,
        message: payload.message,
        status: 'PENDING',
      },
    });
  }

  async findAllAdminRequests() {
    return this.prisma.adminRequest.findMany({
      include: {
        vendor: { select: { storeName: true, phone: true } },
        user: { select: { name: true, email: true, phone: true } },
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