import { IsString, IsNotEmpty, IsOptional, MaxLength, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ReplyStatus } from '@prisma/client';

export class CreateReplyDto {
  @ApiProperty({ example: 'fb_123', description: 'Feedback ID' })
  @IsString()
  @IsNotEmpty()
  feedbackId: string;

  @ApiProperty({ 
    example: 'Thank you for reaching out. I understand your concern about the interface. Let me help you navigate through the account settings.',
    description: 'Reply content'
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  content: string;

  @ApiPropertyOptional({ 
    example: 'DRAFT',
    description: 'Reply status',
    enum: ReplyStatus,
    default: ReplyStatus.DRAFT
  })
  @IsOptional()
  @IsEnum(ReplyStatus)
  status?: ReplyStatus = ReplyStatus.DRAFT;
}

export class UpdateReplyDto {
  @ApiPropertyOptional({ 
    example: 'Updated reply content...',
    description: 'Reply content'
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  content?: string;

  @ApiPropertyOptional({ 
    example: 'SUBMITTED',
    description: 'Reply status',
    enum: ReplyStatus
  })
  @IsOptional()
  @IsEnum(ReplyStatus)
  status?: ReplyStatus;
}

export class SubmitReplyDto {
  @ApiProperty({ 
    example: 'SUBMITTED',
    description: 'Submit reply for approval',
    enum: ['SUBMITTED']
  })
  @IsEnum(['SUBMITTED'])
  status: 'SUBMITTED';
}

export class ApproveReplyDto {
  @ApiPropertyOptional({ 
    example: 'Looks good. Approved.',
    description: 'Approval comment'
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  comment?: string;
}

export class RejectReplyDto {
  @ApiProperty({ 
    example: 'Needs a more empathetic tone.',
    description: 'Rejection comment (required)'
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  comment: string;
}

export class ReplyQueryDto {
  @ApiPropertyOptional({ example: 'fb_123', description: 'Filter by feedback ID' })
  @IsOptional()
  @IsString()
  feedbackId?: string;

  @ApiPropertyOptional({ 
    example: 'SUBMITTED',
    description: 'Filter by status',
    enum: ReplyStatus
  })
  @IsOptional()
  @IsEnum(ReplyStatus)
  status?: ReplyStatus;

  @ApiPropertyOptional({ example: 1, description: 'Page number' })
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ example: 20, description: 'Items per page' })
  @IsOptional()
  @Type(() => Number)
  limit?: number = 20;
}
