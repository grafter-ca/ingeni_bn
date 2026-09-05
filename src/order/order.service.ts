import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { EmailService } from '../libs/nodemail/email.service.js';
import { SocketGateway } from '../socket/socket.gateway.js';
import { OrderStatus, PaymentStatus } from '../../generated/prisma/index.js';

@Injectable()
export class OrderService {
  private pendingRequestsCache: Array<{
    id: string;
    user: { id: string; name: string; email: string };
    businessDescription: string;
    submittedAt: string;
  }> = [];

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly socketGateway: SocketGateway
  ) {}

  // ==========================================
  // ADDED METHODS TO MATCH ORDER CONTROLLER
  // ==========================================

async createOrder(userId: string | undefined, dto: any) {

  if (!dto?.items || !Array.isArray(dto.items) || dto.items.length === 0) {
      throw new BadRequestException('Order must contain at least one valid item.');
    }

    return this.prisma.order.create({
      data: {
        userId: userId || null,
        totalAmount:dto.totalAmount ? Number(dto.totalAmount) : 0,
        shippingAddress: dto.shippingAddress || '',
        status: OrderStatus.PENDING,
        paymentStatus: PaymentStatus.INITIALIZED,
        items: {
          create: dto.items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity || 1,
            price: item.price || 0,
            vendorId: item.vendorId || null,
          })),
        },
      } as any,
      include: { items: { include: { product: true } } },
    });
  }

  async getOrdersByUser(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getVendorIdByUserId(userId: string) {
    const vendor = await this.getVendorById(userId);
    return vendor ? vendor.id : null;
  }

  async getOrdersForVendor(vendorId?: string) {
    return this.findVendorOrders(vendorId);
  }

  async getAllOrders(status?: string) {
    return this.prisma.order.findMany({
      where: status ? { status: status as OrderStatus } : undefined,
      include: { items: { include: { product: true } }, user: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { items: { include: { product: true } }, user: true },
    });

    if (!order) {
      throw new NotFoundException('Order record not found.');
    }
    return order;
  }

  async updatePaymentStatus(id: string, paymentStatus: PaymentStatus) {
    return this.prisma.order.update({
      where: { id },
      data: { paymentStatus },
    });
  }

  async updateStatus(id: string, status: OrderStatus) {
    return this.prisma.order.update({
      where: { id },
      data: { status },
    });
  }

  // ==========================================
  // YOUR EXISTING VENDOR / ADMIN METHODS
  // ==========================================

  async findAll() {
    return this.prisma.vendor.findMany({
      include: { user: { select: { email: true, name: true, id: true } } },
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

  async create(data: { storeName: string; userId: string; description?: string; address?: string; phone?: string }) {
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
      include: { user: true },
    });

    this.pendingRequestsCache = this.pendingRequestsCache.filter(req => req.user.id !== data.userId);

    try {
      await this.emailService.sendMail(
        vendor.user.email,
        `Welcome to the Storefront: ${vendor.storeName} is Live!`,
        `<h3>Hello ${vendor.user.name || 'Valued Partner'},</h3>
         <p>Your store <strong>${vendor.storeName}</strong> has been successfully set up by the administration team.</p>`
      );
    } catch (emailError) {
      console.error('Failed to send vendor approval email:', emailError);
    }

    return vendor;
  }

  async requestOnboarding(user: { id?: string; name?: string; email?: string }, businessDescription: string) {
    if (!businessDescription || businessDescription.trim().length < 10) {
      throw new BadRequestException('Please provide a detailed business description (minimum 10 characters).');
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
      console.error('Failed to dispatch vendor onboarding email:', emailError);
    }

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
    this.pendingRequestsCache = this.pendingRequestsCache.filter(req => req.id !== requestId);
    return { success: true };
  }

  async approveVendorRequest(data: { userId: string; storeName: string; description: string; address: string; phone: string }) {
    return this.create(data);
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

  async update(id: string, data: any) {
    const { storeName, description, address, phone, isActive } = data;
    return this.prisma.vendor.update({
      where: { id },
      data: {
        storeName,
        description,
        address,
        phone,
        ...(isActive !== undefined && { isActive }),
      },
    });
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
      include: { vendor: { select: { storeName: true, phone: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateAdminRequestStatus(requestId: string, status: string, adminNotes?: string) {
    const request = await this.prisma.adminRequest.findUnique({
      where: { id: requestId },
      include: { vendor: { include: { user: true } } },
    });

    if (!request) {
      throw new NotFoundException('Admin request record not found.');
    }

    const updated = await this.prisma.adminRequest.update({
      where: { id: requestId },
      data: {
        status: status.toUpperCase(),
        adminNotes: adminNotes || null,
      },
    });

    if (request.vendor?.user?.email) {
      try {
        await this.emailService.sendMail(
          request.vendor.user.email,
          `Update on your ${request.type} Request - Ingeni Store`,
          `<h3>Hello ${request.vendor.storeName},</h3>
           <p>Your request regarding <strong>"${request.message}"</strong> has been updated to: <strong>${status.toUpperCase()}</strong>.</p>
           ${adminNotes ? `<p><strong>Admin Note:</strong> ${adminNotes}</p>` : ''}`
        );
      } catch (e) {
        console.error('Failed to email vendor on request status change:', e);
      }
    }

    return updated;
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

    return this.prisma.order.findMany({
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
          include: { product: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    }).catch(() => []);
  }

  async getSettings(userId: string) {
    let vendor = await this.getVendorById(userId);
    if (!vendor) {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      vendor = await this.prisma.vendor.create({
        data: {
          userId: userId,
          storeName: "Ingeni Store",
          phone: "+250728680460",
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
          storeName: vendor.storeName || "Ingeni Store",
          ownerName: vendor.user?.name || "Ingeni Store Representative",
          supportEmail: vendor.user?.email || "support@ingenistore.rw",
          phone: vendor.phone || "+250728680460",
          momoNumber: "+250728680460",
          theme: "dark",
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

    return this.prisma.vendorSettings.upsert({
      where: { vendorId: vendor.id },
      update: {
        storeName: payload.storeName,
        ownerName: payload.ownerName,
        supportEmail: payload.supportEmail,
        phone: payload.phone,
        momoNumber: payload.momoNumber,
        theme: payload.theme,
        autoAcceptOrders: payload.autoAcceptOrders,
        emailAlerts: payload.emailAlerts,
      },
      create: {
        vendorId: vendor.id,
        storeName: payload.storeName || vendor.storeName || "Ingeni Store",
        ownerName: payload.ownerName || "Ingeni Store Representative",
        supportEmail: payload.supportEmail || "support@ingenistore.rw",
        phone: payload.phone || "+250728680460",
        momoNumber: payload.momoNumber || "+250728680460",
        theme: payload.theme || "dark",
        autoAcceptOrders: payload.autoAcceptOrders ?? true,
        emailAlerts: payload.emailAlerts ?? true,
      },
    });
  }

  async submitAdminRequest(userId: string, payload: { type: string; amount?: string; message: string }) {
    const vendor = await this.getVendorById(userId);
    if (!vendor) {
      throw new NotFoundException('Vendor profile not found for this user account.');
    }

    if (!payload.message) {
      throw new BadRequestException('Message parameter is required for admin communication.');
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
      this.prisma.order.aggregate({
        _sum: { totalAmount: true },
      }).catch(() => ({ _sum: { totalAmount: 0 } })), 
      
      this.prisma.order.count({
        where: { status: { not: OrderStatus.DELIVERED } },
      }).catch(() => 0),
      
      this.prisma.product.count().catch(() => 0),
    ]);

    return {
      revenue: revenueAgg._sum.totalAmount || 0,
      activeOrders: activeOrdersCount,
      productCount: productCount,
    };
  }
}