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
exports.CustomersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../infra/prisma/prisma.service");
const audit_service_1 = require("../audit/audit.service");
const notification_service_1 = require("../notifications/notification.service");
let CustomersService = class CustomersService {
    constructor(prisma, audit, notification) {
        this.prisma = prisma;
        this.audit = audit;
        this.notification = notification;
    }
    async create(createCustomerDto, userId) {
        const existingCustomer = await this.prisma.customer.findUnique({
            where: { email: createCustomerDto.email },
        });
        if (existingCustomer) {
            throw new common_1.ConflictException('Customer with this email already exists');
        }
        if (createCustomerDto.phone) {
            const existingPhone = await this.prisma.customer.findUnique({
                where: { phone: createCustomerDto.phone },
            });
            if (existingPhone) {
                throw new common_1.ConflictException('Customer with this phone number already exists');
            }
        }
        const customer = await this.prisma.customer.create({
            data: {
                ...createCustomerDto,
                tags: createCustomerDto.tags || [],
            },
        });
        await this.audit.log({
            actorId: userId,
            action: 'customer.created',
            resource: `customer:${customer.id}`,
            metadata: { email: customer.email, name: customer.name },
        });
        return customer;
    }
    async findAll(queryDto) {
        const { search, tag, page = 1, limit = 20 } = queryDto;
        const skip = (page - 1) * limit;
        const where = {
            deletedAt: null,
        };
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (tag) {
            where.tags = {
                has: tag,
            };
        }
        const [customers, total] = await Promise.all([
            this.prisma.customer.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.customer.count({ where }),
        ]);
        return {
            data: customers,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async findOne(id) {
        const customer = await this.prisma.customer.findFirst({
            where: {
                id,
                deletedAt: null,
            },
        });
        if (!customer) {
            throw new common_1.NotFoundException('Customer not found');
        }
        return customer;
    }
    async update(id, updateCustomerDto, userRole, userId) {
        const customer = await this.findOne(id);
        if (updateCustomerDto.email && updateCustomerDto.email !== customer.email) {
            const existingCustomer = await this.prisma.customer.findUnique({
                where: { email: updateCustomerDto.email },
            });
            if (existingCustomer) {
                throw new common_1.ConflictException('Customer with this email already exists');
            }
        }
        if (updateCustomerDto.phone && updateCustomerDto.phone !== customer.phone) {
            const existingPhone = await this.prisma.customer.findUnique({
                where: { phone: updateCustomerDto.phone },
            });
            if (existingPhone) {
                throw new common_1.ConflictException('Customer with this phone number already exists');
            }
        }
        const updatedCustomer = await this.prisma.customer.update({
            where: { id },
            data: updateCustomerDto,
        });
        await this.audit.log({
            actorId: userId,
            action: 'customer.updated',
            resource: `customer:${id}`,
            metadata: { changes: updateCustomerDto },
        });
        const managers = await this.prisma.user.findMany({ where: { role: 'MANAGER' } });
        await Promise.all(managers.map((m) => this.notification.notifyCustomerUpdated(m.id, id, updatedCustomer.name)));
        return updatedCustomer;
    }
    async remove(id, userRole, userId) {
        const customer = await this.findOne(id);
        if (userRole !== 'MANAGER') {
            throw new common_1.ForbiddenException('Only managers can delete customers');
        }
        const deletedCustomer = await this.prisma.customer.update({
            where: { id },
            data: {
                deletedAt: new Date(),
            },
        });
        await this.audit.log({
            actorId: userId,
            action: 'customer.deleted',
            resource: `customer:${id}`,
            metadata: { name: customer.name, email: customer.email },
        });
        return deletedCustomer;
    }
    async merge(sourceId, targetId, userRole, userId) {
        if (userRole !== 'MANAGER') {
            throw new common_1.ForbiddenException('Only managers can merge customers');
        }
        const sourceCustomer = await this.findOne(sourceId);
        const targetCustomer = await this.findOne(targetId);
        if (sourceId === targetId) {
            throw new common_1.ConflictException('Cannot merge customer with itself');
        }
        await this.prisma.feedback.updateMany({
            where: { customerId: sourceId },
            data: { customerId: targetId },
        });
        await this.prisma.customer.update({
            where: { id: sourceId },
            data: { deletedAt: new Date() },
        });
        await this.audit.log({
            actorId: userId,
            action: 'customer.merged',
            resource: `customer:${sourceId}`,
            metadata: {
                sourceCustomer: sourceCustomer.name,
                targetCustomer: targetCustomer.name,
                targetId: targetId
            },
        });
        return {
            message: 'Customers merged successfully',
            sourceCustomer: sourceCustomer.name,
            targetCustomer: targetCustomer.name,
        };
    }
};
exports.CustomersService = CustomersService;
exports.CustomersService = CustomersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, audit_service_1.AuditService, notification_service_1.NotificationService])
], CustomersService);
//# sourceMappingURL=customers.service.js.map