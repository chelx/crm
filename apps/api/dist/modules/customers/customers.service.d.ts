import { PrismaService } from '@/infra/prisma/prisma.service';
import { CreateCustomerDto, UpdateCustomerDto, CustomerQueryDto } from './dtos/customer.dto';
import { UserRole } from '@prisma/client';
export declare class CustomersService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createCustomerDto: CreateCustomerDto, userId: string): Promise<{
        name: string;
        tags: string[];
        id: string;
        email: string;
        createdAt: Date;
        updatedAt: Date;
        phone: string | null;
        address: string | null;
        deletedAt: Date | null;
    }>;
    findAll(queryDto: CustomerQueryDto): Promise<{
        data: {
            name: string;
            tags: string[];
            id: string;
            email: string;
            createdAt: Date;
            updatedAt: Date;
            phone: string | null;
            address: string | null;
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
        name: string;
        tags: string[];
        id: string;
        email: string;
        createdAt: Date;
        updatedAt: Date;
        phone: string | null;
        address: string | null;
        deletedAt: Date | null;
    }>;
    update(id: string, updateCustomerDto: UpdateCustomerDto, userRole: UserRole): Promise<{
        name: string;
        tags: string[];
        id: string;
        email: string;
        createdAt: Date;
        updatedAt: Date;
        phone: string | null;
        address: string | null;
        deletedAt: Date | null;
    }>;
    remove(id: string, userRole: UserRole): Promise<{
        name: string;
        tags: string[];
        id: string;
        email: string;
        createdAt: Date;
        updatedAt: Date;
        phone: string | null;
        address: string | null;
        deletedAt: Date | null;
    }>;
    merge(sourceId: string, targetId: string, userRole: UserRole): Promise<{
        message: string;
        sourceCustomer: string;
        targetCustomer: string;
    }>;
}
