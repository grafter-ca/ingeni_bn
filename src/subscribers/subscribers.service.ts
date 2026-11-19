import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { EmailService } from '../libs/nodemail/email.service.js';

@Injectable()
export class SubscribersService {
  private readonly logger = new Logger(SubscribersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  private resolveApiBaseUrl(): string {
    const rawBase = (
      process.env.BETTER_AUTH_URL || 'http://localhost:8000'
    ).replace(/\/+$/, '');

    return rawBase.endsWith('/api') ? rawBase : `${rawBase}/api`;
  }

  buildUnsubscribeUrl(token: string): string {
    const apiBase = this.resolveApiBaseUrl();
    return `${apiBase}/subscribers/unsubscribe?token=${encodeURIComponent(token)}`;
  }

  async subscribe(input: {
    email: string;
    name?: string;
    userId?: string;
    source?: string;
  }) {
    const normalizedEmail = input.email?.trim().toLowerCase();
    if (!normalizedEmail || !normalizedEmail.includes('@')) {
      throw new BadRequestException('Please provide a valid email address.');
    }

    const subscriber = await this.prisma.subscriber.upsert({
      where: { email: normalizedEmail },
      update: {
        isActive: true,
        ...(input.name ? { name: input.name.trim() } : {}),
        ...(input.userId ? { userId: input.userId } : {}),
        ...(input.source ? { source: input.source } : {}),
      },
      create: {
        email: normalizedEmail,
        name: input.name?.trim() || null,
        userId: input.userId || null,
        source: input.source || 'footer',
        isActive: true,
      },
    });

    const unsubscribeUrl = this.buildUnsubscribeUrl(subscriber.unsubscribeToken);

    try {
      await this.emailService.sendSubscriptionWelcomeEmail(
        subscriber.email,
        subscriber.name || 'Shopper',
        unsubscribeUrl,
      );
    } catch (err) {
      this.logger.error(
        `Failed to send subscription confirmation email to ${subscriber.email}:`,
        err,
      );
    }

    return {
      success: true,
      subscriber,
      message: 'Subscribed to Ingeni Market product alerts and updates.',
    };
  }

  async syncAccountSubscriber(user: {
    id: string;
    email?: string | null;
    name?: string | null;
  }) {
    if (!user?.email) return null;
    return this.subscribe({
      email: user.email,
      name: user.name || undefined,
      userId: user.id,
      source: 'account',
    });
  }

  async unsubscribe(token: string) {
    if (!token?.trim()) {
      throw new BadRequestException('Unsubscribe token is required.');
    }

    const existing = await this.prisma.subscriber.findUnique({
      where: { unsubscribeToken: token.trim() },
    });

    if (!existing) {
      throw new NotFoundException('Invalid or expired unsubscribe link.');
    }

    await this.prisma.subscriber.update({
      where: { id: existing.id },
      data: { isActive: false },
    });

    return {
      success: true,
      message: 'You have been unsubscribed from Ingeni Market product alerts.',
    };
  }

  async findAll(includeInactive = false) {
    return this.prisma.subscriber.findMany({
      where: includeInactive ? {} : { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findActiveRecipients(excludeUserId?: string) {
    return this.prisma.subscriber.findMany({
      where: {
        isActive: true,
        ...(excludeUserId ? { userId: { not: excludeUserId } } : {}),
      },
      select: {
        email: true,
        name: true,
        unsubscribeToken: true,
      },
    });
  }

  async remove(id: string) {
    const existing = await this.prisma.subscriber.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Subscriber ${id} not found.`);
    }

    await this.prisma.subscriber.delete({ where: { id } });
    return { success: true };
  }
}