import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/core/guards/roles.guard';
import { Roles } from '@/shared/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Reports')
@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('feedback-volume')
  @Roles(UserRole.MANAGER)
  @ApiOperation({ summary: 'Feedback volume over time' })
  @ApiQuery({ name: 'from', required: false })
  @ApiQuery({ name: 'to', required: false })
  @ApiQuery({ name: 'groupBy', required: false, description: 'day|week|month' })
  @ApiQuery({ name: 'channel', required: false })
  @ApiResponse({ status: 200 })
  async feedbackVolume(
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('groupBy') groupBy?: 'day' | 'week' | 'month',
    @Query('channel') channel?: string,
  ) {
    return this.reportsService.getFeedbackVolume({ from, to, groupBy, channel });
  }

  @Get('replies-metrics')
  @Roles(UserRole.MANAGER)
  @ApiOperation({ summary: 'Average approval time, reply turnaround' })
  @ApiQuery({ name: 'from', required: false })
  @ApiQuery({ name: 'to', required: false })
  @ApiResponse({ status: 200 })
  async repliesMetrics(
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.reportsService.getRepliesMetrics({ from, to });
  }

  @Get('workload')
  @Roles(UserRole.MANAGER)
  @ApiOperation({ summary: 'CSO workload and SLA' })
  @ApiQuery({ name: 'from', required: false })
  @ApiQuery({ name: 'to', required: false })
  @ApiResponse({ status: 200 })
  async workload(
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.reportsService.getWorkload({ from, to });
  }
}


