import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/infra/prisma/prisma.service';

@Injectable()
export class RetentionPolicyService {
  private readonly logger = new Logger(RetentionPolicyService.name);
  private readonly retentionDays: number;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    this.retentionDays = this.configService.get<number>('AUDIT_RETENTION_DAYS', 90);
  }

  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async cleanupOldAuditLogs() {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - this.retentionDays);

      const result = await this.prisma.auditLog.deleteMany({
        where: {
          createdAt: {
            lt: cutoffDate,
          },
        },
      });

      this.logger.log(`Cleaned up ${result.count} audit logs older than ${this.retentionDays} days`);
    } catch (error) {
      this.logger.error('Failed to cleanup old audit logs', error);
    }
  }

  async getRetentionStats() {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.retentionDays);

    const [totalLogs, logsToDelete, oldestLog] = await Promise.all([
      this.prisma.auditLog.count(),
      this.prisma.auditLog.count({
        where: {
          createdAt: {
            lt: cutoffDate,
          },
        },
      }),
      this.prisma.auditLog.findFirst({
        orderBy: {
          createdAt: 'asc',
        },
        select: {
          createdAt: true,
        },
      }),
    ]);

    return {
      totalLogs,
      logsToDelete,
      retentionDays: this.retentionDays,
      cutoffDate,
      oldestLogDate: oldestLog?.createdAt,
    };
  }
}
