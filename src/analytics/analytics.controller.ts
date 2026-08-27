// src/analytics/analytics.controller.ts
import { Controller, Post, Body, Get, Param, UsePipes, ValidationPipe, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service.js';
import { TrackClickDto } from '../dto/track-click.dto.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { AllowAnonymous, Roles, Session } from '@thallesp/nestjs-better-auth';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @AllowAnonymous()
  @Post('track-click')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async trackClick(@Body() dto: TrackClickDto) {
    const record = await this.analyticsService.trackClick(dto);
    return {
      success: true,
      message: 'Traffic click tracked successfully',
      data: record,
    };
  }

  // Bind Better-Auth session decorator/guard to populate the user/session
  @Roles(['admin', 'vendor'])
  @UseGuards(RolesGuard)
  @Get('vendor/:vendorId')
  async getVendorStats(
    @Param('vendorId') vendorId: string,
    @Session() session: any // <-- This forces Better-Auth to parse and attach the session/user
  ) {
    const stats = vendorId === 'global-store'
      ? await this.analyticsService.getGlobalTrafficStats()
      : await this.analyticsService.getVendorTrafficStats(vendorId);

    return {
      success: true,
      data: stats,
    };
  }
}
