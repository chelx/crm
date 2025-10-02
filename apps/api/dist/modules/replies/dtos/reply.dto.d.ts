import { ReplyStatus } from '@prisma/client';
export declare class CreateReplyDto {
    feedbackId: string;
    content: string;
    status?: ReplyStatus;
}
export declare class UpdateReplyDto {
    content?: string;
    status?: ReplyStatus;
}
export declare class SubmitReplyDto {
    status: 'SUBMITTED';
}
export declare class ApproveReplyDto {
    comment?: string;
}
export declare class RejectReplyDto {
    comment: string;
}
export declare class ReplyQueryDto {
    feedbackId?: string;
    status?: ReplyStatus;
    page?: number;
    limit?: number;
}
