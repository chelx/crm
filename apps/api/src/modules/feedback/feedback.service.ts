import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/infra/prisma/prisma.service';
import { CreateFeedbackDto, FeedbackQueryDto } from './dtos/feedback.dto';

@Injectable()
export class FeedbackService {
  constructor(private prisma: PrismaService) {}

  async create(createFeedbackDto: CreateFeedbackDto, userId: string) {
    // Verify customer exists
    const customer = await this.prisma.customer.findFirst({
      where: {
        id: createFeedbackDto.customerId,
        deletedAt: null,
      },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    const feedback = await this.prisma.feedback.create({
      data: {
        customerId: createFeedbackDto.customerId,
        message: createFeedbackDto.message,
        channel: createFeedbackDto.channel,
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        replies: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    return feedback;
  }

  async findAll(queryDto: FeedbackQueryDto) {
    const { customerId, channel, page = 1, limit = 20 } = queryDto;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (customerId) {
      where.customerId = customerId;
    }

    if (channel) {
      where.channel = channel;
    }

    const [feedback, total] = await Promise.all([
      this.prisma.feedback.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          replies: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            select: {
              id: true,
              status: true,
              createdAt: true,
            },
          },
        },
      }),
      this.prisma.feedback.count({ where }),
    ]);

    return {
      data: feedback,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const feedback = await this.prisma.feedback.findUnique({
      where: { id },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        replies: {
          orderBy: { createdAt: 'desc' },
          include: {
            feedback: {
              select: {
                id: true,
                message: true,
              },
            },
          },
        },
      },
    });

    if (!feedback) {
      throw new NotFoundException('Feedback not found');
    }

    return feedback;
  }

  async getFeedbackStats() {
    const [total, byChannel, recentCount] = await Promise.all([
      this.prisma.feedback.count(),
      this.prisma.feedback.groupBy({
        by: ['channel'],
        _count: {
          channel: true,
        },
      }),
      this.prisma.feedback.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
          },
        },
      }),
    ]);

    const channelStats = byChannel.reduce((acc, item) => {
      acc[item.channel] = item._count.channel;
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      recentCount,
      byChannel: channelStats,
    };
  }
}
