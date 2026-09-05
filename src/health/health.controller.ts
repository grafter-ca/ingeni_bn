import { Controller, Get } from '@nestjs/common';
import { HealthService } from './health.service.js';
import { AllowAnonymous } from '@thallesp/nestjs-better-auth';

@Controller()
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @AllowAnonymous()
  @Get('health')
  checkHealth() {
    return this.healthService.getHealthStatus();
  }

  @AllowAnonymous()
  @Get()
  getRoot() {
    return this.healthService.getRootStatus();
  }
}