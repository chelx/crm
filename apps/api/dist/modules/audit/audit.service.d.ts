import { PrismaService } from '@/infra/prisma/prisma.service';
import { AuditQueryDto } from './dtos/audit.dto';
export interface AuditLogData {
    actorId: string;
    action: string;
    resource: string;
    metadata?: any;
}
export declare class AuditService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    log(auditData: AuditLogData): Promise<void>;
    findAll(queryDto: AuditQueryDto): Promise<{
        data: ({
            actor: {
                id: string;
                email: string;
                role: import(".prisma/client").$Enums.UserRole;
            };
        } & {
            id: string;
            createdAt: Date;
            action: string;
            resource: string;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            actorId: string;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(id: string): Promise<{
        actor: {
            id: string;
            email: string;
            role: import(".prisma/client").$Enums.UserRole;
        };
    } & {
        id: string;
        createdAt: Date;
        action: string;
        resource: string;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        actorId: string;
    }>;
    getAuditStats(): Promise<{
        total: number;
        recentCount: number;
        topActions: Record<string, number>;
    }>;
    getUserActivity(userId: string, days?: number): Promise<{
        id: string;
        createdAt: Date;
        action: string;
        resource: string;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
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
        createdAt: Date;
        action: string;
        resource: string;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        actorId: string;
    })[]>;
}
