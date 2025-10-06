import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '@/infra/prisma/prisma.service';
import { CreateCustomerDto, UpdateCustomerDto, CustomerQueryDto } from './dtos/customer.dto';
import { UserRole } from '@prisma/client';
import { AuditService } from '@/modules/audit/audit.service';
import { NotificationService } from '@/modules/notifications/notification.service';

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService, private audit: AuditService, private notification: NotificationService) {}

  async create(createCustomerDto: CreateCustomerDto, userId: string) {
    // Check for existing email
    const existingCustomer = await this.prisma.customer.findUnique({
      where: { email: createCustomerDto.email },
    });

    if (existingCustomer) {
      throw new ConflictException('Customer with this email already exists');
    }

    // Check for existing phone if provided
    if (createCustomerDto.phone) {
      const existingPhone = await this.prisma.customer.findUnique({
        where: { phone: createCustomerDto.phone },
      });

      if (existingPhone) {
        throw new ConflictException('Customer with this phone number already exists');
      }
    }

    const customer = await this.prisma.customer.create({
      data: {
        ...createCustomerDto,
        tags: createCustomerDto.tags || [],
      },
    });

    // Audit: customer.created
    await this.audit.log({
      actorId: userId,
      action: 'customer.created',
      resource: `customer:${customer.id}`,
      metadata: { email: customer.email, name: customer.name },
    });

    return customer;
  }

  async findAll(queryDto: CustomerQueryDto) {
    const { search, tag, page = 1, limit = 20 } = queryDto;
    const skip = (page - 1) * limit;

    const where: any = {
      deletedAt: null, // Only show non-deleted customers
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

  async findOne(id: string) {
    const customer = await this.prisma.customer.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    return customer;
  }

  async update(id: string, updateCustomerDto: UpdateCustomerDto, userRole: UserRole, userId: string) {
    const customer = await this.findOne(id);

    // Check for email conflicts
    if (updateCustomerDto.email && updateCustomerDto.email !== customer.email) {
      const existingCustomer = await this.prisma.customer.findUnique({
        where: { email: updateCustomerDto.email },
      });

      if (existingCustomer) {
        throw new ConflictException('Customer with this email already exists');
      }
    }

    // Check for phone conflicts
    if (updateCustomerDto.phone && updateCustomerDto.phone !== customer.phone) {
      const existingPhone = await this.prisma.customer.findUnique({
        where: { phone: updateCustomerDto.phone },
      });

      if (existingPhone) {
        throw new ConflictException('Customer with this phone number already exists');
      }
    }

    const updatedCustomer = await this.prisma.customer.update({
      where: { id },
      data: updateCustomerDto,
    });

    // Audit: customer.updated
    await this.audit.log({
      actorId: userId,
      action: 'customer.updated',
      resource: `customer:${id}`,
      metadata: { changes: updateCustomerDto },
    });

    // Notify managers about customer update (simple broadcast to all managers)
    const managers = await this.prisma.user.findMany({ where: { role: 'MANAGER' } });
    await Promise.all(
      managers.map((m) =>
        this.notification.notifyCustomerUpdated(m.id, id, updatedCustomer.name),
      ),
    );

    return updatedCustomer;
  }

  async remove(id: string, userRole: UserRole, userId: string) {
    const customer = await this.findOne(id);

    // Only managers can delete customers
    if (userRole !== 'MANAGER') {
      throw new ForbiddenException('Only managers can delete customers');
    }

    // Soft delete
    const deletedCustomer = await this.prisma.customer.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });

    // Audit: customer.deleted
    await this.audit.log({
      actorId: userId,
      action: 'customer.deleted',
      resource: `customer:${id}`,
      metadata: { name: customer.name, email: customer.email },
    });

    return deletedCustomer;
  }

  async merge(sourceId: string, targetId: string, userRole: UserRole, userId: string) {
    // Only managers can merge customers
    if (userRole !== 'MANAGER') {
      throw new ForbiddenException('Only managers can merge customers');
    }

    const sourceCustomer = await this.findOne(sourceId);
    const targetCustomer = await this.findOne(targetId);

    if (sourceId === targetId) {
      throw new ConflictException('Cannot merge customer with itself');
    }

    // Move all feedback from source to target
    await this.prisma.feedback.updateMany({
      where: { customerId: sourceId },
      data: { customerId: targetId },
    });

    // Soft delete source customer
    await this.prisma.customer.update({
      where: { id: sourceId },
      data: { deletedAt: new Date() },
    });

    // Audit: customer.merged
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
}
