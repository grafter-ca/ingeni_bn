import { Controller, Get, Post, Body, Param, Patch, UseGuards, Req, Query, ForbiddenException } from '@nestjs/common';
import { OrderService } from './order.service.js';
import { CreateOrderDto } from './dto/create-order.dto.js';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto.js';
import { UserRole } from '../../generated/prisma/client.js'; // Import your Enum

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  // --- USER ROUTES ---

  @Post()
  async create(@Body() dto: CreateOrderDto, @Req() req: any) {
    const userId = req.user?.id; // Assumes Auth Guard is active
    return this.orderService.createOrder(userId, dto);
  }

  @Get('my-orders')
  async getMyOrders(@Req() req: any) {
    return this.orderService.getOrdersByUser(req.user.id);
  }

  @Get(':id')
  async getOrderDetails(@Param('id') id: string, @Req() req: any) {
    const order = await this.orderService.getOne(id);
    // Security: Only allow the owner or an ADMIN to see details
    if (order.userId !== req.user.id && req.user.role !== UserRole.admin) {
      throw new ForbiddenException('You do not have access to this order');
    }
    return order;
  }

  // --- VENDOR ROUTES ---

  @Get('vendor/dashboard')
  async getVendorOrders(@Req() req: any) {
    if (req.user.role !== UserRole.vendor) throw new ForbiddenException();
    // Logic: Get orders that contain products belonging to this vendor
    return this.orderService.getOrdersForVendor(req.user.id);
  }

  // --- ADMIN ROUTES ---

  @Get('admin/all')
  async getAllOrders(@Req() req: any, @Query('status') status?: string) {
    if (req.user.role !== UserRole.admin) throw new ForbiddenException();
    return this.orderService.getAllOrders(status);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string, 
    @Body() dto: UpdateOrderStatusDto, 
    @Req() req: any
  ) {
    // Both Admin and Vendor might need this, but usually Admin confirms shipping
    if (req.user.role === UserRole.user) throw new ForbiddenException();
    return this.orderService.updateStatus(id, dto.status);
  }
}