// src/orders/orders.service.ts
import {
  BadRequestException,
  ForbiddenException,
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
  CommissionStatus,
  OrderStatus,
  PaymentStatus,
  AdminRequestStatus,
} from '../../generated/prisma/client.js';

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);
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

  private async safeSendOrderEmail(
    sendFn: () => Promise<EmailDispatchResult>,
    contextLabel: string,
  ): Promise<EmailDispatchResult> {
    try {
      return await sendFn();
    } catch (error) {
      this.logger.error(`Failed to send order email (${contextLabel}):`, error);
      return { success: false, messageId: null, reason: 'SMTP dispatch error' };
    }
  }

  // ==========================================
  // ORDER LIFECYCLE & TRACKING METHODS
  // ==========================================

  async createOrder(userId: string | undefined, dto: any) {
    if (!dto?.items || !Array.isArray(dto.items) || dto.items.length === 0) {
      throw new BadRequestException('Order must contain at least one valid item.');
    }

    if (!userId) {
      throw new BadRequestException('User identification is required to place an order.');
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User account not found.');
    }

    const productIds = dto.items.map((item: any) => item.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));
    const orderNumber = `ISORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const transactionRef = `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    const vendorRevenueMap = new Map<string, number>();

    const orderItemsData = dto.items.map((item: any) => {
      const product = productMap.get(item.productId);
      if (!product) {
        throw new BadRequestException(`Product with ID ${item.productId} not found.`);
      }

      const priceAtPurchase = Number(product.price);
      const quantity = Number(item.quantity) || 1;
      const lineTotal = priceAtPurchase * quantity;

      const commissionRate = 0.08; // 8% platform take
      const commissionAmount = lineTotal * commissionRate;
      const vendorEarnings = lineTotal - commissionAmount;

      const vendorId = product.vendorId;
      const currentVendorTotal = vendorRevenueMap.get(vendorId) || 0;
      vendorRevenueMap.set(vendorId, currentVendorTotal + vendorEarnings);

      return {
        productId: product.id,
        vendorId,
        quantity,
        priceAtPurchase,
        commissionRate,
        commissionAmount,
        vendorEarnings,
        payoutStatus: CommissionStatus.PENDING,
        fulfillmentStatus: OrderStatus.PENDING,
      };
    });

    const fulfillmentsData = Array.from(vendorRevenueMap.entries()).map(
      ([vendorId, revenue]) => ({
        vendorId,
        status: OrderStatus.PENDING,
        revenue,
      }),
    );

    const totalAmount =
      dto.totalAmount !== undefined && dto.totalAmount !== null
        ? Number(dto.totalAmount)
        : orderItemsData.reduce(
            (acc, i) => acc + Number(i.priceAtPurchase) * i.quantity,
            0,
          );
    const taxAmount = dto.taxAmount ? Number(dto.taxAmount) : 0;
    const shippingFees = dto.shippingFees ? Number(dto.shippingFees) : 0;

    const cleanProofUrl =
      typeof dto.paymentProofUrl === 'string' && dto.paymentProofUrl.trim().length > 0
        ? dto.paymentProofUrl.trim()
        : null;

    const initialPaymentStatus = cleanProofUrl
      ? PaymentStatus.PENDING
      : PaymentStatus.INITIALIZED;

    const createdOrder = await this.prisma.$transaction(async (tx) => {
      return await tx.order.create({
        data: {
          orderNumber,
          userId,
          email: dto.email || user.email,
          phoneNumber: dto.phoneNumber || user.phone || '+250000000000',
          shippingAddress: dto.shippingAddress || 'Standard Pickup',
          paymentMethod: dto.paymentMethod || 'MOBILE_MONEY',
          totalAmount,
          taxAmount,
          shippingFees,
          status: OrderStatus.PENDING,
          paymentStatus: initialPaymentStatus,
          items: {
            create: orderItemsData,
          },
          fulfillments: {
            create: fulfillmentsData,
          },
          payment: {
            create: {
              userId,
              transactionRef,
              amount: totalAmount,
              status: initialPaymentStatus,
              provider: dto.provider || dto.paymentMethod || 'MOBILE_MONEY',
              paymentProofUrl: cleanProofUrl,
            },
          },
        },
        include: {
          items: { include: { product: true } },
          fulfillments: true,
          payment: true,
          user: true,
        },
      });
    });

    const customerEmail = createdOrder.email || createdOrder.user?.email;
    const customerName = createdOrder.user?.name || 'Valued Customer';
    const summaryItems = (createdOrder.items || []).map((item: any) => ({
      title:
        item.product?.title ||
        item.product?.name ||
        `Item (${item.productId})`,
      quantity: item.quantity,
      priceAtPurchase: Number(item.priceAtPurchase),
    }));

    const emailNotification: EmailDispatchResult = customerEmail
      ? await this.safeSendOrderEmail(
          () =>
            this.emailService.sendOrderConfirmationEmail(
              customerEmail,
              customerName,
              createdOrder.orderNumber,
              Number(createdOrder.totalAmount),
              summaryItems,
            ),
          `order ${createdOrder.orderNumber} creation`,
        )
      : { success: false, messageId: null, reason: 'No customer email' };

    return {
      ...createdOrder,
      emailNotification,
    };
  }

  async submitPaymentProof(
    orderId: string,
    proofUrl: string,
    transactionReference?: string,
  ) {
    const cleanProofUrl = (proofUrl || '').trim();
    if (!cleanProofUrl) {
      throw new BadRequestException('A valid payment proof URL is required.');
    }

    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { payment: true, user: true },
    });

    if (!order) {
      throw new NotFoundException('Order record not found.');
    }

    const updatedOrder = await this.prisma.$transaction(async (tx) => {
      const nextOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: PaymentStatus.PENDING,
        },
        include: {
          items: { include: { product: true } },
          payment: true,
          user: true,
        },
      });

      if (order.payment) {
        await tx.payment.update({
          where: { id: order.payment.id },
          data: {
            status: PaymentStatus.PENDING,
            paymentProofUrl: cleanProofUrl,
            transactionRef: transactionReference || order.payment.transactionRef,
          },
        });
      }

      return nextOrder;
    });

    const customerEmail = updatedOrder.email || updatedOrder.user?.email;
    const customerName = updatedOrder.user?.name || 'Valued Customer';

    const emailNotification: EmailDispatchResult = customerEmail
      ? await this.safeSendOrderEmail(
          () =>
            this.emailService.sendPaymentUpdateEmail(
              customerEmail,
              customerName,
              updatedOrder.orderNumber,
              PaymentStatus.PENDING,
              'Your payment proof has been received and is pending verification.',
            ),
          `order ${updatedOrder.orderNumber} payment proof`,
        )
      : { success: false, messageId: null, reason: 'No customer email' };

    return {
      success: true,
      message:
        'Payment proof uploaded successfully. Status is now pending admin verification.',
      order: updatedOrder,
      emailNotification,
    };
  }

  async getOrdersByUser(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: {
        items: { include: { product: true } },
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

async getVendorIdByUserId(userId: string) {
  const vendor = await this.prisma.vendor.findUnique({
    where: { userId },
    select: { id: true },
  });
  return vendor ? vendor.id : null;
}

  async getOrdersForVendor(vendorId?: string) {
    return this.findVendorOrders(vendorId);
  }

  async getAllOrders(status?: string) {
    return this.prisma.order.findMany({
      where: status ? { status: status as OrderStatus } : undefined,
      include: {
        items: { include: { product: true } },
        payment: true,
        user: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: { include: { product: true } },
        payment: true,
        user: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order record not found.');
    }
    return order;
  }

  async updatePaymentStatus(id: string, paymentStatus: PaymentStatus) {
    const existingOrder = await this.prisma.order.findUnique({
      where: { id },
      include: { user: true, payment: true },
    });

    if (!existingOrder) {
      throw new NotFoundException('Order record not found.');
    }

    const updatedOrder = await this.prisma.$transaction(async (tx) => {
      if (existingOrder.payment) {
        await tx.payment.update({
          where: { id: existingOrder.payment.id },
          data: { status: paymentStatus },
        });
      }

      return tx.order.update({
        where: { id },
        data: { paymentStatus },
        include: { user: true, payment: true },
      });
    });

    const customerEmail = updatedOrder.email || updatedOrder.user?.email;
    const customerName = updatedOrder.user?.name || 'Valued Customer';
    const statusChanged = existingOrder.paymentStatus !== paymentStatus;

    const emailNotification: EmailDispatchResult =
      customerEmail && statusChanged
        ? await this.safeSendOrderEmail(
            () =>
              this.emailService.sendPaymentUpdateEmail(
                customerEmail,
                customerName,
                updatedOrder.orderNumber,
                String(paymentStatus),
              ),
            `order ${updatedOrder.orderNumber} payment ${paymentStatus}`,
          )
        : {
            success: false,
            messageId: null,
            reason: statusChanged ? 'No customer email' : 'Payment status unchanged',
          };

    return {
      ...updatedOrder,
      emailNotification,
    };
  }

  async updateStatus(orderId: string, status: OrderStatus) {
    const existingOrder = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true },
    });

    if (!existingOrder) {
      throw new NotFoundException('Order record not found.');
    }

    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: { items: true, payment: true, user: true },
    });

    await this.prisma.orderItem.updateMany({
      where: { orderId },
      data: { fulfillmentStatus: status },
    });

    await this.prisma.orderHistory.create({
      data: {
        orderId,
        status,
      },
    });

    const recipientEmail = updatedOrder.email || updatedOrder.user?.email;
    const recipientName = updatedOrder.user?.name || 'Valued Customer';
    const statusChanged = existingOrder.status !== status;

    const emailNotification: EmailDispatchResult =
      recipientEmail && statusChanged
        ? await this.safeSendOrderEmail(
            () =>
              this.emailService.sendOrderTrackingUpdateEmail(
                recipientEmail,
                recipientName,
                updatedOrder.orderNumber,
                String(status),
                updatedOrder.paymentStatus,
              ),
            `order ${updatedOrder.orderNumber} status ${status}`,
          )
        : {
            success: false,
            messageId: null,
            reason: statusChanged ? 'No customer email' : 'Order status unchanged',
          };

    return {
      ...updatedOrder,
      emailNotification,
    };
  }

  // ==========================================
  // VENDOR / ADMIN METHODS
  // ==========================================

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
    momoCode?: string | null;
  }) {
    const user = await this.prisma.user.findUnique({ where: { id: data.userId } });
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

    const vendor = await this.prisma.vendor.create({
      data: {
        storeName: data.storeName,
        userId: data.userId,
        description: data.description,
        address: data.address,
        phone: data.phone,
        ...(data.momoCode !== undefined && { momoCode: data.momoCode }),
        isActive: true,
      },
      include: { user: true },
    });

    this.pendingRequestsCache = this.pendingRequestsCache.filter(
      (req) => req.user.id !== data.userId,
    );

    if (vendor.user?.email) {
      await this.safeSendOrderEmail(
        () =>
          this.emailService.sendMail(
            vendor.user.email,
            `Welcome to the Storefront: ${vendor.storeName} is Live!`,
            `<h3>Hello ${vendor.user.name || 'Valued Partner'},</h3>
             <p>Your store <strong>${vendor.storeName}</strong> has been successfully set up by the administration team.</p>`,
          ),
        `vendor ${vendor.storeName} creation`,
      );
    }

    return vendor;
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
      throw new BadRequestException(
        'Authentication context missing or invalid email provided.',
      );
    }

    if (user.id) {
      const existingVendor = await this.prisma.vendor.findUnique({
        where: { userId: user.id },
      });
      if (existingVendor) {
        throw new BadRequestException(
          'You already have an active vendor profile registered.',
        );
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

    await this.safeSendOrderEmail(
      () =>
        this.emailService.sendVendorOnboardingRequest(
          userName,
          userEmail,
          businessDescription,
        ),
      `onboarding request ${userEmail}`,
    );

    this.socketGateway.emitToAll('vendor:request-created', newRequest);

    return {
      success: true,
      message: 'Your vendor onboarding request has been successfully submitted.',
    };
  }

  async findPendingRequests() {
    return this.pendingRequestsCache;
  }

  async rejectVendorRequest(requestId: string) {
    this.pendingRequestsCache = this.pendingRequestsCache.filter(
      (req) => req.id !== requestId,
    );
    return { success: true };
  }

  async approveVendorRequest(data: {
    userId: string;
    storeName: string;
    description: string;
    address: string;
    phone: string;
    momoCode?: string;
  }) {
    return this.create(data);
  }

  async toggleVendorStatus(id: string, currentStatus: boolean) {
    const newStatus = !currentStatus;
    return this.prisma.vendor.update({
      where: { id },
      data: { isActive: newStatus },
      include: { user: true },
    });
  }

  async update(id: string, data: any) {
    const { storeName, description, address, phone, momoCode, isActive } = data;
    return this.prisma.vendor.update({
      where: { id },
      data: {
        ...(storeName !== undefined && { storeName }),
        ...(description !== undefined && { description }),
        ...(address !== undefined && { address }),
        ...(phone !== undefined && { phone }),
        ...(momoCode !== undefined && { momoCode }),
        ...(isActive !== undefined && { isActive }),
      },
    });
  }

  async markCashOrderAsPaid(orderId: string, vendorId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: true,
        items: {
          include: { product: true },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found.');
    }

    const belongsToVendor = order.items.some(
      (item) => item.product.vendorId === vendorId,
    );

    if (!belongsToVendor) {
      throw new ForbiddenException(
        'You are not authorized to update this order.',
      );
    }

    if (order.paymentMethod !== 'CASH_ON_DELIVERY') {
      throw new BadRequestException(
        'This order is not a Cash on Delivery order.',
      );
    }

    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: { paymentStatus: PaymentStatus.SUCCESS },
      include: { user: true },
    });

    const customerEmail = updatedOrder.email || updatedOrder.user?.email;
    const customerName = updatedOrder.user?.name || 'Valued Customer';
    const wasNotPaid = order.paymentStatus !== PaymentStatus.SUCCESS;

    const emailNotification: EmailDispatchResult =
      customerEmail && wasNotPaid
        ? await this.safeSendOrderEmail(
            () =>
              this.emailService.sendPaymentUpdateEmail(
                customerEmail,
                customerName,
                updatedOrder.orderNumber,
                PaymentStatus.SUCCESS,
                'Your Cash on Delivery payment has been confirmed.',
              ),
            `COD order ${updatedOrder.orderNumber} paid`,
          )
        : {
            success: false,
            messageId: null,
            reason: wasNotPaid ? 'No customer email' : 'Already marked paid',
          };

    return {
      success: true,
      message:
        'Cash payment successfully registered and added to financial ledger.',
      order: updatedOrder,
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

  async findAllAdminRequests() {
    return this.prisma.adminRequest.findMany({
      include: {
        vendor: { select: { storeName: true, phone: true } },
        user: { select: { name: true, email: true, phone: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
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

    const recipientEmail = request.vendor?.user?.email || request.user?.email;
    const recipientName =
      request.vendor?.storeName || request.user?.name || 'Valued Partner';

    const emailNotification: EmailDispatchResult = recipientEmail
      ? await this.safeSendOrderEmail(
          () =>
            this.emailService.sendMail(
              recipientEmail,
              `Update on your ${request.type} Request - Ingeni Store`,
              `<h3>Hello ${recipientName},</h3>
               <p>Your request regarding <strong>"${request.message}"</strong> has been updated to: <strong>${normalizedStatus}</strong>.</p>
               ${adminNotes ? `<p><strong>Admin Note:</strong> ${adminNotes}</p>` : ''}`,
            ),
          `admin request ${requestId} status ${normalizedStatus}`,
        )
      : { success: false, messageId: null, reason: 'No recipient email' };

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

    const recipientEmail = request.vendor?.user?.email || request.user?.email;
    const recipientName =
      request.vendor?.storeName || request.user?.name || 'Valued Partner';

    if (recipientEmail) {
      await this.safeSendOrderEmail(
        () =>
          this.emailService.sendMail(
            recipientEmail,
            `Your ${request.type} Request has been Deleted - Ingeni Store`,
            `<h3>Hello ${recipientName},</h3>
             <p>Your request regarding <strong>"${request.message}"</strong> has been deleted by the administration team.</p>`,
          ),
        `admin request ${id} deleted`,
      );
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
                vendorId: targetVendorId,
              },
            },
          },
        }),
        include: {
          items: {
            where: targetVendorId ? { vendorId: targetVendorId } : undefined,
            include: { product: true, vendor: true },
          },
          payment: true,
        },
        orderBy: { createdAt: 'desc' },
      })
      .catch(() => []);
  }

  async getSettings(userId: string) {
    let vendor = await this.getVendorById(userId);
    if (!vendor) {
      vendor = await this.prisma.vendor.create({
        data: {
          userId,
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

    return this.prisma.vendorSettings.upsert({
      where: { vendorId: vendor.id },
      update: {
        ...(payload.storeName !== undefined && { storeName: payload.storeName }),
        ...(payload.ownerName !== undefined && { ownerName: payload.ownerName }),
        ...(payload.supportEmail !== undefined && {
          supportEmail: payload.supportEmail,
        }),
        ...(payload.phone !== undefined && { phone: payload.phone }),
        ...(payload.momoNumber !== undefined && {
          momoNumber: payload.momoNumber,
        }),
        ...(payload.momoCode !== undefined && { momoCode: payload.momoCode }),
        ...(payload.theme !== undefined && { theme: payload.theme }),
        ...(payload.autoAcceptOrders !== undefined && {
          autoAcceptOrders: payload.autoAcceptOrders,
        }),
        ...(payload.emailAlerts !== undefined && {
          emailAlerts: payload.emailAlerts,
        }),
      },
      create: {
        vendorId: vendor.id,
        storeName: payload.storeName || vendor.storeName || 'Ingeni Store',
        ownerName: payload.ownerName || 'Ingeni Store Representative',
        supportEmail: payload.supportEmail || 'support@ingenistore.rw',
        phone: payload.phone || '+250728680460',
        momoNumber: payload.momoNumber || '+250728680460',
        ...(payload.momoCode !== undefined && { momoCode: payload.momoCode }),
        theme: payload.theme || 'dark',
        autoAcceptOrders: payload.autoAcceptOrders ?? true,
        emailAlerts: payload.emailAlerts ?? true,
      },
    });
  }

  async submitAdminRequest(
    userId: string,
    payload: { type: string; amount?: string; message: string },
  ) {
    const vendor = await this.getVendorById(userId);
    if (!vendor) {
      throw new NotFoundException(
        'Vendor profile not found for this user account.',
      );
    }

    if (!payload.message) {
      throw new BadRequestException(
        'Message parameter is required for admin communication.',
      );
    }

    return this.prisma.adminRequest.create({
      data: {
        vendorId: vendor.id,
        type: payload.type || 'CASHOUT',
        amount: payload.amount ? String(payload.amount) : null,
        message: payload.message,
        status: 'PENDING',
      },
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
      productCount,
    };
  }
}