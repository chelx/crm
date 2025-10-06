import { Module } from '@nestjs/common';
import { RepliesController } from './replies.controller';
import { RepliesService } from './replies.service';
import { InfraModule } from '@/infra/infra.module';
import { AuditModule } from '@/modules/audit/audit.module';
import { NotificationModule } from '@/modules/notifications/notification.module';

@Module({
  imports: [InfraModule, AuditModule, NotificationModule],
  controllers: [RepliesController],
  providers: [RepliesService],
  exports: [RepliesService],
})
export class RepliesModule {}
