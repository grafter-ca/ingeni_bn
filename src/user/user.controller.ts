import { 
  Controller, Get, Body, Patch, Param, Delete, 
  Query, HttpStatus, HttpCode,
  UseGuards,
  ForbiddenException,
  Req
} from '@nestjs/common';
import { UserService } from './user.service.js';
import { UserRole } from '../../generated/prisma/index.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '@thallesp/nestjs-better-auth';
import { Request } from 'express';

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
    const take = limit ? parseInt(limit) : 10;
    const skip = offset ? parseInt(offset) : 0;

    const users = await this.userService.findAll(role, search, take, skip);
    return {
      statusCode: HttpStatus.OK,
      message: 'Users retrieved successfully',
      meta: { total: users.length, limit: take, offset: skip },
      data: users,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const user = await this.userService.findOneById(id);
    return { statusCode: HttpStatus.OK, data: user };
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateData: Record<string, any>) {
    const user = await this.userService.updateProfile(id, updateData);
    return { statusCode: HttpStatus.OK, message: 'Profile updated', data: user };
  }

  /**
   * Update User Role
   * Handles both "Become a Vendor" and Admin-led role changes
   */
  @Patch(':id/role')
  async updateRole(
    @Param('id') targetUserId: string,
    @Body('role') newRole: UserRole,
    @Req() req: Request & { user: { id: string; role: UserRole } } // Type for authenticated user
  ) {
    const currentUser = req.user;

    // 1. SECURITY: Only an ADMIN can assign someone to ADMIN
    if (newRole === 'admin' && currentUser.role !== 'admin') {
      throw new ForbiddenException('Only admins can assign the "admin" role.');
    }

    // 2. SECURITY: Non-admins can only upgrade themselves to VENDOR
    if (targetUserId !== currentUser.id && currentUser.role !== 'admin') {
      throw new ForbiddenException('You do not have permission to change this user’s role.');
    }

    const user = await this.userService.updateProfile(targetUserId, { role: newRole });
    
    return { 
      statusCode: HttpStatus.OK, 
      message: `User role updated to ${newRole}`, 
      data: user 
    };
  }

   /** Users can request a vendor role, but actual role change handled by admin */
  @Patch('me/request-role')
  async requestVendorRole(@Req() req: Request & { user: { id: string; role: UserRole } }) {
    if (req.user.role !== 'user') {
      return { statusCode: HttpStatus.BAD_REQUEST, message: 'Already vendor/admin' };
    }
    return { statusCode: HttpStatus.OK, message: 'Request sent to admin for approval' };
  }

  @Delete(':id')
  @Roles(['admin'])
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.userService.remove(id);
    return; // No content response
  }
}