import { Controller, Get, Post, Body, Param, Patch, Req, Query, ForbiddenException, UseGuards } from '@nestjs/common';
import { OrderService } from './order.service.js';
import { CreateOrderDto } from './dto/create-order.dto.js';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto.js';
import { UserRole, OrderStatus } from '../../generated/prisma/client.js';
import { AuthGuard } from '../auth/guards/auth.guard.js';


@UseGuards(AuthGuard)
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  // --- CREATE ORDER ---
  @Post()
  async create(@Body() dto: CreateOrderDto, @Req() req: any) {
    const userId = req.user?.id;
    return this.orderService.createOrder(userId, dto);
  }

  // --- USER ORDERS ---
  @Get('my-orders')
  async getMyOrders(@Req() req: any) {
    return this.orderService.getOrdersByUser(req.user.id);
  }

  @Get(':id')
  async getOrderDetails(@Param('id') id: string, @Req() req: any) {
    const order = await this.orderService.getOne(id);
    if (
      order.userId !== req.user.id &&
      req.user.role !== UserRole.admin &&
      req.user.role !== UserRole.vendor
    ) {
      throw new ForbiddenException('You do not have access to this order');
    }
    return order;
  }

  // --- VENDOR DASHBOARD ---
  @Get('vendor/dashboard')
  async getVendorOrders(@Req() req: any) {
    if (req.user.role !== UserRole.vendor) throw new ForbiddenException();
    return this.orderService.getOrdersForVendor(req.user.id);
  }

  // --- ADMIN DASHBOARD ---
  @Get('admin/all')
  async getAllOrders(@Req() req: any, @Query('status') status?: string) {
    if (req.user.role !== UserRole.admin) throw new ForbiddenException();
    return this.orderService.getAllOrders(status);
  }

  // --- UPDATE ORDER STATUS ---
  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
    @Req() req: any
  ) {
    if (![UserRole.admin, UserRole.vendor].includes(req.user.role)) throw new ForbiddenException();
    return this.orderService.updateStatus(id, dto.status as OrderStatus);
  }
}