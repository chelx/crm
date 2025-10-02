import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/infra/prisma/prisma.service';
import { AuditQueryDto } from './dtos/audit.dto';

export interface AuditLogData {
  actorId: string;
  action: string;
  resource: string;
  metadata?: any;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private prisma: PrismaService) {}

  async log(auditData: AuditLogData) {
    try {
      await this.prisma.auditLog.create({
        data: {
          actorId: auditData.actorId,
          action: auditData.action,
          resource: auditData.resource,
          metadata: auditData.metadata || {},
        },
      });
    } catch (error) {
      this.logger.error('Failed to create audit log', error);
      // Don't throw error to avoid breaking the main operation
    }
  }

  async findAll(queryDto: AuditQueryDto) {
    const { actorId, action, resource, from, to, page = 1, limit = 20 } = queryDto;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (actorId) {
      where.actorId = actorId;
    }

    if (action) {
      where.action = {
        contains: action,
        mode: 'insensitive',
      };
    }

    if (resource) {
      where.resource = {
        contains: resource,
        mode: 'insensitive',
      };
    }

    if (from || to) {
      where.createdAt = {};
      if (from) {
        where.createdAt.gte = new Date(from);
      }
      if (to) {
        where.createdAt.lte = new Date(to);
      }
    }

    const [auditLogs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          actor: {
            select: {
              id: true,
              email: true,
              role: true,
            },
          },
        },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      data: auditLogs,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const auditLog = await this.prisma.auditLog.findUnique({
      where: { id },
      include: {
        actor: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!auditLog) {
      throw new Error('Audit log not found');
    }

    return auditLog;
  }

  async getAuditStats() {
    const [total, byAction, recentCount] = await Promise.all([
      this.prisma.auditLog.count(),
      this.prisma.auditLog.groupBy({
        by: ['action'],
        _count: {
          action: true,
        },
        orderBy: {
          _count: {
            action: 'desc',
          },
        },
        take: 10,
      }),
      this.prisma.auditLog.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
          },
        },
      }),
    ]);

    const actionStats = byAction.reduce((acc, item) => {
      acc[item.action] = item._count.action;
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      recentCount,
      topActions: actionStats,
    };
  }

  async getUserActivity(userId: string, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const activities = await this.prisma.auditLog.findMany({
      where: {
        actorId: userId,
        createdAt: {
          gte: startDate,
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return activities;
  }

  async getResourceHistory(resource: string) {
    const history = await this.prisma.auditLog.findMany({
      where: {
        resource: {
          contains: resource,
          mode: 'insensitive',
        },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        actor: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return history;
  }
}
