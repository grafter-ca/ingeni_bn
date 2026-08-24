// src/analytics/analytics.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { TrackClickDto } from '../dto/track-click.dto.js';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async trackClick(dto: TrackClickDto) {
    return this.prisma.trafficClick.create({
      data: {
        actionType: dto.actionType,
        productId: dto.productId || null,
        vendorId: dto.vendorId || null,
      },
    });
  }

  // Get aggregated metrics for a specific vendor
  async getVendorTrafficStats(vendorId: string) {
    return this.prisma.trafficClick.groupBy({
      by: ['actionType'],
      where: { vendorId },
      _count: {
        id: true,
      },
    });
  }

  // Get aggregated metrics platform-wide for admins
  async getGlobalTrafficStats() {
    return this.prisma.trafficClick.groupBy({
      by: ['actionType'],
      _count: {
        id: true,
      },
    });
  }
}