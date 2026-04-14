import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { OrderStatus, PaymentMethod } from '../../generated/prisma/client.js';
import type { CreateOrderDto } from './dto/create-order.dto.js';

@Injectable()
export class OrderService {
  constructor(private prisma: PrismaService) {}

  // --- CREATE ORDER ---
  async createOrder(userId: string, dto: CreateOrderDto) {
    const productIds = dto.items.map((item) => item.productId);
    const dbProducts = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    if (dbProducts.length !== productIds.length) {
      throw new BadRequestException("One or more products not found");
    }

    let subtotal = 0;

    // We map the data and handle the Decimal -> Number conversion for math
    const orderItemsData = dto.items.map((item) => {
      const product = dbProducts.find((p) => p.id === item.productId)!;
      
      // FIX 1: Convert Decimal price to Number for arithmetic
      const price = Number(product.price);
      subtotal += price * item.quantity;

      return {
        quantity: item.quantity,
        priceAtPurchase: product.price, // Keep as Decimal for DB storage
        // FIX 2: Use the relational 'connect' syntax to satisfy Prisma types
        product: {
          connect: { id: item.productId }
        }
      };
    });

    const taxAmount = subtotal * 0.18; // 18% VAT (RRA Standard)
    const shippingFees = 2000; // Fixed delivery fee for Ingeri Store
    const totalAmount = subtotal + taxAmount + shippingFees;

    return this.prisma.$transaction(async (tx) => {
      const orderNumber = `ORD-${Date.now()}`;
      
      const order = await tx.order.create({
        data: {
          orderNumber,
          userId,
          totalAmount,
          taxAmount,
          shippingFees,
          shippingAddress: dto.shippingAddress,
          phoneNumber: dto.phoneNumber,
          paymentMethod: dto.paymentMethod as PaymentMethod,
          status: OrderStatus.PENDING,
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
          transactionRef: `REF-${orderNumber}`,
          status: 'INITIALIZED',
          provider: dto.paymentMethod === 'MOBILE_MONEY' ? 'MTN_MOMO' : 'STRIPE',
        },
      });

      return order;
    });
  }

  // --- GET ORDERS BY USER ---
  async getOrdersByUser(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: {
        items: { include: { product: { include: { images: true } } } },
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // --- GET VENDOR ORDERS ---
  async getOrdersForVendor(vendorId: string) {
    return this.prisma.order.findMany({
      where: { items: { some: { product: { vendorId } } } },
      include: {
        items: { 
          where: { product: { vendorId } }, 
          include: { product: { include: { images: true } } } 
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // --- GET ALL ORDERS (ADMIN) ---
  async getAllOrders(status?: string) {
    return this.prisma.order.findMany({
      where: status ? { status: status as OrderStatus } : {},
      include: {
        user: { select: { name: true, email: true } },
        items: { include: { product: { include: { images: true } } } },
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // --- UPDATE ORDER STATUS ---
  async updateStatus(orderId: string, status: OrderStatus) {
    return this.prisma.order.update({
      where: { id: orderId },
      data: { status },
    });
  }

  // --- GET SINGLE ORDER ---
  async getOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: { include: { product: { include: { images: true } } } },
        payment: true,
        user: { select: { name: true, phone: true, email: true } },
      },
    });

    if (!order) throw new NotFoundException('Order not found');
    return order;
  }
}