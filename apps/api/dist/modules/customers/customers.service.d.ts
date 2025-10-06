import { PrismaService } from '@/infra/prisma/prisma.service';
import { CreateCustomerDto, UpdateCustomerDto, CustomerQueryDto } from './dtos/customer.dto';
import { UserRole } from '@prisma/client';
import { AuditService } from '@/modules/audit/audit.service';
import { NotificationService } from '@/modules/notifications/notification.service';
export declare class CustomersService {
    private prisma;
    private audit;
    private notification;
    constructor(prisma: PrismaService, audit: AuditService, notification: NotificationService);
    create(createCustomerDto: CreateCustomerDto, userId: string): Promise<{
        id: string;
        name: string;
        email: string;
        phone: string | null;
        address: string | null;
        tags: string[];
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }>;
    findAll(queryDto: CustomerQueryDto): Promise<{
        data: {
            id: string;
            name: string;
            email: string;
            phone: string | null;
            address: string | null;
            tags: string[];
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(id: string): Promise<{
        id: string;
        name: string;
        email: string;
        phone: string | null;
        address: string | null;
        tags: string[];
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }>;
    update(id: string, updateCustomerDto: UpdateCustomerDto, userRole: UserRole, userId: string): Promise<{
        id: string;
        name: string;
        email: string;
        phone: string | null;
        address: string | null;
        tags: string[];
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }>;
    remove(id: string, userRole: UserRole, userId: string): Promise<{
        id: string;
        name: string;
        email: string;
        phone: string | null;
        address: string | null;
        tags: string[];
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }>;
    merge(sourceId: string, targetId: string, userRole: UserRole, userId: string): Promise<{
        message: string;
        sourceCustomer: string;
        targetCustomer: string;
    }>;
}
