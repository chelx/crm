export declare class CreateCustomerDto {
    name: string;
    email: string;
    phone?: string;
    address?: string;
    tags?: string[];
}
export declare class UpdateCustomerDto {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
    tags?: string[];
}
export declare class CustomerQueryDto {
    search?: string;
    tag?: string;
    page?: number;
    limit?: number;
}
