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
            actorId: string;
            action: string;
            resource: string;
            id: string;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            createdAt: Date;
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
        actorId: string;
        action: string;
        resource: string;
        id: string;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        createdAt: Date;
    }[]>;
    getResourceHistory(resource: string): Promise<({
        actor: {
            id: string;
            email: string;
            role: import(".prisma/client").$Enums.UserRole;
        };
    } & {
        actorId: string;
        action: string;
        resource: string;
        id: string;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        createdAt: Date;
    })[]>;
    findOne(id: string): Promise<{
        actor: {
            id: string;
            email: string;
            role: import(".prisma/client").$Enums.UserRole;
        };
    } & {
        actorId: string;
        action: string;
        resource: string;
        id: string;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        createdAt: Date;
    }>;
}
