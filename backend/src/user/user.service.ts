import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { UserRole } from '../../generated/prisma/index.js';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  // Create a new user (Handles manual creation/Admin)
  async create(data: any) {
    const existing = await this.prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existing) throw new ConflictException('Email already registered');

    return this.prisma.user.create({ data });
  }

  // Advanced Find All with Filter, Search, and Pagination
  async findAll(role?: UserRole, search?: string, limit: number = 10, offset: number = 0) {
    return this.prisma.user.findMany({
      where: {
        ...(role && { role }),
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { phone: { contains: search } },
          ],
        }),
      },
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { sessions: true, accounts: true } } }
    });
  }

  async findOneById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { accounts: true }
    });
    if (!user) throw new NotFoundException(`User with ID ${id} not found`);
    return user;
  }

  async findOneByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async updateProfile(id: string, data: any) {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return this.prisma.user.delete({ where: { id } });
  }
}