import { CustomersService } from './customers.service';
import { CreateCustomerDto, UpdateCustomerDto, CustomerQueryDto } from './dtos/customer.dto';
import { User } from '@prisma/client';
export declare class CustomersController {
    private readonly customersService;
    constructor(customersService: CustomersService);
    create(createCustomerDto: CreateCustomerDto, user: User): Promise<{
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
    update(id: string, updateCustomerDto: UpdateCustomerDto, user: User): Promise<{
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
    remove(id: string, user: User): Promise<{
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
    merge(sourceId: string, targetId: string, user: User): Promise<{
        message: string;
        sourceCustomer: string;
        targetCustomer: string;
    }>;
}
