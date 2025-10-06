// @ts-nocheck
import 'jest';
import { Test, TestingModule } from '@nestjs/testing';
import { AuditController } from '../audit.controller';
import { AuditService } from '../audit.service';

describe('AuditController', () => {
  let controller: AuditController;
  const auditService = {
    findAll: jest.fn(),
    getAuditStats: jest.fn(),
    getUserActivity: jest.fn(),
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuditController],
      providers: [
        { provide: AuditService, useValue: auditService },
      ],
    })
      // Mock guards at module level if needed; here we unit-test controller logic only
      .compile();

    controller = module.get(AuditController);
    jest.resetAllMocks();
  });

  it('lists audits with pagination', async () => {
    auditService.findAll.mockResolvedValue({ data: [], meta: { total: 0, page: 1, limit: 20 } });
    const res = await controller.findAll({ page: 1, limit: 20 } as any);
    expect(res.meta.total).toBe(0);
    expect(auditService.findAll).toHaveBeenCalledWith({ page: 1, limit: 20 });
  });

  it('returns stats', async () => {
    auditService.getAuditStats.mockResolvedValue({ total: 1, recentCount: 1, topActions: {} });
    const res = await controller.getStats();
    expect(res.total).toBe(1);
  });

  it('returns my activity', async () => {
    auditService.getUserActivity.mockResolvedValue([{ id: 'a1' }]);
    const res = await controller.getMyActivity({ id: 'u1' } as any, 7);
    expect(res.length).toBe(1);
    expect(auditService.getUserActivity).toHaveBeenCalledWith('u1', 7);
  });
});


