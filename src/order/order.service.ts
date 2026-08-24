import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';

import {
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
} from '../../generated/prisma/client.js';

import type { CreateOrderDto } from './dto/create-order.dto.js';

@Injectable()
export class OrderService {
  constructor(private prisma: PrismaService) {}

  // CREATE ORDER
  // =========================================================
  async createOrder(userId: string | null, dto: CreateOrderDto) {
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('Order items are required');
    }

    const productIds = dto.items.map((item) => item.productId);

    const dbProducts = await this.prisma.product.findMany({
      where: {
        id: {
          in: productIds,
        },
      },
    });

    if (dbProducts.length !== productIds.length) {
      throw new BadRequestException('One or more products not found');
    }

    let subtotal = 0;

    const orderItemsData = dto.items.map((item) => {
      const product = dbProducts.find((p) => p.id === item.productId);

      if (!product) {
        throw new BadRequestException(`Product ${item.productId} not found`);
      }

      if (product.stock < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for ${product.title}`,
        );
      }

      const unitPrice = Number(product.price);
      subtotal += unitPrice * item.quantity;

      return {
        productId: product.id,
        vendorId: product.vendorId,
        quantity: item.quantity,
        priceAtPurchase: product.price,
      };
    });

    const vendorRevenueMap: Record<string, number> = {};
    orderItemsData.forEach((item) => {
      const itemTotal = Number(item.priceAtPurchase) * item.quantity;
      vendorRevenueMap[item.vendorId] =
        (vendorRevenueMap[item.vendorId] || 0) + itemTotal;
    });

    const taxAmount = dto.taxAmount ?? Number((subtotal * 0.18).toFixed(2));
    const shippingFees = dto.shippingFees ?? 2000;
    const totalAmount =
      dto.totalAmount ??
      Number((subtotal + taxAmount + shippingFees).toFixed(2));

    let finalUserId = userId;

    if (!finalUserId) {
      const guestEmail =
        dto.user?.email || `guest-${Date.now()}@ingeristore.rw`;

      const guestUser = await this.prisma.user.create({
        data: {
          name: dto.user?.name || 'Guest User',
          email: guestEmail,
          phone: dto.user?.phoneNumber || null,
          emailVerified: false,
          role: 'user',
        },
      });

      finalUserId = guestUser.id;
    }

    // -------------------------------------------------------
    // TRANSACTION (With extended timeout: 10000ms)
    // -------------------------------------------------------
    const orderId = await this.prisma.$transaction(
      async (tx) => {
        const orderNumber = `ING-${Date.now()}`;

        // Update stock
        for (const item of orderItemsData) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          });
        }

        // Create Order
        const order = await tx.order.create({
          data: {
            orderNumber,
            userId: finalUserId!,
            totalAmount,
            taxAmount,
            email: dto.user?.email || 'unknown',
            shippingFees,
            shippingAddress: dto.shippingAddress,
            phoneNumber: dto.phoneNumber,
            paymentMethod: dto.paymentMethod as PaymentMethod,
            status: OrderStatus.PENDING,
            paymentStatus: PaymentStatus.INITIALIZED,
            items: {
              create: orderItemsData.map((item) => ({
                productId: item.productId,
                vendorId: item.vendorId,
                quantity: item.quantity,
                priceAtPurchase: item.priceAtPurchase,
              })),
            },
          },
        });

        // Create Fulfillments
        for (const [vendorId, revenue] of Object.entries(vendorRevenueMap)) {
          await tx.fulfillment.create({
            data: {
              orderId: order.id,
              vendorId: vendorId,
              revenue: revenue,
              status: OrderStatus.PENDING,
            },
          });
        }

        // Create Payment
        await tx.payment.create({
          data: {
            orderId: order.id,
            userId: finalUserId!,
            amount: totalAmount,
            transactionRef: `PAY-${orderNumber}`,
            status: PaymentStatus.INITIALIZED,
            paymentProofUrl: dto.paymentProofUrl || null,
            provider:
              dto.paymentMethod === 'MOBILE_MONEY'
                ? 'MTN_MOMO'
                : dto.paymentMethod === 'CREDIT_CARD'
                ? 'FLUTTERWAVE'
                : 'CASH',
          },
        });

        return order.id;
      },
      { timeout: 10000 },
    );

    return await this.getOne(orderId);
  }

  // UPDATE PAYMENT STATUS & AUTOMATICALLY COMPUTE COMMISSION
  // =========================================================
  async updatePaymentStatus(
    orderId: string,
    paymentStatus: PaymentStatus,
    transactionRef?: string,
  ) {
    return await this.prisma.$transaction(async (tx) => {
      const existingOrder = await tx.order.findUnique({
        where: { id: orderId },
        include: { items: true, payment: true },
      });

      if (!existingOrder) {
        throw new NotFoundException('Order record not found');
      }

      // 1. Update Order payment state
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          paymentStatus,
        },
      });

      // 2. Sync Payment record status
      if (existingOrder.payment) {
        await tx.payment.update({
          where: { orderId },
          data: {
            status: paymentStatus,
            ...(transactionRef ? { transactionRef } : {}),
          },
        });
      }

      // 🔥 3. Automatically process commission if delivered & paid
      await this.processOrderCommission(orderId, tx);

      return updatedOrder;
    });
  }

  // COMMISSION CALCULATION HELPER
  // =========================================================
  async processOrderCommission(orderId: string, tx: any) {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { items: { include: { product: true } } },
    });

    // Ensure order is paid AND delivered before releasing commission
    if (!order || order.paymentStatus !== PaymentStatus.SUCCESS || order.status !== OrderStatus.DELIVERED) {
      return;
    }

    const totalAmount = Number(order.totalAmount);
    const commissionRate = 0.10; // 10% platform take
    const commissionAmount = Number((totalAmount * commissionRate).toFixed(2));
    const vendorEarnings = Number((totalAmount - commissionAmount).toFixed(2));

    // Update order record with computed commission details
    await tx.order.update({
      where: { id: orderId },
      data: {
        commissionRate: commissionRate,
        commissionAmount: commissionAmount,
        vendorEarnings: vendorEarnings,
        payoutStatus: 'PENDING',
      },
    });

    // Update per-vendor fulfillment records
    for (const item of order.items) {
      const itemRevenue = Number(item.priceAtPurchase) * item.quantity;
      const itemCommission = itemRevenue * commissionRate;
      const itemVendorEarnings = itemRevenue - itemCommission;

      await tx.fulfillment.updateMany({
        where: {
          orderId: orderId,
          vendorId: item.vendorId,
        },
        data: {
          revenue: itemVendorEarnings,
          status: OrderStatus.DELIVERED,
        },
      });
    }
  }

  // GET USER ORDERS
  // =========================================================
  async getOrdersByUser(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: { images: true, category: true, vendor: true },
            },
          },
        },
        payment: true,
        fulfillments: { include: { vendor: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // GET VENDOR ORDERS
  // =========================================================
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
        user: { select: { name: true, email: true, phone: true } },
        items: {
          include: {
            product: {
              include: { images: true, category: true, vendor: true },
            },
          },
        },
        payment: true,
        fulfillments: { include: { vendor: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // GET ALL ORDERS
  // =========================================================
  async getAllOrders(status?: string) {
    return this.prisma.order.findMany({
      where: status ? { status: status as OrderStatus } : {},
      include: {
        user: { select: { name: true, email: true, phone: true } },
        items: {
          include: {
            product: {
              include: { images: true, category: true, vendor: true },
            },
          },
        },
        payment: true,
        fulfillments: { include: { vendor: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // UPDATE ORDER STATUS
  // =========================================================
  async updateStatus(orderId: string, status: OrderStatus) {
    return await this.prisma.$transaction(async (tx) => {
      const existingOrder = await tx.order.findUnique({
        where: { id: orderId },
        include: { items: { include: { product: true } } },
      });

      if (!existingOrder) {
        throw new NotFoundException('Order record not found');
      }

      const isBecomingDelivered = 
        status === OrderStatus.DELIVERED && existingOrder.status !== OrderStatus.DELIVERED;

      if (isBecomingDelivered) {
        for (const item of existingOrder.items) {
          if (item.product.stock < item.quantity) {
            throw new BadRequestException(
              `Insufficient stock for product: ${item.product.title}. Available: ${item.product.stock}, Required: ${item.quantity}`
            );
          }

          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          });
        }
      }

      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: { status },
      });

      await tx.orderHistory.create({
        data: {
          orderId: orderId,
          status: status,
        },
      });

      // 🔥 Automatically process commission if delivered & paid
      await this.processOrderCommission(orderId, tx);

      return updatedOrder;
    });
  }

  // GET VENDOR ID FROM USER ID
  // =========================================================
  async getVendorIdByUserId(userId: string): Promise<string> {
    const vendor = await this.prisma.vendor.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!vendor) {
      throw new NotFoundException('Vendor profile not found');
    }

    return vendor.id;
  }

  // GET SINGLE ORDER
  // =========================================================
  async getOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        user: { select: { name: true, email: true, phone: true } },
        items: {
          include: {
            product: {
              include: { images: true, category: true, vendor: true },
            },
          },
        },
        payment: true,
        fulfillments: { include: { vendor: true } },
      },
    });

    if (!order) throw new NotFoundException('Order record not found');
    return order;
  }
}