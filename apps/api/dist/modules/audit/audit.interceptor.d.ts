import { AuditService, AuditLogData } from './audit.service';
export declare class AuditInterceptor {
    private auditService;
    constructor(auditService: AuditService);
    logAction(auditData: AuditLogData): Promise<void>;
}
