// @ts-nocheck
import 'jest';
import { Test, TestingModule } from '@nestjs/testing';
import { NotificationService } from '../notification.service';
import { PrismaService } from '../../../infra/prisma/prisma.service';
import { NotificationStatus } from '@prisma/client';

describe('NotificationService', () => {
  let service: NotificationService;
  const prisma = {
    notification: {
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      deleteMany: jest.fn(),
    },
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(NotificationService);
    jest.resetAllMocks();
  });

  it('creates notification and marks delivered', async () => {
    prisma.notification.create.mockResolvedValue({ id: 'n1', userId: 'u1' });
    prisma.notification.update.mockResolvedValue({ id: 'n1', status: NotificationStatus.DELIVERED });

    const res = await service.create({ userId: 'u1', type: 'reply.approved', title: 't', message: 'm' });
    expect(prisma.notification.create).toHaveBeenCalled();
    expect(prisma.notification.update).toHaveBeenCalledWith({
      where: { id: 'n1' },
      data: { status: NotificationStatus.DELIVERED, deliveredAt: expect.any(Date) },
    });
    expect(res.id).toBe('n1');
  });

  it('finds user notifications and unread count', async () => {
    prisma.notification.findMany.mockResolvedValue([{ id: 'n1' }]);
    prisma.notification.count.mockResolvedValue(2);

    const list = await service.findUserNotifications('u1');
    expect(list.length).toBe(1);

    const count = await service.getUnreadCount('u1');
    expect(count).toBe(2);
  });

  it('marks as read single and all', async () => {
    prisma.notification.updateMany.mockResolvedValue({ count: 1 });
    await service.markAsRead('n1', 'u1');
    expect(prisma.notification.updateMany).toHaveBeenCalledWith({
      where: { id: 'n1', userId: 'u1' },
      data: { status: NotificationStatus.READ, readAt: expect.any(Date) },
    });

    await service.markAllAsRead('u1');
    expect(prisma.notification.updateMany).toHaveBeenCalledWith({
      where: { userId: 'u1', status: { in: [NotificationStatus.PENDING, NotificationStatus.DELIVERED] } },
      data: { status: NotificationStatus.READ, readAt: expect.any(Date) },
    });
  });

  it('deletes old read notifications', async () => {
    prisma.notification.deleteMany.mockResolvedValue({ count: 3 });
    const removed = await service.deleteOldNotifications(10);
    expect(removed).toBe(3);
  });
});


