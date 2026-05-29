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

  // =========================================================
  // CREATE ORDER
  // =========================================================
  async createOrder(userId: string | null, dto: CreateOrderDto) {
    // -------------------------------------------------------
    // VALIDATE ITEMS
    // -------------------------------------------------------
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
      throw new BadRequestException(
        'One or more products not found',
      );
    }
    // -------------------------------------------------------
    // CALCULATIONS
    // -------------------------------------------------------
    let subtotal = 0;

    const orderItemsData = dto.items.map((item) => {
      const product = dbProducts.find(
        (p) => p.id === item.productId,
      );

      if (!product) {
        throw new BadRequestException(
          `Product ${item.productId} not found`,
        );
      }

      // STOCK CHECK
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

    // -------------------------------------------------------
    // TOTALS
    // -------------------------------------------------------
    const taxAmount =
      dto.taxAmount ?? Number((subtotal * 0.18).toFixed(2));

    const shippingFees = dto.shippingFees ?? 2000;

    const totalAmount =
      dto.totalAmount ??
      Number(
        (subtotal + taxAmount + shippingFees).toFixed(2),
      );
    // -------------------------------------------------------
    // USER HANDLING
    // -------------------------------------------------------
    let finalUserId = userId;

    // Create guest user automatically if not logged in
    if (!finalUserId) {
      const guestEmail =
        dto.user?.email ||
        `guest-${Date.now()}@ingeristore.rw`;

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
    // TRANSACTION
    // -------------------------------------------------------
    return this.prisma.$transaction(async (tx) => {
      const orderNumber = `ING-${Date.now()}`;
      // ---------------------------------------------------
      // UPDATE STOCK
      // ---------------------------------------------------
      for (const item of orderItemsData) {
        await tx.product.update({
          where: {
            id: item.productId,
          },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      // ---------------------------------------------------
      // CREATE ORDER
      // ---------------------------------------------------
      const order = await tx.order.create({
        data: {
          orderNumber,
          userId: finalUserId!,
          totalAmount,
          taxAmount,
          email: dto.user?.email || "unknown",
          shippingFees,
          shippingAddress: dto.shippingAddress,
          phoneNumber: dto.phoneNumber,
          paymentMethod:
            dto.paymentMethod as PaymentMethod,
          status: OrderStatus.PENDING,
          paymentStatus:
            PaymentStatus.INITIALIZED,

          items: {
            create: orderItemsData.map((item) => ({
              productId: item.productId,
              vendorId: item.vendorId,
              quantity: item.quantity,
              priceAtPurchase:
                item.priceAtPurchase,
            })),
          },
        },

        include: {
          items: {
            include: {
              product: {
                include: {
                  images: true,
                },
              },
            },
          },

          payment: true,
        },
      });
      // ---------------------------------------------------
      // CREATE PAYMENT RECORD
      // ---------------------------------------------------
      await tx.payment.create({
        data: {
          orderId: order.id,

          userId: finalUserId!,

          amount: totalAmount,

          transactionRef: `PAY-${orderNumber}`,

          status: PaymentStatus.INITIALIZED,

          provider:
            dto.paymentMethod ===
            'MOBILE_MONEY'
              ? 'MTN_MOMO'
              : dto.paymentMethod ===
                  'CREDIT_CARD'
                ? 'FLUTTERWAVE'
                : 'CASH',
        },
      });
      // ---------------------------------------------------
      // RETURN COMPLETE ORDER
      // ---------------------------------------------------
      return await tx.order.findUnique({
        where: {
          id: order.id,
        },

        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },

          items: {
            include: {
              product: {
                include: {
                  images: true,
                },
              },
            },
          },

          payment: true,
        },
      });
    });
  }
  // =========================================================
  // GET USER ORDERS
  // =========================================================
  async getOrdersByUser(userId: string) {
    return this.prisma.order.findMany({
      where: {
        userId,
      },

      include: {
        items: {
          include: {
            product: {
              include: {
                images: true,
              },
            },
          },
        },

        payment: true,
      },

      orderBy: {
        createdAt: 'desc',
      },
    });
  }
  // =========================================================
  // GET VENDOR ORDERS
  // =========================================================
  async getOrdersForVendor(vendorId: string) {
    return this.prisma.order.findMany({
      where: {
        items: {
          some: {
            vendorId,
          },
        },
      },

      include: {
        items: {
          where: {
            vendorId,
          },

          include: {
            product: {
              include: {
                images: true,
              },
            },
          },
        },

        user: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },

        payment: true,
      },

      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // =========================================================
  // GET ALL ORDERS
  // =========================================================
  async getAllOrders(status?: string) {
    return this.prisma.order.findMany({
      where: status
        ? {
            status: status as OrderStatus,
          }
        : {},

      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },

        items: {
          include: {
            product: {
              include: {
                images: true,
              },
            },
          },
        },

        payment: true,
      },

      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // =========================================================
  // UPDATE ORDER STATUS
  // =========================================================
  async updateStatus(
    orderId: string,
    status: OrderStatus,
  ) {
    return this.prisma.order.update({
      where: {
        id: orderId,
      },

      data: {
        status,
      },
    });
  }

  // =========================================================
  // GET VENDOR ID FROM USER ID
  // =========================================================
  async getVendorIdByUserId(
    userId: string,
  ): Promise<string> {
    const vendor = await this.prisma.vendor.findUnique({
      where: {
        userId,
      },

      select: {
        id: true,
      },
    });

    if (!vendor) {
      throw new NotFoundException(
        'Vendor profile not found',
      );
    }

    return vendor.id;
  }

  // =========================================================
  // GET SINGLE ORDER
  // =========================================================
  async getOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: {
        id,
      },

      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },

        items: {
          include: {
            product: {
              include: {
                images: true,
              },
            },
          },
        },

        payment: true,
      },
    });

    if (!order) {
      throw new NotFoundException(
        'Order record not found',
      );
    }

    return order;
  }
}