import { RepliesService } from './replies.service';
import { CreateReplyDto, UpdateReplyDto, SubmitReplyDto, ApproveReplyDto, RejectReplyDto, ReplyQueryDto } from './dtos/reply.dto';
import { User } from '@prisma/client';
export declare class RepliesController {
    private readonly repliesService;
    constructor(repliesService: RepliesService);
    create(createReplyDto: CreateReplyDto, user: User): Promise<{
        feedback: {
            customer: {
                id: string;
                email: string;
                name: string;
            };
        } & {
            id: string;
            createdAt: Date;
            customerId: string;
            message: string;
            channel: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        content: string;
        status: import(".prisma/client").$Enums.ReplyStatus;
        submittedBy: string;
        reviewedBy: string | null;
        reviewedAt: Date | null;
        comment: string | null;
        feedbackId: string;
    }>;
    findAll(queryDto: ReplyQueryDto): Promise<{
        data: ({
            feedback: {
                customer: {
                    id: string;
                    email: string;
                    name: string;
                };
            } & {
                id: string;
                createdAt: Date;
                customerId: string;
                message: string;
                channel: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            content: string;
            status: import(".prisma/client").$Enums.ReplyStatus;
            submittedBy: string;
            reviewedBy: string | null;
            reviewedAt: Date | null;
            comment: string | null;
            feedbackId: string;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getApprovalQueue(user: User): Promise<({
        feedback: {
            customer: {
                id: string;
                email: string;
                name: string;
            };
        } & {
            id: string;
            createdAt: Date;
            customerId: string;
            message: string;
            channel: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        content: string;
        status: import(".prisma/client").$Enums.ReplyStatus;
        submittedBy: string;
        reviewedBy: string | null;
        reviewedAt: Date | null;
        comment: string | null;
        feedbackId: string;
    })[]>;
    getStats(): Promise<{
        total: number;
        recentCount: number;
        byStatus: Record<string, number>;
    }>;
    findOne(id: string): Promise<{
        feedback: {
            customer: {
                id: string;
                email: string;
                name: string;
                phone: string;
            };
        } & {
            id: string;
            createdAt: Date;
            customerId: string;
            message: string;
            channel: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        content: string;
        status: import(".prisma/client").$Enums.ReplyStatus;
        submittedBy: string;
        reviewedBy: string | null;
        reviewedAt: Date | null;
        comment: string | null;
        feedbackId: string;
    }>;
    update(id: string, updateReplyDto: UpdateReplyDto, user: User): Promise<{
        feedback: {
            customer: {
                id: string;
                email: string;
                name: string;
            };
        } & {
            id: string;
            createdAt: Date;
            customerId: string;
            message: string;
            channel: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        content: string;
        status: import(".prisma/client").$Enums.ReplyStatus;
        submittedBy: string;
        reviewedBy: string | null;
        reviewedAt: Date | null;
        comment: string | null;
        feedbackId: string;
    }>;
    submit(id: string, submitReplyDto: SubmitReplyDto, user: User): Promise<{
        feedback: {
            customer: {
                id: string;
                email: string;
                name: string;
            };
        } & {
            id: string;
            createdAt: Date;
            customerId: string;
            message: string;
            channel: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        content: string;
        status: import(".prisma/client").$Enums.ReplyStatus;
        submittedBy: string;
        reviewedBy: string | null;
        reviewedAt: Date | null;
        comment: string | null;
        feedbackId: string;
    }>;
    approve(id: string, approveReplyDto: ApproveReplyDto, user: User): Promise<{
        feedback: {
            customer: {
                id: string;
                email: string;
                name: string;
            };
        } & {
            id: string;
            createdAt: Date;
            customerId: string;
            message: string;
            channel: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        content: string;
        status: import(".prisma/client").$Enums.ReplyStatus;
        submittedBy: string;
        reviewedBy: string | null;
        reviewedAt: Date | null;
        comment: string | null;
        feedbackId: string;
    }>;
    reject(id: string, rejectReplyDto: RejectReplyDto, user: User): Promise<{
        feedback: {
            customer: {
                id: string;
                email: string;
                name: string;
            };
        } & {
            id: string;
            createdAt: Date;
            customerId: string;
            message: string;
            channel: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        content: string;
        status: import(".prisma/client").$Enums.ReplyStatus;
        submittedBy: string;
        reviewedBy: string | null;
        reviewedAt: Date | null;
        comment: string | null;
        feedbackId: string;
    }>;
}
