import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/infra/prisma/prisma.service';

export interface DateRangeQuery {
  from?: string;
  to?: string;
}

export type GroupBy = 'day' | 'week' | 'month';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  private buildDateRangeWhere(from?: string, to?: string) {
    if (!from && !to) return undefined;
    const createdAt: any = {};
    if (from) createdAt.gte = new Date(from);
    if (to) createdAt.lte = new Date(to);
    return { createdAt };
  }

  private formatDate(date: Date, groupBy: GroupBy): string {
    const d = new Date(date);
    if (groupBy === 'day') return d.toISOString().slice(0, 10);
    if (groupBy === 'week') {
      const firstJan = new Date(d.getFullYear(), 0, 1);
      const pastDaysOfYear = (d.getTime() - firstJan.getTime()) / 86400000;
      const week = Math.ceil((pastDaysOfYear + firstJan.getDay() + 1) / 7);
      return `${d.getFullYear()}-W${week}`;
    }
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }

  async getFeedbackVolume(params: { from?: string; to?: string; groupBy?: GroupBy; channel?: string }) {
    const { from, to, groupBy = 'day', channel } = params;
    const where: any = this.buildDateRangeWhere(from, to) || {};
    if (channel) where.channel = channel;

    const feedback = await this.prisma.feedback.findMany({
      where,
      select: { id: true, createdAt: true, channel: true },
      orderBy: { createdAt: 'asc' },
    });

    const seriesMap = new Map<string, number>();
    for (const f of feedback) {
      const key = this.formatDate(f.createdAt, groupBy);
      seriesMap.set(key, (seriesMap.get(key) || 0) + 1);
    }

    const series = Array.from(seriesMap.entries())
      .sort(([a], [b]) => (a > b ? 1 : -1))
      .map(([date, count]) => ({ date, count }));

    return { series };
  }

  async getRepliesMetrics(params: { from?: string; to?: string }) {
    const { from, to } = params;
    const whereReply: any = this.buildDateRangeWhere(from, to) || {};

    const approved = await this.prisma.reply.findMany({
      where: {
        ...whereReply,
        reviewedAt: { not: null },
      },
      select: { createdAt: true, reviewedAt: true },
    });

    const allReplies = await this.prisma.reply.findMany({
      where: whereReply,
      select: { createdAt: true, feedbackId: true },
    });

    const feedbackById = new Map<string, Date>();
    if (allReplies.length > 0) {
      const feedbackIds = Array.from(new Set(allReplies.map((r) => r.feedbackId)));
      const feedback = await this.prisma.feedback.findMany({
        where: { id: { in: feedbackIds } },
        select: { id: true, createdAt: true },
      });
      feedback.forEach((f) => feedbackById.set(f.id, f.createdAt));
    }

    const approvalDurationsMs = approved
      .filter((r) => r.reviewedAt)
      .map((r) => (r.reviewedAt!.getTime() - r.createdAt.getTime()));
    const avgApprovalHours = approvalDurationsMs.length
      ? approvalDurationsMs.reduce((a, b) => a + b, 0) / approvalDurationsMs.length / 36e5
      : 0;

    const replyDurationsMs = allReplies
      .map((r) => {
        const feedbackCreated = feedbackById.get(r.feedbackId);
        return feedbackCreated ? r.createdAt.getTime() - feedbackCreated.getTime() : undefined;
      })
      .filter((v): v is number => typeof v === 'number');
    const avgReplyHours = replyDurationsMs.length
      ? replyDurationsMs.reduce((a, b) => a + b, 0) / replyDurationsMs.length / 36e5
      : 0;

    return {
      avgApprovalHours: Number(avgApprovalHours.toFixed(2)),
      avgReplyHours: Number(avgReplyHours.toFixed(2)),
      totalApproved: approved.length,
      totalReplies: allReplies.length,
    };
  }

  async getWorkload(params: { from?: string; to?: string }) {
    const { from, to } = params;
    const where: any = this.buildDateRangeWhere(from, to) || {};
    const byUser = await this.prisma.reply.groupBy({
      by: ['submittedBy'],
      _count: { _all: true },
      where,
    });

    const users = await this.prisma.user.findMany({
      where: { id: { in: byUser.map((b) => b.submittedBy) } },
      select: { id: true, email: true, role: true },
    });
    const userMap = new Map(users.map((u) => [u.id, u] as const));

    return byUser
      .map((b) => ({
        userId: b.submittedBy,
        email: userMap.get(b.submittedBy)?.email || 'unknown',
        role: userMap.get(b.submittedBy)?.role || 'CSO',
        totalReplies: b._count._all,
      }))
      .sort((a, b) => b.totalReplies - a.totalReplies);
  }
}


