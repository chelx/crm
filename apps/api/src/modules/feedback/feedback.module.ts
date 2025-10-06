import { Module } from '@nestjs/common';
import { FeedbackController } from './feedback.controller';
import { FeedbackService } from './feedback.service';
import { InfraModule } from '@/infra/infra.module';
import { AuditModule } from '@/modules/audit/audit.module';

@Module({
  imports: [InfraModule, AuditModule],
  controllers: [FeedbackController],
  providers: [FeedbackService],
  exports: [FeedbackService],
})
export class FeedbackModule {}
