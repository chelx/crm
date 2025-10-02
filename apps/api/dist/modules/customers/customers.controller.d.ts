import { CustomersService } from './customers.service';
import { CreateCustomerDto, UpdateCustomerDto, CustomerQueryDto } from './dtos/customer.dto';
import { User } from '@prisma/client';
export declare class CustomersController {
    private readonly customersService;
    constructor(customersService: CustomersService);
    create(createCustomerDto: CreateCustomerDto, user: User): Promise<{
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
    update(id: string, updateCustomerDto: UpdateCustomerDto, user: User): Promise<{
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
    remove(id: string, user: User): Promise<{
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
    merge(sourceId: string, targetId: string, user: User): Promise<{
        message: string;
        sourceCustomer: string;
        targetCustomer: string;
    }>;
}
