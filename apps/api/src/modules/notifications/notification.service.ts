import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/infra/prisma/prisma.service';
import { NotificationStatus } from '@prisma/client';

export interface CreateNotificationDto {
  userId: string;
  type: string;
  title: string;
  message: string;
  payload?: any;
}

export interface NotificationQueryDto {
  userId?: string;
  status?: NotificationStatus;
  type?: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(private prisma: PrismaService) {}

  async create(createNotificationDto: CreateNotificationDto) {
    const notification = await this.prisma.notification.create({
      data: {
        userId: createNotificationDto.userId,
        type: createNotificationDto.type,
        title: createNotificationDto.title,
        message: createNotificationDto.message,
        payload: createNotificationDto.payload || {},
        status: NotificationStatus.PENDING,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    });

    // Mark as delivered immediately for in-app notifications
    await this.markAsDelivered(notification.id);

    return notification;
  }

  async findAll(queryDto: NotificationQueryDto) {
    const { userId, status, type } = queryDto;
    const pageNum = Number((queryDto as any).page ?? 1) || 1;
    const limitNum = Number((queryDto as any).limit ?? 20) || 20;
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (userId) {
      where.userId = userId;
    }

    if (status) {
      where.status = status;
    }

    if (type) {
      where.type = type;
    }

    const [notifications, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              role: true,
            },
          },
        },
      }),
      this.prisma.notification.count({ where }),
    ]);

    return {
      data: notifications,
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  }

  async findUserNotifications(userId: string, status?: NotificationStatus) {
    const where: any = { userId };
    if (status) {
      where.status = status;
    }

    return this.prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async markAsRead(notificationId: string, userId: string) {
    return this.prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId,
      },
      data: {
        status: NotificationStatus.READ,
        readAt: new Date(),
      },
    });
  }

  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: {
        userId,
        status: {
          in: [NotificationStatus.PENDING, NotificationStatus.DELIVERED],
        },
      },
      data: {
        status: NotificationStatus.READ,
        readAt: new Date(),
      },
    });
  }

  async markAsDelivered(notificationId: string) {
    return this.prisma.notification.update({
      where: { id: notificationId },
      data: {
        status: NotificationStatus.DELIVERED,
        deliveredAt: new Date(),
      },
    });
  }

  async markAsFailed(notificationId: string) {
    return this.prisma.notification.update({
      where: { id: notificationId },
      data: {
        status: NotificationStatus.FAILED,
      },
    });
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.prisma.notification.count({
      where: {
        userId,
        status: {
          in: [NotificationStatus.PENDING, NotificationStatus.DELIVERED],
        },
      },
    });
  }

  async deleteOldNotifications(daysOld: number = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await this.prisma.notification.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
        status: NotificationStatus.READ,
      },
    });

    this.logger.log(`Deleted ${result.count} old notifications`);
    return result.count;
  }

  // Notification creation helpers for common events
  async notifyReplyApproved(userId: string, replyId: string, customerName: string) {
    return this.create({
      userId,
      type: 'reply.approved',
      title: 'Reply Approved',
      message: `Your reply for ${customerName} has been approved and is ready to send.`,
      payload: { replyId, customerName },
    });
  }

  async notifyReplyRejected(userId: string, replyId: string, customerName: string, reason?: string) {
    return this.create({
      userId,
      type: 'reply.rejected',
      title: 'Reply Rejected',
      message: `Your reply for ${customerName} has been rejected${reason ? `: ${reason}` : '.'}`,
      payload: { replyId, customerName, reason },
    });
  }

  async notifyFeedbackAssigned(userId: string, feedbackId: string, customerName: string) {
    return this.create({
      userId,
      type: 'feedback.assigned',
      title: 'New Feedback Assigned',
      message: `You have been assigned new feedback from ${customerName}.`,
      payload: { feedbackId, customerName },
    });
  }

  async notifyCustomerUpdated(userId: string, customerId: string, customerName: string) {
    return this.create({
      userId,
      type: 'customer.updated',
      title: 'Customer Updated',
      message: `Customer ${customerName} has been updated.`,
      payload: { customerId, customerName },
    });
  }

  async notifyReplySubmitted(userId: string, replyId: string, customerName: string) {
    return this.create({
      userId,
      type: 'reply.submitted',
      title: 'Reply Submitted for Review',
      message: `A reply for ${customerName} has been submitted and is waiting for your approval.`,
      payload: { replyId, customerName },
    });
  }
}
