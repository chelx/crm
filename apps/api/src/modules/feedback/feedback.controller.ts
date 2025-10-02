import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto, FeedbackQueryDto } from './dtos/feedback.dto';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/core/guards/roles.guard';
import { Roles } from '@/shared/decorators/roles.decorator';
import { CurrentUser } from '@/shared/decorators/current-user.decorator';
import { UserRole, User } from '@prisma/client';

@ApiTags('Feedback')
@Controller('feedback')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post()
  @Roles(UserRole.CSO, UserRole.MANAGER)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new feedback' })
  @ApiResponse({ status: 201, description: 'Feedback created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  async create(
    @Body() createFeedbackDto: CreateFeedbackDto,
    @CurrentUser() user: User,
  ) {
    return this.feedbackService.create(createFeedbackDto, user.id);
  }

  @Get()
  @Roles(UserRole.CSO, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get all feedback with pagination and filters' })
  @ApiQuery({ name: 'customerId', required: false, description: 'Filter by customer ID' })
  @ApiQuery({ name: 'channel', required: false, description: 'Filter by channel' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', type: Number })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page', type: Number })
  @ApiResponse({ status: 200, description: 'Feedback retrieved successfully' })
  async findAll(@Query() queryDto: FeedbackQueryDto) {
    return this.feedbackService.findAll(queryDto);
  }

  @Get('stats')
  @Roles(UserRole.CSO, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get feedback statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getStats() {
    return this.feedbackService.getFeedbackStats();
  }

  @Get(':id')
  @Roles(UserRole.CSO, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get feedback by ID with replies' })
  @ApiParam({ name: 'id', description: 'Feedback ID' })
  @ApiResponse({ status: 200, description: 'Feedback retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Feedback not found' })
  async findOne(@Param('id') id: string) {
    return this.feedbackService.findOne(id);
  }
}
