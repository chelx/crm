import { IsString, IsNotEmpty, IsOptional, MaxLength, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateFeedbackDto {
  @ApiProperty({ example: 'cus_123', description: 'Customer ID' })
  @IsString()
  @IsNotEmpty()
  customerId: string;

  @ApiProperty({ 
    example: 'I need help with my account settings. The interface is confusing.',
    description: 'Feedback message'
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  message: string;

  @ApiProperty({ 
    example: 'email',
    description: 'Channel where feedback was received',
    enum: ['email', 'phone', 'chat', 'social', 'other']
  })
  @IsString()
  @IsNotEmpty()
  @IsEnum(['email', 'phone', 'chat', 'social', 'other'])
  channel: string;
}

export class FeedbackQueryDto {
  @ApiPropertyOptional({ example: 'cus_123', description: 'Filter by customer ID' })
  @IsOptional()
  @IsString()
  customerId?: string;

  @ApiPropertyOptional({ 
    example: 'email',
    description: 'Filter by channel',
    enum: ['email', 'phone', 'chat', 'social', 'other']
  })
  @IsOptional()
  @IsString()
  @IsEnum(['email', 'phone', 'chat', 'social', 'other'])
  channel?: string;

  @ApiPropertyOptional({ example: 1, description: 'Page number' })
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ example: 20, description: 'Items per page' })
  @IsOptional()
  @Type(() => Number)
  limit?: number = 20;
}
