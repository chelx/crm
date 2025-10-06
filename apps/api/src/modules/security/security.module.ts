import { Module } from '@nestjs/common';
import { BruteForceDetectionService } from './brute-force-detection.service';
import { InfraModule } from '@/infra/infra.module';
import { AuditModule } from '@/modules/audit/audit.module';

@Module({
  imports: [InfraModule, AuditModule],
  providers: [BruteForceDetectionService],
  exports: [BruteForceDetectionService],
})
export class SecurityModule {}
