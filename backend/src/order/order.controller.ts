import { 
  Controller, Get, Post, Body, Param, Patch, Req, Query, 
  ForbiddenException, UseGuards 
} from '@nestjs/common';
import { OrderService } from './order.service.js';
import { CreateOrderDto } from './dto/create-order.dto.js';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto.js';
import { UserRole, OrderStatus } from '../../generated/prisma/client.js';
import { AuthGuard } from '../auth/guards/auth.guard.js';

// Helper function to sanitize IDs to ensure database compatibility
const clean = (id: string) => id.replace('local-', '').replace('fake-', '');

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  // --- CREATE ORDER ---
  @Post()
  async create(@Body() dto: CreateOrderDto, @Req() req: any) {
    const userId = req.user?.id;
    
    // Sanitize productId for every item in the order
    const sanitizedDto = {
      ...dto,
      items: dto.items.map(item => ({
        ...item,
        productId: clean(item.productId)
      }))
    };
    
    return this.orderService.createOrder(userId, sanitizedDto);
  }

  // --- USER ORDERS ---
  @UseGuards(AuthGuard)
  @Get('my-orders')
  async getMyOrders(@Req() req: any) {
    return this.orderService.getOrdersByUser(req.user.id);
  }

  // --- VENDOR DASHBOARD ---
  @UseGuards(AuthGuard)
  @Get('vendor/dashboard')
  async getVendorOrders(@Req() req: any) {
    if (req.user.role !== UserRole.vendor) {
      throw new ForbiddenException('Access limited to active marketplace vendors');
    }
    
    const vendorId = await this.orderService.getVendorIdByUserId(req.user.id);
    return this.orderService.getOrdersForVendor(vendorId);
  }

  // --- ADMIN DASHBOARD ---
  @UseGuards(AuthGuard)
  @Get('admin/all')
  async getAllOrders(@Req() req: any, @Query('status') status?: string) {
    if (req.user.role !== UserRole.admin) {
      throw new ForbiddenException('Access restricted to administrative platform accounts');
    }
    return this.orderService.getAllOrders(status);
  }

  // --- GET SINGLE ORDER SPECIFICS ---
  @UseGuards(AuthGuard)
  @Get(':id')
  async getOrderDetails(@Param('id') id: string, @Req() req: any) {
    // Sanitized ID used for lookup
    const order = await this.orderService.getOne(clean(id));
    
    const isOwner = order.userId === req.user.id;
    const isAdmin = req.user.role === UserRole.admin;
    const isVendor = req.user.role === UserRole.vendor;

    if (!isOwner && !isAdmin && !isVendor) {
      throw new ForbiddenException('You do not have access to view this order transaction');
    }
    return order;
  }

  // --- UPDATE ORDER STATUS ---
  @UseGuards(AuthGuard)
  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
    @Req() req: any
  ) {
    if (![UserRole.admin, UserRole.vendor].includes(req.user.role)) {
      throw new ForbiddenException('Status mutations require merchant or store staff role access');
    }
    // Use sanitized ID for status update
    return this.orderService.updateStatus(clean(id), dto.status as OrderStatus);
  }
}