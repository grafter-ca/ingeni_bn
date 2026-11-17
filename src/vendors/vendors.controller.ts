// src/vendors/vendors.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
  Req,
  BadRequestException,
  Put,
} from '@nestjs/common';
import { VendorsService } from './vendors.service.js';
import { Roles } from '@thallesp/nestjs-better-auth';
import { RolesGuard } from '../auth/guards/roles.guard.js';

@Controller('vendors')
export class VendorsController {
  constructor(private readonly vendorsService: VendorsService) {}

  // Helper to get user ID safely across different auth implementations
  private getUserId(req: any): string {
    const user = req.user || req.session?.user || req.auth;
    if (!user || (!user.id && !user.sub)) {
      throw new BadRequestException('User session not found or user ID missing.');
    }
    return user.id || user.sub;
  }

  // =========================================================================
  // 1. STATIC ROUTES (MUST COME BEFORE ALL :id DYNAMIC ROUTES)
  // =========================================================================

  @Post('request-onboarding')
  @UseGuards(RolesGuard)
  async requestOnboarding(
    @Body() dto: { businessDescription: string },
    @Req() req: any,
  ) {
    const currentUser = req.user || req.session?.user || req.auth;

    if (!currentUser) {
      throw new BadRequestException('User session not found on request.');
    }

    return this.vendorsService.requestOnboarding(
      {
        id: currentUser.id || currentUser.sub,
        name: currentUser.name,
        email: currentUser.email,
      },
      dto.businessDescription,
    );
  }

  // --- ADMIN ONBOARDING QUEUE ---
  @Get('requests')
  @UseGuards(RolesGuard)
  @Roles(['admin'])
  async getPendingRequests() {
    return this.vendorsService.findPendingRequests();
  }

  @Post('requests/approve')
  @UseGuards(RolesGuard)
  @Roles(['admin'])
  async approveRequest(
    @Body()
    requestData: {
      userId: string;
      storeName: string;
      description: string;
      address: string;
      phone: string;
    },
  ) {
    return this.vendorsService.approveVendorRequest(requestData);
  }

  // --- VENDOR SETTINGS ---
  @Get('settings')
  @UseGuards(RolesGuard)
  @Roles(['admin', 'vendor'])
  async getSettings(@Req() req: any) {
    return this.vendorsService.getSettings(this.getUserId(req));
  }

  @Patch('settings')
@UseGuards(RolesGuard)
@Roles(['admin', 'vendor'])
async updateSettings(@Req() req: any, @Body() payload: Record<string, any>) {
  const userId = this.getUserId(req);
  // Strip read-only metadata fields in case the client sends the whole settings object
  const { id, vendorId, updatedAt, createdAt, ...cleanPayload } = payload || {};
  return this.vendorsService.updateSettings(userId, cleanPayload);
}

  // --- METRICS & ORDERS ---
  @Get('metrics')
  @UseGuards(RolesGuard)
  @Roles(['admin', 'vendor'])
  async getStorefrontMetrics() {
    return this.vendorsService.getStorefrontMetrics();
  }

  @Get('orders')
  @UseGuards(RolesGuard)
  @Roles(['admin', 'vendor'])
  async getVendorOrders(@Req() req: any) {
    return this.vendorsService.findVendorOrders(this.getUserId(req));
  }

  // --- ADMIN / CASHOUT TICKET REQUESTS ---
  @Get('admin-requests')
  @UseGuards(RolesGuard)
  @Roles(['admin'])
  async getAllAdminRequests() {
    return this.vendorsService.findAllAdminRequests();
  }

  @Post('admin-request')
  @UseGuards(RolesGuard)
  @Roles(['vendor'])
  async submitAdminRequest(
    @Req() req: any,
    @Body() payload: { type: string; amount?: string; message: string },
  ) {
    return this.vendorsService.submitAdminRequest(this.getUserId(req), payload);
  }

  // --- ROOT COLLECTION ENDPOINTS ---
  @Get()
  @UseGuards(RolesGuard)
  @Roles(['admin'])
  async findAll() {
    return this.vendorsService.findAll();
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(['admin'])
  async create(@Body() dto: any) {
    return this.vendorsService.create(dto);
  }

  // =========================================================================
  // 2. PREFIX + PARAMETER ROUTES
  // =========================================================================

  @Delete('requests/:id')
  @UseGuards(RolesGuard)
  @Roles(['admin'])
  async rejectRequest(@Param('id') requestId: string) {
    return this.vendorsService.rejectVendorRequest(requestId);
  }

  @Patch('orders/:id/status')
  @UseGuards(RolesGuard)
  async updateOrderStatus(
    @Param('id') orderId: string,
    @Body('status') status: string,
  ) {
    return this.vendorsService.updateOrderStatus(orderId, status);
  }

  @Patch('admin-requests/:id')
  @UseGuards(RolesGuard)
  @Roles(['admin'])
  async updateAdminRequest(
    @Param('id') id: string,
    @Body() payload: { status: string; adminNotes?: string },
  ) {
    return this.vendorsService.updateAdminRequestStatus(
      id,
      payload.status,
      payload.adminNotes,
    );
  }

  @Delete('admin-requests/:id')
  @UseGuards(RolesGuard)
  @Roles(['admin'])
  async deleteAdminRequest(@Param('id') id: string) {
    return this.vendorsService.deleteAdminRequest(id);
  }

  // =========================================================================
  // 3. DYNAMIC :id ROUTES (MUST ALWAYS BE LAST)
  // =========================================================================

  @Get(':id/financials')
  @UseGuards(RolesGuard)
  async getVendorFinancials(@Param('id') id: string) {
    return this.vendorsService.getVendorFinancials(id);
  }

  @Get(':id/metrics')
  @UseGuards(RolesGuard)
  async getVendorByIdMetrics(@Param('id') id: string) {
    return this.vendorsService.getVendorMetrics(id);
  }

  @Post(':id/cashout-request')
  @UseGuards(RolesGuard)
  @Roles(['admin', 'vendor'])
  async requestCashout(
    @Param('id') vendorId: string,
    @Body()
    body: {
      type?: string;
      amount: string | number;
      phone?: string;
      message?: string;
    },
  ) {
    return this.vendorsService.submitAdminRequest(vendorId, {
      type: body.type || 'CASHOUT',
      amount: String(body.amount),
      message:
        body.message ||
        `Cashout request to MoMo number: ${body.phone || 'Registered MoMo'}`,
    });
  }

  @Patch(':id/toggle-status')
  @UseGuards(RolesGuard)
  @Roles(['admin'])
  async toggleStatus(
    @Param('id') id: string,
    @Body('currentStatus') currentStatus: boolean,
  ) {
    return this.vendorsService.toggleVendorStatus(id, currentStatus);
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  async getVendorById(@Param('id') id: string) {
    return this.vendorsService.getVendorById(id);
  }

  @Patch(':id')
  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles(['admin', 'vendor'])
  async update(@Param('id') id: string, @Body() dto: any) {
    return this.vendorsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(['admin'])
  async remove(@Param('id') id: string) {
    return this.vendorsService.remove(id);
  }
}