import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { AuditQueryDto } from './dtos/audit.dto';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/core/guards/roles.guard';
import { Roles } from '@/shared/decorators/roles.decorator';
import { CurrentUser } from '@/shared/decorators/current-user.decorator';
import { UserRole, User } from '@prisma/client';

@ApiTags('Audit')
@Controller('audits')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @Roles(UserRole.MANAGER)
  @ApiOperation({ summary: 'Get audit logs with filters' })
  @ApiQuery({ name: 'actorId', required: false, description: 'Filter by actor ID' })
  @ApiQuery({ name: 'action', required: false, description: 'Filter by action' })
  @ApiQuery({ name: 'resource', required: false, description: 'Filter by resource' })
  @ApiQuery({ name: 'from', required: false, description: 'Start date (ISO string)' })
  @ApiQuery({ name: 'to', required: false, description: 'End date (ISO string)' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', type: Number })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page', type: Number })
  @ApiResponse({ status: 200, description: 'Audit logs retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Only managers can view audit logs' })
  async findAll(@Query() queryDto: AuditQueryDto) {
    return this.auditService.findAll(queryDto);
  }

  @Get('stats')
  @Roles(UserRole.MANAGER)
  @ApiOperation({ summary: 'Get audit statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Only managers can view audit statistics' })
  async getStats() {
    return this.auditService.getAuditStats();
  }

  @Get('my-activity')
  @Roles(UserRole.CSO, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get current user activity' })
  @ApiQuery({ name: 'days', required: false, description: 'Number of days to look back', type: Number })
  @ApiResponse({ status: 200, description: 'User activity retrieved successfully' })
  async getMyActivity(
    @CurrentUser() user: User,
    @Query('days') days?: number,
  ) {
    return this.auditService.getUserActivity(user.id, days || 30);
  }

  @Get('resource/:resource')
  @Roles(UserRole.MANAGER)
  @ApiOperation({ summary: 'Get resource history' })
  @ApiParam({ name: 'resource', description: 'Resource identifier (e.g., customer:cus_123)' })
  @ApiResponse({ status: 200, description: 'Resource history retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Only managers can view resource history' })
  async getResourceHistory(@Param('resource') resource: string) {
    return this.auditService.getResourceHistory(resource);
  }

  @Get(':id')
  @Roles(UserRole.MANAGER)
  @ApiOperation({ summary: 'Get audit log by ID' })
  @ApiParam({ name: 'id', description: 'Audit log ID' })
  @ApiResponse({ status: 200, description: 'Audit log retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Audit log not found' })
  @ApiResponse({ status: 403, description: 'Only managers can view audit logs' })
  async findOne(@Param('id') id: string) {
    return this.auditService.findOne(id);
  }
}
