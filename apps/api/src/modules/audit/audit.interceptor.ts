import { Injectable } from '@nestjs/common';
import { AuditService, AuditLogData } from './audit.service';

@Injectable()
export class AuditInterceptor {
  constructor(private auditService: AuditService) {}

  async logAction(auditData: AuditLogData) {
    await this.auditService.log(auditData);
  }
}
