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
exports.RepliesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../infra/prisma/prisma.service");
const client_1 = require("@prisma/client");
let RepliesService = class RepliesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createReplyDto, userId) {
        const feedback = await this.prisma.feedback.findUnique({
            where: { id: createReplyDto.feedbackId },
        });
        if (!feedback) {
            throw new common_1.NotFoundException('Feedback not found');
        }
        const reply = await this.prisma.reply.create({
            data: {
                feedbackId: createReplyDto.feedbackId,
                content: createReplyDto.content,
                status: createReplyDto.status || client_1.ReplyStatus.DRAFT,
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
        return reply;
    }
    async findAll(queryDto) {
        const { feedbackId, status, page = 1, limit = 20 } = queryDto;
        const skip = (page - 1) * limit;
        const where = {};
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
    async findOne(id) {
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
            throw new common_1.NotFoundException('Reply not found');
        }
        return reply;
    }
    async update(id, updateReplyDto, userId, userRole) {
        const reply = await this.findOne(id);
        if (reply.status !== client_1.ReplyStatus.DRAFT && reply.submittedBy !== userId) {
            throw new common_1.ForbiddenException('Can only update draft replies or your own replies');
        }
        if (updateReplyDto.status === client_1.ReplyStatus.SUBMITTED && reply.status !== client_1.ReplyStatus.DRAFT) {
            throw new common_1.BadRequestException('Can only submit draft replies');
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
        return updatedReply;
    }
    async submit(id, submitReplyDto, userId) {
        const reply = await this.findOne(id);
        if (reply.status !== client_1.ReplyStatus.DRAFT) {
            throw new common_1.BadRequestException('Can only submit draft replies');
        }
        if (reply.submittedBy !== userId) {
            throw new common_1.ForbiddenException('Can only submit your own replies');
        }
        const updatedReply = await this.prisma.reply.update({
            where: { id },
            data: {
                status: client_1.ReplyStatus.SUBMITTED,
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
        return updatedReply;
    }
    async approve(id, approveReplyDto, userId, userRole) {
        if (userRole !== client_1.UserRole.MANAGER) {
            throw new common_1.ForbiddenException('Only managers can approve replies');
        }
        const reply = await this.findOne(id);
        if (reply.status !== client_1.ReplyStatus.SUBMITTED) {
            throw new common_1.BadRequestException('Can only approve submitted replies');
        }
        const updatedReply = await this.prisma.reply.update({
            where: { id },
            data: {
                status: client_1.ReplyStatus.APPROVED,
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
        return updatedReply;
    }
    async reject(id, rejectReplyDto, userId, userRole) {
        if (userRole !== client_1.UserRole.MANAGER) {
            throw new common_1.ForbiddenException('Only managers can reject replies');
        }
        const reply = await this.findOne(id);
        if (reply.status !== client_1.ReplyStatus.SUBMITTED) {
            throw new common_1.BadRequestException('Can only reject submitted replies');
        }
        const updatedReply = await this.prisma.reply.update({
            where: { id },
            data: {
                status: client_1.ReplyStatus.REJECTED,
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
        return updatedReply;
    }
    async getApprovalQueue(userRole) {
        if (userRole !== client_1.UserRole.MANAGER) {
            throw new common_1.ForbiddenException('Only managers can view approval queue');
        }
        const replies = await this.prisma.reply.findMany({
            where: {
                status: client_1.ReplyStatus.SUBMITTED,
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
                        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                    },
                },
            }),
        ]);
        const statusStats = byStatus.reduce((acc, item) => {
            acc[item.status] = item._count.status;
            return acc;
        }, {});
        return {
            total,
            recentCount,
            byStatus: statusStats,
        };
    }
};
exports.RepliesService = RepliesService;
exports.RepliesService = RepliesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RepliesService);
//# sourceMappingURL=replies.service.js.map