import { Module } from '@nestjs/common';
import { CustomersController } from './customers.controller';
import { CustomersService } from './customers.service';
import { InfraModule } from '@/infra/infra.module';
import { AuditModule } from '@/modules/audit/audit.module';
import { NotificationModule } from '@/modules/notifications/notification.module';

@Module({
  imports: [InfraModule, AuditModule, NotificationModule],
  controllers: [CustomersController],
  providers: [CustomersService],
  exports: [CustomersService],
})
export class CustomersModule {}
