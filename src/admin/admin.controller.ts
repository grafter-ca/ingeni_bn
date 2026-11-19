import {
  Controller,
  Get,
  Patch,
  Body,
  Query,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '@thallesp/nestjs-better-auth';
import { AdminService, PlatformConfigState } from './admin.service.js';

@Controller('admin')
@UseGuards(RolesGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('logs')
  @Roles(['admin'])
  async getLogs(@Query('limit') limit?: string) {
    const parsed = limit ? parseInt(limit, 10) : 200;
    const safeLimit = Number.isNaN(parsed)
      ? 200
      : Math.min(Math.max(parsed, 1), 500);

    const data = await this.adminService.getLogs(safeLimit);
    return {
      statusCode: HttpStatus.OK,
      data,
    };
  }

  @Get('config')
  @Roles(['admin'])
  async getConfig() {
    const data = this.adminService.getConfig();
    return {
      statusCode: HttpStatus.OK,
      data,
    };
  }

  @Patch('config')
  @Roles(['admin'])
  async updateConfig(@Body() body: Partial<PlatformConfigState>) {
    const data = this.adminService.updateConfig(body);
    return {
      statusCode: HttpStatus.OK,
      message: 'Global configuration updated',
      data,
    };
  }
}