import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { RepliesService } from './replies.service';
import { 
  CreateReplyDto, 
  UpdateReplyDto, 
  SubmitReplyDto, 
  ApproveReplyDto, 
  RejectReplyDto, 
  ReplyQueryDto 
} from './dtos/reply.dto';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/core/guards/roles.guard';
import { Roles } from '@/shared/decorators/roles.decorator';
import { CurrentUser } from '@/shared/decorators/current-user.decorator';
import { UserRole, User } from '@prisma/client';

@ApiTags('Replies')
@Controller('replies')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class RepliesController {
  constructor(private readonly repliesService: RepliesService) {}

  @Post()
  @Roles(UserRole.CSO, UserRole.MANAGER)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new reply' })
  @ApiResponse({ status: 201, description: 'Reply created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 404, description: 'Feedback not found' })
  async create(
    @Body() createReplyDto: CreateReplyDto,
    @CurrentUser() user: User,
  ) {
    return this.repliesService.create(createReplyDto, user.id);
  }

  @Get()
  @Roles(UserRole.CSO, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get all replies with pagination and filters' })
  @ApiQuery({ name: 'feedbackId', required: false, description: 'Filter by feedback ID' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by status' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', type: Number })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page', type: Number })
  @ApiResponse({ status: 200, description: 'Replies retrieved successfully' })
  async findAll(@Query() queryDto: ReplyQueryDto) {
    return this.repliesService.findAll(queryDto);
  }

  @Get('approval-queue')
  @Roles(UserRole.MANAGER)
  @ApiOperation({ summary: 'Get approval queue for managers' })
  @ApiResponse({ status: 200, description: 'Approval queue retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Only managers can view approval queue' })
  async getApprovalQueue(@CurrentUser() user: User) {
    return this.repliesService.getApprovalQueue(user.role);
  }

  @Get('stats')
  @Roles(UserRole.CSO, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get reply statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getStats() {
    return this.repliesService.getReplyStats();
  }

  @Get(':id')
  @Roles(UserRole.CSO, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get reply by ID' })
  @ApiParam({ name: 'id', description: 'Reply ID' })
  @ApiResponse({ status: 200, description: 'Reply retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Reply not found' })
  async findOne(@Param('id') id: string) {
    return this.repliesService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.CSO, UserRole.MANAGER)
  @ApiOperation({ summary: 'Update reply' })
  @ApiParam({ name: 'id', description: 'Reply ID' })
  @ApiResponse({ status: 200, description: 'Reply updated successfully' })
  @ApiResponse({ status: 403, description: 'Can only update draft replies or your own replies' })
  @ApiResponse({ status: 404, description: 'Reply not found' })
  async update(
    @Param('id') id: string,
    @Body() updateReplyDto: UpdateReplyDto,
    @CurrentUser() user: User,
  ) {
    return this.repliesService.update(id, updateReplyDto, user.id, user.role);
  }

  @Post(':id/submit')
  @Roles(UserRole.CSO, UserRole.MANAGER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Submit reply for approval' })
  @ApiParam({ name: 'id', description: 'Reply ID' })
  @ApiResponse({ status: 200, description: 'Reply submitted successfully' })
  @ApiResponse({ status: 400, description: 'Can only submit draft replies' })
  @ApiResponse({ status: 403, description: 'Can only submit your own replies' })
  @ApiResponse({ status: 404, description: 'Reply not found' })
  async submit(
    @Param('id') id: string,
    @Body() submitReplyDto: SubmitReplyDto,
    @CurrentUser() user: User,
  ) {
    return this.repliesService.submit(id, submitReplyDto, user.id);
  }

  @Post(':id/approve')
  @Roles(UserRole.MANAGER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Approve reply' })
  @ApiParam({ name: 'id', description: 'Reply ID' })
  @ApiResponse({ status: 200, description: 'Reply approved successfully' })
  @ApiResponse({ status: 400, description: 'Can only approve submitted replies' })
  @ApiResponse({ status: 403, description: 'Only managers can approve replies' })
  @ApiResponse({ status: 404, description: 'Reply not found' })
  async approve(
    @Param('id') id: string,
    @Body() approveReplyDto: ApproveReplyDto,
    @CurrentUser() user: User,
  ) {
    return this.repliesService.approve(id, approveReplyDto, user.id, user.role);
  }

  @Post(':id/reject')
  @Roles(UserRole.MANAGER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reject reply' })
  @ApiParam({ name: 'id', description: 'Reply ID' })
  @ApiResponse({ status: 200, description: 'Reply rejected successfully' })
  @ApiResponse({ status: 400, description: 'Can only reject submitted replies' })
  @ApiResponse({ status: 403, description: 'Only managers can reject replies' })
  @ApiResponse({ status: 404, description: 'Reply not found' })
  async reject(
    @Param('id') id: string,
    @Body() rejectReplyDto: RejectReplyDto,
    @CurrentUser() user: User,
  ) {
    return this.repliesService.reject(id, rejectReplyDto, user.id, user.role);
  }
}
