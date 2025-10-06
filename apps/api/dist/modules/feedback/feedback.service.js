"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeedbackService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../infra/prisma/prisma.service");
const audit_service_1 = require("../audit/audit.service");
let FeedbackService = class FeedbackService {
    constructor(prisma, audit) {
        this.prisma = prisma;
        this.audit = audit;
    }
    async create(createFeedbackDto, userId) {
        const customer = await this.prisma.customer.findFirst({
            where: {
                id: createFeedbackDto.customerId,
                deletedAt: null,
            },
        });
        if (!customer) {
            throw new common_1.NotFoundException('Customer not found');
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
        await this.audit.log({
            actorId: userId,
            action: 'feedback.created',
            resource: `feedback:${feedback.id}`,
            metadata: {
                customerId: createFeedbackDto.customerId,
                channel: createFeedbackDto.channel
            },
        });
        return feedback;
    }
    async findAll(queryDto) {
        const { customerId, channel, page = 1, limit = 20 } = queryDto;
        const skip = (page - 1) * limit;
        const where = {};
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
    async findOne(id) {
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
            throw new common_1.NotFoundException('Feedback not found');
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
                        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                    },
                },
            }),
        ]);
        const channelStats = byChannel.reduce((acc, item) => {
            acc[item.channel] = item._count.channel;
            return acc;
        }, {});
        return {
            total,
            recentCount,
            byChannel: channelStats,
        };
    }
};
exports.FeedbackService = FeedbackService;
exports.FeedbackService = FeedbackService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, audit_service_1.AuditService])
], FeedbackService);
//# sourceMappingURL=feedback.service.js.map