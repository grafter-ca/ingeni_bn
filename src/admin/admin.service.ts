import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

export interface PlatformConfigState {
  maintenance: boolean;
  registrations: boolean;
  notifications: boolean;
}

export interface SystemLogEntry {
  id: string;
  time: string;
  level: 'INFO' | 'WARN' | 'ERROR';
  module: string;
  msg: string;
  node: string;
  payloadBytes: number;
}

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  private configState: PlatformConfigState = {
    maintenance: false,
    registrations: true,
    notifications: true,
  };

  constructor(private readonly prisma: PrismaService) {}

  async getLogs(limit: number = 200): Promise<SystemLogEntry[]> {
    const safeLimit = Math.min(Math.max(Number(limit) || 200, 1), 500);
    const perSourceTake = Math.min(safeLimit, 50);

    const [recentSessions, recentUsers] = await Promise.all([
      this.prisma.session.findMany({
        take: perSourceTake,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          userId: true,
          ipAddress: true,
          createdAt: true,
          updatedAt: true,
          expiresAt: true,
          user: {
            select: {
              email: true,
              role: true,
            },
          },
        },
      }),
      this.prisma.user.findMany({
        take: perSourceTake,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          role: true,
          createdAt: true,
        },
      }),
    ]);

    const now = Date.now();

    const sessionLogs: SystemLogEntry[] = recentSessions.map((s) => {
      const isExpired = s.expiresAt
        ? new Date(s.expiresAt).getTime() <= now
        : false;
      const msg = `Session ${isExpired ? 'expired/inactive' : 'active'} for ${
        s.user?.email || s.userId
      } (${s.user?.role || 'user'})`;

      return {
        id: `sess-${s.id}`,
        time: (s.updatedAt || s.createdAt).toISOString(),
        level: isExpired ? 'WARN' : 'INFO',
        module: 'AUTH',
        msg,
        node: s.ipAddress || 'API',
        payloadBytes: Buffer.byteLength(msg, 'utf8'),
      };
    });

    const userLogs: SystemLogEntry[] = recentUsers.map((u) => {
      const msg = `Account registered: ${u.email} [role: ${u.role}]`;
      return {
        id: `usr-${u.id}`,
        time: u.createdAt.toISOString(),
        level: 'INFO',
        module: 'USERS',
        msg,
        node: 'DB',
        payloadBytes: Buffer.byteLength(msg, 'utf8'),
      };
    });

    return [...sessionLogs, ...userLogs]
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, safeLimit);
  }

  getConfig(): PlatformConfigState {
    return { ...this.configState };
  }

  updateConfig(partial: Partial<PlatformConfigState>): PlatformConfigState {
    this.configState = {
      maintenance:
        partial.maintenance !== undefined
          ? Boolean(partial.maintenance)
          : this.configState.maintenance,
      registrations:
        partial.registrations !== undefined
          ? Boolean(partial.registrations)
          : this.configState.registrations,
      notifications:
        partial.notifications !== undefined
          ? Boolean(partial.notifications)
          : this.configState.notifications,
    };

    this.logger.log(
      `Updated global platform config: ${JSON.stringify(this.configState)}`,
    );

    return { ...this.configState };
  }
}