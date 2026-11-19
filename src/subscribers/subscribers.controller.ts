import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '@thallesp/nestjs-better-auth';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { SubscribersService } from './subscribers.service.js';

@Controller('subscribers')
export class SubscribersController {
  constructor(private readonly subscribersService: SubscribersService) {}

  @Post()
  async subscribe(
    @Body() body: { email: string; name?: string; source?: string },
    @Req() req: any,
  ) {
    const sessionUser = req.user || req.session?.user || req.auth;
    return this.subscribersService.subscribe({
      email: body.email,
      name: body.name || sessionUser?.name,
      userId: sessionUser?.id || sessionUser?.sub,
      source: body.source || 'footer',
    });
  }

  @Get('unsubscribe')
  async unsubscribe(@Query('token') token: string) {
    return this.subscribersService.unsubscribe(token);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(['admin'])
  async findAll(@Query('includeInactive') includeInactive?: string) {
    return this.subscribersService.findAll(includeInactive === 'true');
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(['admin'])
  async remove(@Param('id') id: string) {
    return this.subscribersService.remove(id);
  }
}