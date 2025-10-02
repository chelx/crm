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
var AuditService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../infra/prisma/prisma.service");
let AuditService = AuditService_1 = class AuditService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(AuditService_1.name);
    }
    async log(auditData) {
        try {
            await this.prisma.auditLog.create({
                data: {
                    actorId: auditData.actorId,
                    action: auditData.action,
                    resource: auditData.resource,
                    metadata: auditData.metadata || {},
                },
            });
        }
        catch (error) {
            this.logger.error('Failed to create audit log', error);
        }
    }
    async findAll(queryDto) {
        const { actorId, action, resource, from, to, page = 1, limit = 20 } = queryDto;
        const skip = (page - 1) * limit;
        const where = {};
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
    async findOne(id) {
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
                        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                    },
                },
            }),
        ]);
        const actionStats = byAction.reduce((acc, item) => {
            acc[item.action] = item._count.action;
            return acc;
        }, {});
        return {
            total,
            recentCount,
            topActions: actionStats,
        };
    }
    async getUserActivity(userId, days = 30) {
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
    async getResourceHistory(resource) {
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
};
exports.AuditService = AuditService;
exports.AuditService = AuditService = AuditService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AuditService);
//# sourceMappingURL=audit.service.js.map