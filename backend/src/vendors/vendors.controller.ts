// src/vendors/vendors.controller.ts
import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards, Req, BadRequestException, Put } from '@nestjs/common';
import { VendorsService } from './vendors.service.js';
import { Roles } from '@thallesp/nestjs-better-auth';
import { RolesGuard } from '../auth/guards/roles.guard.js';

@Controller('vendors')
export class VendorsController {
  constructor(
    private readonly vendorsService: VendorsService,
  ) { }

  // Helper to get user ID safely across different auth implementations
  private getUserId(req: any): string {
    const user = req.user || req.session?.user || req.auth;
    if (!user || (!user.id && !user.sub)) {
      throw new BadRequestException('User session not found or user ID missing.');
    }
    return user.id || user.sub;
  }

  @Post('request-onboarding')
  @UseGuards(RolesGuard)
  async requestOnboarding(@Body() dto: { businessDescription: string }, @Req() req: any) {
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
      dto.businessDescription
    );
  }

  // --- ADMIN ENDPOINTS FOR ONBOARDING QUEUE ---

  @Get('requests')
  @UseGuards(RolesGuard)
  @Roles(['admin'])
  async getPendingRequests() {
    return this.vendorsService.findPendingRequests();
  }

  @Post('requests/approve')
  @UseGuards(RolesGuard)
  @Roles(['admin'])
  async approveRequest(@Body() requestData: { userId: string; storeName: string; description: string; address: string; phone: string }) {
    return this.vendorsService.approveVendorRequest(requestData);
  }

  @Delete('requests/:id')
  @UseGuards(RolesGuard)
  @Roles(['admin'])
  async rejectRequest(@Param('id') requestId: string) {
    return this.vendorsService.rejectVendorRequest(requestId);
  }

  // --- STANDARD VENDOR MANAGEMENT ROUTES ---

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

  @Patch(':id')
  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles(['admin'])
  async update(@Param('id') id: string, @Body() dto: any) {
    return this.vendorsService.update(id, dto);
  }

  @Patch(':id/toggle-status')
  @UseGuards(RolesGuard)
  @Roles(['admin'])
  async toggleStatus(@Param('id') id: string, @Body('currentStatus') currentStatus: boolean) {
    return this.vendorsService.toggleVendorStatus(id, currentStatus);
  }

  @Get('metrics')
  @UseGuards(RolesGuard)
  @Roles(['admin', 'vendor'])
  async getStorefrontMetrics() {
    return this.vendorsService.getStorefrontMetrics();
  }

  @Get(':id/metrics')
  @UseGuards(RolesGuard)
  async getVendorByIdMetrics(@Param('id') id: string) {
    return this.vendorsService.getVendorMetrics(id);
  }

  @Get('orders')
  @UseGuards(RolesGuard)
  @Roles(['admin', 'vendor'])
  async getVendorOrders(@Req() req: any) {
    const currentUser = req.user || req.session?.user || req.auth;
    return this.vendorsService.findVendorOrders(currentUser?.id);
  }

  @Patch('orders/:id/status')
  @UseGuards(RolesGuard)
  async updateOrderStatus(@Param('id') orderId: string, @Body('status') status: string) {
    return this.vendorsService.updateOrderStatus(orderId, status);
  }

  @Get('settings')
  @UseGuards(RolesGuard)
  @Roles(['admin', 'vendor'])
  async getSettings(@Req() req: any) {
    const userId = req.user.id;
    return this.vendorsService.getSettings(userId);
  }

  @Patch('settings')
  @UseGuards(RolesGuard)
  @Roles(['admin', 'vendor'])
  async updateSettings(@Req() req: any, @Body() payload: any) {
    return this.vendorsService.updateSettings(this.getUserId(req), payload);
  }

  @Post('admin-request')
  @UseGuards(RolesGuard)
  @Roles(['vendor'])
  async submitAdminRequest(@Req() req: any, @Body() payload: { type: string; amount?: string; message: string }) {
    return this.vendorsService.submitAdminRequest(this.getUserId(req), payload);
  }

  @Get('admin-requests')
  @UseGuards(RolesGuard)
  @Roles(['admin'])
  async getAllAdminRequests() {
    return this.vendorsService.findAllAdminRequests();
  }

  @Patch('admin-requests/:id')
  @UseGuards(RolesGuard)
  @Roles(['admin'])
  async updateAdminRequest(
    @Param('id') id: string,
    @Body() payload: { status: string; adminNotes?: string }
  ) {
    return this.vendorsService.updateAdminRequestStatus(id, payload.status, payload.adminNotes);
  }

  @Delete('admin-requests/:id')
  @UseGuards(RolesGuard)
  @Roles(['admin'])
  async deleteAdminRequest(@Param('id') id: string) {
    return this.vendorsService.deleteAdminRequest(id);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(['admin'])
  async remove(@Param('id') id: string) {
    return this.vendorsService.remove(id);
  }
}