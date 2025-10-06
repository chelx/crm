// @ts-nocheck
import 'jest';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth.service';
import { PrismaService } from '../../../infra/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuditService } from '../../audit/audit.service';
import { BruteForceDetectionService } from '../../security/brute-force-detection.service';

describe.skip('AuthService (extended)', () => {
  let service: AuthService;
  const prisma = {
    user: { findUnique: jest.fn(), create: jest.fn() },
    refreshToken: {
      create: jest.fn(),
      findFirst: jest.fn(),
      deleteMany: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn(),
  } as any;
  const jwt = { sign: jest.fn().mockReturnValue('access-token') } as any;
  const config = { get: jest.fn() } as any;
  const audit = { log: jest.fn(), logAnonymous: jest.fn() } as any;
  const brute = {
    isBlocked: jest.fn().mockResolvedValue(false),
    recordLoginAttempt: jest.fn().mockResolvedValue(true),
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwt },
        { provide: ConfigService, useValue: config },
        { provide: AuditService, useValue: audit },
        { provide: BruteForceDetectionService, useValue: brute },
      ],
    }).compile();

    service = module.get(AuthService);
    jest.resetAllMocks();
  });

  describe('login', () => {
    it('logs success and returns tokens', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'u1', email: 'a@a.com', role: 'CSO', password: 'salt:hash' });
      jest.spyOn(service, 'verifyPassword' as any).mockResolvedValue(true);
      jest.spyOn(service as any, 'generateRefreshToken').mockResolvedValue('rt');
      prisma.refreshToken.create.mockResolvedValue({});

      const res = await service.login({ email: 'a@a.com', password: 'x' } as any, '1.1.1.1');
      expect(res.accessToken).toBeDefined();
      expect(audit.log).toHaveBeenCalledWith(expect.objectContaining({ action: 'auth.login.success' }));
      expect(brute.recordLoginAttempt).toHaveBeenCalledWith('a@a.com', '1.1.1.1', true);
    });

    it('logs failed login and throws', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      await expect(service.login({ email: 'a@a.com', password: 'x' } as any, '1.1.1.1')).rejects.toBeTruthy();
      expect(audit.logAnonymous).toHaveBeenCalledWith('auth.login.failed', 'auth', expect.any(Object));
      expect(brute.recordLoginAttempt).toHaveBeenCalledWith('a@a.com', '1.1.1.1', false);
    });

    it('blocks when brute force detected', async () => {
      brute.isBlocked.mockResolvedValueOnce(true);
      await expect(service.login({ email: 'a@a.com', password: 'x' } as any, '1.1.1.1')).rejects.toBeTruthy();
    });
  });

  describe('refreshToken', () => {
    it('refreshes and logs success', async () => {
      prisma.refreshToken.findFirst.mockResolvedValue({ id: 't1', user: { id: 'u1', email: 'a@a.com', role: 'CSO' } });
      prisma.refreshToken.update.mockResolvedValue({});
      prisma.refreshToken.create.mockResolvedValue({});
      jest.spyOn(service as any, 'rotateRefreshToken').mockResolvedValue('rt2');
      const res = await service.refreshToken({ refreshToken: 'foo' } as any);
      expect(res.accessToken).toBeDefined();
      expect(audit.log).toHaveBeenCalledWith(expect.objectContaining({ action: 'auth.refresh.success' }));
    });

    it('logs failed refresh', async () => {
      prisma.refreshToken.findFirst.mockResolvedValue(null);
      await expect(service.refreshToken({ refreshToken: 'foo' } as any)).rejects.toBeTruthy();
      expect(audit.logAnonymous).toHaveBeenCalledWith('auth.refresh.failed', 'auth');
    });
  });

  describe('logout', () => {
    it('logs logout', async () => {
      prisma.refreshToken.deleteMany.mockResolvedValue({});
      await service.logout('u1', 'rt');
      expect(audit.log).toHaveBeenCalledWith(expect.objectContaining({ action: 'auth.logout' }));
    });
  });
});


