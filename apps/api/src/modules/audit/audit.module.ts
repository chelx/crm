import { Module } from '@nestjs/common';
import { AuditController } from './audit.controller';
import { AuditService } from './audit.service';
import { AuditInterceptor } from './audit.interceptor';
import { RetentionPolicyService } from './retention-policy.service';
import { InfraModule } from '@/infra/infra.module';

@Module({
  imports: [InfraModule],
  controllers: [AuditController],
  providers: [AuditService, AuditInterceptor, RetentionPolicyService],
  exports: [AuditService, AuditInterceptor],
})
export class AuditModule {}
