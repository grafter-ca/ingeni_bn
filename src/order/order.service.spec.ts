import { Test, TestingModule } from '@nestjs/testing';
import { OrderService } from './order.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { EmailService } from '../libs/nodemail/email.service.js';
import { SocketGateway } from '../socket/socket.gateway.js';
import { beforeEach, describe, expect, it } from '@jest/globals';
import { jest } from '@jest/globals';

describe('OrderService', () => {
  let service: OrderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        {
          provide: PrismaService,
          useValue: {
            order: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
        {
          provide: EmailService,
          useValue: {
            sendEmail: jest.fn(),
          },
        },
        {
          provide: SocketGateway,
          useValue: {
            server: {
              emit: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});