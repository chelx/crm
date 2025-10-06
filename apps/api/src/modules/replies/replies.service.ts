import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '@/infra/prisma/prisma.service';
import { AuditService } from '@/modules/audit/audit.service';
import { NotificationService } from '@/modules/notifications/notification.service';
import { 
  CreateReplyDto, 
  UpdateReplyDto, 
  SubmitReplyDto, 
  ApproveReplyDto, 
  RejectReplyDto, 
  ReplyQueryDto 
} from './dtos/reply.dto';
import { UserRole, ReplyStatus } from '@prisma/client';

@Injectable()
export class RepliesService {
  constructor(
    private prisma: PrismaService, 
    private audit: AuditService,
    private notification: NotificationService,
  ) {}

  async create(createReplyDto: CreateReplyDto, userId: string) {
    // Verify feedback exists
    const feedback = await this.prisma.feedback.findUnique({
      where: { id: createReplyDto.feedbackId },
    });

    if (!feedback) {
      throw new NotFoundException('Feedback not found');
    }

    const reply = await this.prisma.reply.create({
      data: {
        feedbackId: createReplyDto.feedbackId,
        content: createReplyDto.content,
        status: createReplyDto.status || ReplyStatus.DRAFT,
        submittedBy: userId,
      },
      include: {
        feedback: {
          include: {
            customer: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    // Audit: reply.created
    await this.audit.log({
      actorId: userId,
      action: 'reply.created',
      resource: `reply:${reply.id}`,
      metadata: { feedbackId: createReplyDto.feedbackId },
    });

    return reply;
  }

  async findAll(queryDto: ReplyQueryDto) {
    const { feedbackId, status, page = 1, limit = 20 } = queryDto;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (feedbackId) {
      where.feedbackId = feedbackId;
    }

    if (status) {
      where.status = status;
    }

    const [replies, total] = await Promise.all([
      this.prisma.reply.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          feedback: {
            include: {
              customer: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.reply.count({ where }),
    ]);

    return {
      data: replies,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const reply = await this.prisma.reply.findUnique({
      where: { id },
      include: {
        feedback: {
          include: {
            customer: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            },
          },
        },
      },
    });

    if (!reply) {
      throw new NotFoundException('Reply not found');
    }

    return reply;
  }

  async update(id: string, updateReplyDto: UpdateReplyDto, userId: string, userRole: UserRole) {
    const reply = await this.findOne(id);

    // Only allow updates if reply is in DRAFT status or user is the submitter
    if (reply.status !== ReplyStatus.DRAFT && reply.submittedBy !== userId) {
      throw new ForbiddenException('Can only update draft replies or your own replies');
    }

    // Only allow status changes to SUBMITTED if current status is DRAFT
    if (updateReplyDto.status === ReplyStatus.SUBMITTED && reply.status !== ReplyStatus.DRAFT) {
      throw new BadRequestException('Can only submit draft replies');
    }

    const updatedReply = await this.prisma.reply.update({
      where: { id },
      data: updateReplyDto,
      include: {
        feedback: {
          include: {
            customer: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    // Audit: reply.updated
    await this.audit.log({
      actorId: userId,
      action: 'reply.updated',
      resource: `reply:${id}`,
    });

    return updatedReply;
  }

  async submit(id: string, submitReplyDto: SubmitReplyDto, userId: string) {
    const reply = await this.findOne(id);

    if (reply.status !== ReplyStatus.DRAFT) {
      throw new BadRequestException('Can only submit draft replies');
    }

    if (reply.submittedBy !== userId) {
      throw new ForbiddenException('Can only submit your own replies');
    }

    const updatedReply = await this.prisma.reply.update({
      where: { id },
      data: {
        status: ReplyStatus.SUBMITTED,
      },
      include: {
        feedback: {
          include: {
            customer: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    // Audit: reply.submitted
    await this.audit.log({
      actorId: userId,
      action: 'reply.submitted',
      resource: `reply:${id}`,
    });

    return updatedReply;
  }

  async approve(id: string, approveReplyDto: ApproveReplyDto, userId: string, userRole: UserRole) {
    if (userRole !== UserRole.MANAGER) {
      throw new ForbiddenException('Only managers can approve replies');
    }

    const reply = await this.findOne(id);

    if (reply.status !== ReplyStatus.SUBMITTED) {
      throw new BadRequestException('Can only approve submitted replies');
    }

    const updatedReply = await this.prisma.reply.update({
      where: { id },
      data: {
        status: ReplyStatus.APPROVED,
        reviewedBy: userId,
        reviewedAt: new Date(),
        comment: approveReplyDto.comment,
      },
      include: {
        feedback: {
          include: {
            customer: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    // Audit: reply.approved
    await this.audit.log({
      actorId: userId,
      action: 'reply.approved',
      resource: `reply:${id}`,
      metadata: { comment: approveReplyDto.comment },
    });

    // Notify submitter that reply was approved
    await this.notification.notifyReplyApproved(
      updatedReply.submittedBy,
      updatedReply.id,
      updatedReply.feedback.customer?.name || 'Customer',
    );

    return updatedReply;
  }

  async reject(id: string, rejectReplyDto: RejectReplyDto, userId: string, userRole: UserRole) {
    if (userRole !== UserRole.MANAGER) {
      throw new ForbiddenException('Only managers can reject replies');
    }

    const reply = await this.findOne(id);

    if (reply.status !== ReplyStatus.SUBMITTED) {
      throw new BadRequestException('Can only reject submitted replies');
    }

    const updatedReply = await this.prisma.reply.update({
      where: { id },
      data: {
        status: ReplyStatus.REJECTED,
        reviewedBy: userId,
        reviewedAt: new Date(),
        comment: rejectReplyDto.comment,
      },
      include: {
        feedback: {
          include: {
            customer: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    // Audit: reply.rejected
    await this.audit.log({
      actorId: userId,
      action: 'reply.rejected',
      resource: `reply:${id}`,
      metadata: { comment: rejectReplyDto.comment },
    });

    // Notify submitter that reply was rejected
    await this.notification.notifyReplyRejected(
      updatedReply.submittedBy,
      updatedReply.id,
      updatedReply.feedback.customer?.name || 'Customer',
      rejectReplyDto.comment,
    );

    return updatedReply;
  }

  async getApprovalQueue(userRole: UserRole) {
    if (userRole !== UserRole.MANAGER) {
      throw new ForbiddenException('Only managers can view approval queue');
    }

    const replies = await this.prisma.reply.findMany({
      where: {
        status: ReplyStatus.SUBMITTED,
      },
      orderBy: { createdAt: 'asc' },
      include: {
        feedback: {
          include: {
            customer: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return replies;
  }

  async getReplyStats() {
    const [total, byStatus, recentCount] = await Promise.all([
      this.prisma.reply.count(),
      this.prisma.reply.groupBy({
        by: ['status'],
        _count: {
          status: true,
        },
      }),
      this.prisma.reply.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
          },
        },
      }),
    ]);

    const statusStats = byStatus.reduce((acc, item) => {
      acc[item.status] = item._count.status;
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      recentCount,
      byStatus: statusStats,
    };
  }
}
