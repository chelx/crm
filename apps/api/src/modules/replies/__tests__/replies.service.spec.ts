// @ts-nocheck
import 'jest';
import { Test, TestingModule } from '@nestjs/testing';
import { RepliesService } from '../replies.service';
import { PrismaService } from '../../../infra/prisma/prisma.service';
import { AuditService } from '../../audit/audit.service';
import { NotificationService } from '../../notifications/notification.service';
import { ReplyStatus, UserRole } from '@prisma/client';

describe('RepliesService', () => {
  let service: RepliesService;
  const prisma = {
    reply: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  } as any;

  const audit = { log: jest.fn() } as any;
  const notification = {
    notifyReplyApproved: jest.fn(),
    notifyReplyRejected: jest.fn(),
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RepliesService,
        { provide: PrismaService, useValue: prisma },
        { provide: AuditService, useValue: audit },
        { provide: NotificationService, useValue: notification },
      ],
    }).compile();

    service = module.get(RepliesService);
    jest.resetAllMocks();
    // defaults used in some tests
    prisma.reply.findUnique.mockResolvedValue({ id: 'r', status: ReplyStatus.DRAFT } as any);
  });

  it('approves a submitted reply and sends notifications/audit', async () => {
    const replyId = 'r1';
    prisma.reply.findUnique.mockResolvedValue({ id: replyId, status: ReplyStatus.SUBMITTED } as any);
    prisma.reply.update.mockResolvedValue({
      id: replyId,
      status: ReplyStatus.APPROVED,
      submittedBy: 'u1',
      feedback: { customer: { name: 'Acme' } },
    } as any);

    const result = await service.approve(replyId, { comment: 'ok' } as any, 'mgr', UserRole.MANAGER);

    expect(prisma.reply.update).toHaveBeenCalled();
    expect(audit.log).toHaveBeenCalledWith(expect.objectContaining({ action: 'reply.approved' }));
    expect(notification.notifyReplyApproved).toHaveBeenCalledWith('u1', 'r1', 'Acme');
    expect(result.status).toBe(ReplyStatus.APPROVED);
  });

  it('rejects a submitted reply and sends notifications/audit', async () => {
    const replyId = 'r2';
    prisma.reply.findUnique.mockResolvedValue({ id: replyId, status: ReplyStatus.SUBMITTED } as any);
    prisma.reply.update.mockResolvedValue({
      id: replyId,
      status: ReplyStatus.REJECTED,
      submittedBy: 'u1',
      feedback: { customer: { name: 'Acme' } },
    } as any);

    const result = await service.reject(replyId, { comment: 'fix' } as any, 'mgr', UserRole.MANAGER);

    expect(prisma.reply.update).toHaveBeenCalled();
    expect(audit.log).toHaveBeenCalledWith(expect.objectContaining({ action: 'reply.rejected' }));
    expect(notification.notifyReplyRejected).toHaveBeenCalledWith('u1', 'r2', 'Acme', 'fix');
    expect(result.status).toBe(ReplyStatus.REJECTED);
  });

  it('throws when approve called on non-submitted reply', async () => {
    prisma.reply.findUnique.mockResolvedValue({ id: 'r3', status: ReplyStatus.DRAFT } as any);
    await expect(
      service.approve('r3', { comment: '' } as any, 'mgr', UserRole.MANAGER),
    ).rejects.toBeTruthy();
  });

  it('forbids approve when user is not manager', async () => {
    prisma.reply.findUnique.mockResolvedValue({ id: 'r4', status: ReplyStatus.SUBMITTED } as any);
    await expect(
      service.approve('r4', { comment: '' } as any, 'cso', UserRole.CSO),
    ).rejects.toBeTruthy();
  });

  it('submits a draft reply', async () => {
    prisma.reply.findUnique.mockResolvedValue({ id: 'r5', status: ReplyStatus.DRAFT, submittedBy: 'u1' } as any);
    prisma.reply.update.mockResolvedValue({ id: 'r5', status: ReplyStatus.SUBMITTED } as any);
    const res = await service.submit('r5', { } as any, 'u1');
    expect(res.status).toBe(ReplyStatus.SUBMITTED);
  });
});


