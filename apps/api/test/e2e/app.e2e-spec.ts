// @ts-nocheck
import 'jest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/infra/prisma/prisma.service';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue({
        $connect: jest.fn(),
        $disconnect: jest.fn(),
        user: {
          findUnique: jest.fn(),
          create: jest.fn(),
        },
        customer: {
          findMany: jest.fn(),
          count: jest.fn(),
        },
        feedback: {
          findMany: jest.fn(),
          count: jest.fn(),
        },
        reply: {
          findMany: jest.fn(),
          count: jest.fn(),
        },
        auditLog: {
          findMany: jest.fn(),
          count: jest.fn(),
        },
      })
      .compile();

    app = moduleFixture.createNestApplication();
    prismaService = moduleFixture.get<PrismaService>(PrismaService);
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect((res) => {
        expect(res.body.success).toBe(true);
        expect(res.body.data).toBe('CRM API is running!');
        expect(res.body.message).toBe('Operation completed successfully');
      });
  });

  it('/health (GET)', () => {
    return request(app.getHttpServer())
      .get('/health')
      .expect(200)
      .expect((res) => {
        expect(res.body.success).toBe(true);
        expect(res.body.data).toHaveProperty('status', 'ok');
        expect(res.body.data).toHaveProperty('timestamp');
        expect(res.body.data).toHaveProperty('uptime');
        expect(res.body.data).toHaveProperty('environment');
      });
  });
});