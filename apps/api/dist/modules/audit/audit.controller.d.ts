import { AuditService } from './audit.service';
import { AuditQueryDto } from './dtos/audit.dto';
import { User } from '@prisma/client';
export declare class AuditController {
    private readonly auditService;
    constructor(auditService: AuditService);
    findAll(queryDto: AuditQueryDto): Promise<{
        data: ({
            actor: {
                id: string;
                email: string;
                role: import(".prisma/client").$Enums.UserRole;
            };
        } & {
            id: string;
            action: string;
            resource: string;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            createdAt: Date;
            actorId: string;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getStats(): Promise<{
        total: number;
        recentCount: number;
        topActions: Record<string, number>;
    }>;
    getMyActivity(user: User, days?: number): Promise<{
        id: string;
        action: string;
        resource: string;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        createdAt: Date;
        actorId: string;
    }[]>;
    getResourceHistory(resource: string): Promise<({
        actor: {
            id: string;
            email: string;
            role: import(".prisma/client").$Enums.UserRole;
        };
    } & {
        id: string;
        action: string;
        resource: string;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        createdAt: Date;
        actorId: string;
    })[]>;
    findOne(id: string): Promise<{
        actor: {
            id: string;
            email: string;
            role: import(".prisma/client").$Enums.UserRole;
        };
    } & {
        id: string;
        action: string;
        resource: string;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        createdAt: Date;
        actorId: string;
    }>;
}
