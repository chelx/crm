// @ts-nocheck
import { Test, TestingModule } from '@nestjs/testing';
import { ReportsService } from '../../reports/reports.service';
import { PrismaService } from '@/infra/prisma/prisma.service';

describe('ReportsService', () => {
  let service: ReportsService;
  let prisma: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportsService,
        {
          provide: PrismaService,
          useValue: {
            feedback: {
              findMany: jest.fn(),
            },
            reply: {
              findMany: jest.fn(),
              groupBy: jest.fn(),
            },
            user: {
              findMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<ReportsService>(ReportsService);
    prisma = module.get(PrismaService) as any;
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('getFeedbackVolume', () => {
    it('groups feedback by day', async () => {
      prisma.feedback.findMany.mockResolvedValueOnce([
        { id: 'f1', createdAt: new Date('2025-01-01T10:00:00Z'), channel: 'email' },
        { id: 'f2', createdAt: new Date('2025-01-01T12:00:00Z'), channel: 'email' },
        { id: 'f3', createdAt: new Date('2025-01-02T09:00:00Z'), channel: 'chat' },
      ] as any);

      const result = await service.getFeedbackVolume({ groupBy: 'day' });

      expect(result.series).toEqual([
        { date: '2025-01-01', count: 2 },
        { date: '2025-01-02', count: 1 },
      ]);
      expect(prisma.feedback.findMany).toHaveBeenCalled();
    });

    it('returns empty series when no data and applies filters', async () => {
      prisma.feedback.findMany.mockResolvedValueOnce([] as any);
      const result = await service.getFeedbackVolume({ from: '2025-01-01', to: '2025-01-31', channel: 'email', groupBy: 'week' });
      expect(result.series).toEqual([]);
      const args = (prisma.feedback.findMany as any).mock.calls[0][0];
      expect(args.where.channel).toBe('email');
      expect(args.where.createdAt.gte).toBeInstanceOf(Date);
      expect(args.where.createdAt.lte).toBeInstanceOf(Date);
    });

    it('groups by week and month', async () => {
      prisma.feedback.findMany.mockResolvedValueOnce([
        { id: 'f1', createdAt: new Date('2025-01-01T10:00:00Z'), channel: 'email' },
        { id: 'f2', createdAt: new Date('2025-01-08T12:00:00Z'), channel: 'email' },
      ] as any);
      const weekRes = await service.getFeedbackVolume({ groupBy: 'week' });
      expect(Array.isArray(weekRes.series)).toBe(true);

      prisma.feedback.findMany.mockResolvedValueOnce([
        { id: 'f1', createdAt: new Date('2025-01-01T10:00:00Z'), channel: 'email' },
      ] as any);
      const monthRes = await service.getFeedbackVolume({ groupBy: 'month' });
      expect(monthRes.series[0].date).toMatch(/^2025-01$/);
    });

    it('propagates prisma errors', async () => {
      prisma.feedback.findMany.mockRejectedValueOnce(new Error('db error'));
      await expect(service.getFeedbackVolume({})).rejects.toBeTruthy();
    });
  });

  describe('getRepliesMetrics', () => {
    it('computes averages for approval and reply turnaround', async () => {
      prisma.reply.findMany
        .mockResolvedValueOnce([
          // approved replies with reviewedAt
          { createdAt: new Date('2025-01-01T00:00:00Z'), reviewedAt: new Date('2025-01-02T00:00:00Z') }, // 24h
          { createdAt: new Date('2025-01-01T00:00:00Z'), reviewedAt: new Date('2025-01-01T12:00:00Z') }, // 12h
        ] as any)
        .mockResolvedValueOnce([
          // all replies
          { createdAt: new Date('2025-01-01T01:00:00Z'), feedbackId: 'fb1' },
          { createdAt: new Date('2025-01-01T03:00:00Z'), feedbackId: 'fb2' },
        ] as any);

      (prisma.feedback.findMany as any).mockResolvedValueOnce([
        { id: 'fb1', createdAt: new Date('2025-01-01T00:00:00Z') },
        { id: 'fb2', createdAt: new Date('2025-01-01T02:00:00Z') },
      ]);

      const result = await service.getRepliesMetrics({});

      // avg approval = (24 + 12) / 2 = 18h
      expect(result.avgApprovalHours).toBe(18);
      // reply durations = (1h, 1h) => avg 1h
      expect(result.avgReplyHours).toBe(1);
      expect(result.totalApproved).toBe(2);
      expect(result.totalReplies).toBe(2);
    });
  });

  describe('getWorkload', () => {
    it('returns workload per submittedBy', async () => {
      prisma.reply.groupBy.mockResolvedValueOnce([
        { submittedBy: 'u1', _count: { _all: 5 } },
        { submittedBy: 'u2', _count: { _all: 3 } },
      ] as any);
      prisma.user.findMany.mockResolvedValueOnce([
        { id: 'u1', email: 'a@example.com', role: 'CSO' },
        { id: 'u2', email: 'b@example.com', role: 'MANAGER' },
      ] as any);

      const result = await service.getWorkload({});
      expect(result).toEqual([
        { userId: 'u1', email: 'a@example.com', role: 'CSO', totalReplies: 5 },
        { userId: 'u2', email: 'b@example.com', role: 'MANAGER', totalReplies: 3 },
      ]);
    });

    it('handles empty workload', async () => {
      prisma.reply.groupBy.mockResolvedValueOnce([] as any);
      prisma.user.findMany.mockResolvedValueOnce([] as any);
      const result = await service.getWorkload({});
      expect(result).toEqual([]);
    });
  });
});


