import { Controller, Get, Patch, Delete, Param, Query, HttpStatus, UseGuards, Req, Body } from '@nestjs/common';
import { UserService } from './user.service.js';
import { Roles } from '@thallesp/nestjs-better-auth';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { UserRole } from '../../generated/prisma/index.js';
import { UpdateRoleDto } from '../dto/update-role.dto.js';

@Controller('admin/users')
@UseGuards(RolesGuard)
@Roles(['admin'])
export class UserAdminController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async findAll(@Query('role') role?: UserRole, @Query('search') search?: string, @Query('limit') limit?: string, @Query('offset') offset?: string) {
    const take = limit ? parseInt(limit) : 10;
    const skip = offset ? parseInt(offset) : 0;
    const users = await this.userService.findAll(role, search, take, skip);
    return { statusCode: HttpStatus.OK, meta: { total: users.length, limit: take, offset: skip }, data: users };
  }

  @Patch(':id/approve-role')
  async approveRoleUpgrade(@Param('id') targetUserId: string, @Req() req: any) {
    const adminId = req.user.id;
    const user = await this.userService.approveRoleUpgrade(adminId, targetUserId);
    return { statusCode: HttpStatus.OK, message: `Role upgraded to ${user.role}`, data: user };
  }

   /** Admin directly changes user role */
  @Patch(':id/role')
  async updateRole(@Param('id') targetUserId: string, @Body() dto: UpdateRoleDto, @Req() req: any) {
    const user = await this.userService.updateRole(req.user.role, targetUserId, dto.role);
    return { statusCode: HttpStatus.OK, message: `Role updated to ${dto.role}`, data: user };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.userService.remove(id);
    return { statusCode: HttpStatus.NO_CONTENT };
  }
}