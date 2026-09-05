import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller.js';
import { HealthService } from './health.service.js';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';

describe('HealthController', () => {
  let controller: HealthController;
  let service: HealthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: HealthService,
          useValue: {
            getHealthStatus: jest.fn().mockReturnValue({
              status: 'ok',
              timestamp: '2026-01-01T00:00:00.000Z',
              uptime: 100,
            }),
            getRootStatus: jest.fn().mockReturnValue({
              message: 'API is running successfully',
            }),
          },
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    service = module.get<HealthService>(HealthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('checkHealth', () => {
    it('should return health status from service', () => {
      const result = controller.checkHealth();
      expect(service.getHealthStatus).toHaveBeenCalled();
      expect(result).toEqual({
        status: 'ok',
        timestamp: '2026-01-01T00:00:00.000Z',
        uptime: 100,
      });
    });
  });

  describe('getRoot', () => {
    it('should return root status from service', () => {
      const result = controller.getRoot();
      expect(service.getRootStatus).toHaveBeenCalled();
      expect(result).toEqual({ message: 'API is running successfully' });
    });
  });
});