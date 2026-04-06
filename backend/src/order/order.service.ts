import { Injectable, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { OrderStatus } from '../../generated/prisma/client.js'; // Import your Enum

@Injectable()
export class OrderService {
  constructor(private prisma: PrismaService) {}

  // --- 0. CREATE ORDER ---
  async createOrder(userId: string, dto: any) {
  const productIds = dto.items.map((item: any) => item.productId);
  const dbProducts = await this.prisma.product.findMany({
    where: { id: { in: productIds } },
  });

  let subtotal = 0;
  const orderItemsData = dto.items.map((item: any) => {
    const product = dbProducts.find((p) => p.id === item.productId);
    if (!product) throw new BadRequestException(`Product ${item.productId} not found`);
    
    subtotal += product.price * item.quantity;
    return {
      productId: item.productId,
      quantity: item.quantity,
      priceAtPurchase: product.price,
    };
  });

  const taxAmount = subtotal * 0.18; 
  const shippingFees = 2000;
  const totalAmount = subtotal + taxAmount + shippingFees;

  return this.prisma.$transaction(async (tx) => {
    const order = await tx.order.create({
      data: {
        orderNumber: `ORD-${Date.now()}`,
        userId,
        totalAmount,
        taxAmount,
        shippingFees,
        shippingAddress: dto.shippingAddress,
        phoneNumber: dto.phoneNumber,
        paymentMethod: dto.paymentMethod, // Must match PaymentMethod enum
        status: 'PENDING',
        paymentStatus: 'INITIALIZED',
        items: {
          create: orderItemsData,
        },
      },
    });

    await tx.payment.create({
      data: {
        orderId: order.id,
        userId,
        amount: totalAmount,
        transactionRef: `REF-${order.orderNumber}`,
        status: 'INITIALIZED',
        provider: dto.paymentMethod === 'MOBILE_MONEY' ? 'MTN_MOMO' : 'STRIPE',
      },
    });

    return order;
  });
}

  // --- 1. USER: Get My History ---
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

  // --- 2. VENDOR: Get My Products in Orders ---
  async getOrdersForVendor(vendorId: string) {
    return this.prisma.order.findMany({
      where: {
        items: {
          some: {
            product: { vendorId: vendorId },
          },
        },
      },
      include: {
        items: {
          where: {
            product: { vendorId: vendorId },
          },
          include: { product: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // --- 3. ADMIN: Global Oversight ---
  async getAllOrders(status?: string) {
    return this.prisma.order.findMany({
      where: status ? { status: status as OrderStatus } : {},
      include: {
        user: { select: { name: true, email: true } },
        items: { include: { product: true } },
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // --- 4. SHARED: Update Status ---
  async updateStatus(orderId: string, status: OrderStatus) {
    return this.prisma.order.update({
      where: { id: orderId },
      data: { status },
    });
  }

  // --- 5. SHARED: Get Single Order Details ---
  async getOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: { include: { product: true } },
        payment: true,
        user: { select: { name: true, phone: true, email: true } },
      },
    });

    if (!order) throw new NotFoundException('Order not found');
    return order;
  }
}