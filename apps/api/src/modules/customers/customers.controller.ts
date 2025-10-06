import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { CustomersService } from './customers.service';
import { CreateCustomerDto, UpdateCustomerDto, CustomerQueryDto } from './dtos/customer.dto';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/core/guards/roles.guard';
import { Roles } from '@/shared/decorators/roles.decorator';
import { CurrentUser } from '@/shared/decorators/current-user.decorator';
import { UserRole, User } from '@prisma/client';

@ApiTags('Customers')
@Controller('customers')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  @Roles(UserRole.CSO, UserRole.MANAGER)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new customer' })
  @ApiResponse({ status: 201, description: 'Customer created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 409, description: 'Customer with email/phone already exists' })
  async create(
    @Body() createCustomerDto: CreateCustomerDto,
    @CurrentUser() user: User,
  ) {
    return this.customersService.create(createCustomerDto, user.id);
  }

  @Get()
  @Roles(UserRole.CSO, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get all customers with pagination and filters' })
  @ApiQuery({ name: 'search', required: false, description: 'Search by name or email' })
  @ApiQuery({ name: 'tag', required: false, description: 'Filter by tag' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', type: Number })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page', type: Number })
  @ApiResponse({ status: 200, description: 'Customers retrieved successfully' })
  async findAll(@Query() queryDto: CustomerQueryDto) {
    return this.customersService.findAll(queryDto);
  }

  @Get(':id')
  @Roles(UserRole.CSO, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get customer by ID' })
  @ApiParam({ name: 'id', description: 'Customer ID' })
  @ApiResponse({ status: 200, description: 'Customer retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  async findOne(@Param('id') id: string) {
    return this.customersService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.CSO, UserRole.MANAGER)
  @ApiOperation({ summary: 'Update customer' })
  @ApiParam({ name: 'id', description: 'Customer ID' })
  @ApiResponse({ status: 200, description: 'Customer updated successfully' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  @ApiResponse({ status: 409, description: 'Email/phone conflict' })
  async update(
    @Param('id') id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
    @CurrentUser() user: User,
  ) {
    return this.customersService.update(id, updateCustomerDto, user.role, user.id);
  }

  @Delete(':id')
  @Roles(UserRole.MANAGER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete customer (soft delete)' })
  @ApiParam({ name: 'id', description: 'Customer ID' })
  @ApiResponse({ status: 200, description: 'Customer deleted successfully' })
  @ApiResponse({ status: 403, description: 'Only managers can delete customers' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  async remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.customersService.remove(id, user.role, user.id);
  }

  @Post(':sourceId/merge/:targetId')
  @Roles(UserRole.MANAGER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Merge two customers' })
  @ApiParam({ name: 'sourceId', description: 'Source customer ID' })
  @ApiParam({ name: 'targetId', description: 'Target customer ID' })
  @ApiResponse({ status: 200, description: 'Customers merged successfully' })
  @ApiResponse({ status: 403, description: 'Only managers can merge customers' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  @ApiResponse({ status: 409, description: 'Cannot merge customer with itself' })
  async merge(
    @Param('sourceId') sourceId: string,
    @Param('targetId') targetId: string,
    @CurrentUser() user: User,
  ) {
    return this.customersService.merge(sourceId, targetId, user.role, user.id);
  }
}
