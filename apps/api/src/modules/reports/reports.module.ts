import { Module } from '@nestjs/common';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { InfraModule } from '@/infra/infra.module';

@Module({
  imports: [InfraModule],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}


