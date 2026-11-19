import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpStatus,
  UseGuards,
  ForbiddenException,
  BadRequestException,
  Req,
} from '@nestjs/common';
import { UserService } from './user.service.js';
import { UserRole } from '../../generated/prisma/client.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '@thallesp/nestjs-better-auth';
import { Request } from 'express';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    role: UserRole;
  };
}

interface UpdateProfileBody {
  name?: string;
  phone?: string;
  image?: string;
}

@Controller('users')
@UseGuards(RolesGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @Roles(['admin'])
  async findAll(
    @Query('role') role?: UserRole,
    @Query('search') search?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const parsedLimit = limit ? parseInt(limit, 10) : 10;
    const parsedOffset = offset ? parseInt(offset, 10) : 0;
    const take = Number.isNaN(parsedLimit)
      ? 10
      : Math.min(Math.max(parsedLimit, 1), 100);
    const skip = Number.isNaN(parsedOffset) ? 0 : Math.max(parsedOffset, 0);

    const users = await this.userService.findAll(role, search, take, skip);
    return {
      statusCode: HttpStatus.OK,
      message: 'Users retrieved successfully',
      meta: { count: users.length, limit: take, offset: skip },
      data: users,
    };
  }

  @Get('live-sessions')
  @Roles(['admin'])
  async getLiveSessions(
    @Query('windowMinutes') windowMinutes?: string,
    @Req() req?: AuthenticatedRequest,
  ) {
    const parsed = windowMinutes ? parseInt(windowMinutes, 10) : 60;
    const safeWindow = Number.isNaN(parsed)
      ? 60
      : Math.min(Math.max(parsed, 1), 1440);

    const forwardedFor = req?.headers['x-forwarded-for'];
    const clientIp =
      (Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor)
        ?.split(',')[0]
        ?.trim() ||
      (req?.headers['x-real-ip'] as string) ||
      req?.ip ||
      null;

    const city =
      (req?.headers['cf-ipcity'] as string) ||
      (req?.headers['x-vercel-ip-city'] as string) ||
      null;
    const country =
      (req?.headers['cf-ipcountry'] as string) ||
      (req?.headers['x-vercel-ip-country'] as string) ||
      null;

    const data = await this.userService.findLiveSessions(safeWindow, {
      currentUserId: req?.user?.id,
      clientIp,
      city,
      country,
    });

    return {
      statusCode: HttpStatus.OK,
      message: 'Live sessions retrieved successfully',
      data,
    };
  }

  /** Static routes BEFORE :id routes */
  @Get('me')
  async getMe(@Req() req: AuthenticatedRequest) {
    const user = await this.userService.findOneById(req.user.id);
    return { statusCode: HttpStatus.OK, data: user };
  }

  @Patch('me')
  async updateMe(
    @Req() req: AuthenticatedRequest,
    @Body() body: UpdateProfileBody,
  ) {
    const allowedData = {
      ...(body.name !== undefined && { name: body.name.trim() }),
      ...(body.phone !== undefined && { phone: body.phone.trim() }),
      ...(body.image !== undefined && { image: body.image.trim() }),
    };

    const user = await this.userService.updateProfile(req.user.id, allowedData);
    return { statusCode: HttpStatus.OK, message: 'Profile updated', data: user };
  }

  /** Users can request a vendor role; email confirmation & admin review triggered */
  @Patch('me/request-role')
  async requestVendorRole(@Req() req: AuthenticatedRequest) {
    if (req.user.role !== 'user') {
      throw new BadRequestException('Already vendor or admin');
    }

    const result = await this.userService.requestRoleUpgrade(
      req.user.id,
      'vendor' as UserRole,
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Request sent to admin for approval',
      emailNotification: result.emailNotification,
      data: result,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    if (req.user.role !== 'admin' && req.user.id !== id) {
      throw new ForbiddenException(
        'You do not have permission to view this user.',
      );
    }

    const user = await this.userService.findOneById(id);
    return { statusCode: HttpStatus.OK, data: user };
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() body: UpdateProfileBody,
    @Req() req: AuthenticatedRequest,
  ) {
    if (req.user.role !== 'admin' && req.user.id !== id) {
      throw new ForbiddenException(
        'You do not have permission to update this user.',
      );
    }

    const allowedData = {
      ...(body.name !== undefined && { name: body.name.trim() }),
      ...(body.phone !== undefined && { phone: body.phone.trim() }),
      ...(body.image !== undefined && { image: body.image.trim() }),
    };

    const user = await this.userService.updateProfile(id, allowedData);
    return { statusCode: HttpStatus.OK, message: 'Profile updated', data: user };
  }

  /** Admin-only direct role assignment (auto-creates Vendor profile & sends email) */
  @Patch(':id/role')
  @Roles(['admin'])
  async updateRole(
    @Param('id') targetUserId: string,
    @Body('role') newRole: UserRole,
    @Req() req: AuthenticatedRequest,
  ) {
    if (!newRole) {
      throw new BadRequestException('Role is required.');
    }

    const { emailNotification, ...user } = await this.userService.updateRole(
      req.user.role,
      targetUserId,
      newRole,
    );

    return {
      statusCode: HttpStatus.OK,
      message: `User role updated to ${newRole}`,
      emailNotification,
      data: user,
    };
  }

  @Delete(':id')
  @Roles(['admin'])
  async remove(@Param('id') id: string) {
    const { emailNotification, ...deletedUser } =
      await this.userService.remove(id);

    return {
      statusCode: HttpStatus.OK,
      message: 'User deleted successfully',
      emailNotification,
      data: deletedUser,
    };
  }
}