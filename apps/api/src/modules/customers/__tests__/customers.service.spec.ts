// @ts-nocheck
import 'jest';
import { Test, TestingModule } from '@nestjs/testing';
import { CustomersService } from '../customers.service';
import { PrismaService } from '../../../infra/prisma/prisma.service';
import { AuditService } from '../../audit/audit.service';
import { NotificationService } from '../../notifications/notification.service';

describe('CustomersService', () => {
  let service: CustomersService;
  const prisma = {
    customer: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    user: { findMany: jest.fn() },
    feedback: { updateMany: jest.fn() },
  } as any;
  const audit = { log: jest.fn() } as any;
  const notification = { notifyCustomerUpdated: jest.fn() } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomersService,
        { provide: PrismaService, useValue: prisma },
        { provide: AuditService, useValue: audit },
        { provide: NotificationService, useValue: notification },
      ],
    }).compile();

    service = module.get(CustomersService);
    jest.resetAllMocks();
  });

  it('updates customer and notifies managers', async () => {
    prisma.customer.findOne = undefined;
    prisma.customer.findFirst.mockResolvedValue({ id: 'c1', email: 'a@a.com', phone: '1' });
    prisma.customer.update.mockResolvedValue({ id: 'c1', name: 'Acme' });
    prisma.user.findMany.mockResolvedValue([{ id: 'm1' }, { id: 'm2' }]);

    await service.update('c1', { name: 'Acme' } as any, 'MANAGER' as any, 'mgr');

    expect(prisma.customer.update).toHaveBeenCalled();
    expect(audit.log).toHaveBeenCalledWith(expect.objectContaining({ action: 'customer.updated' }));
    expect(notification.notifyCustomerUpdated).toHaveBeenCalledTimes(2);
  });

  it('merge throws when same ids', async () => {
    await expect(
      service.merge('c1', 'c1', 'MANAGER' as any, 'mgr'),
    ).rejects.toBeTruthy();
  });

  it('forbids delete when role not manager', async () => {
    prisma.customer.findFirst.mockResolvedValue({ id: 'c1' });
    await expect(
      service.remove('c1', 'CSO' as any, 'u1'),
    ).rejects.toBeTruthy();
  });
});


