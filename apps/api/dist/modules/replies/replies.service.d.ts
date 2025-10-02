import { PrismaService } from '@/infra/prisma/prisma.service';
import { CreateReplyDto, UpdateReplyDto, SubmitReplyDto, ApproveReplyDto, RejectReplyDto, ReplyQueryDto } from './dtos/reply.dto';
import { UserRole } from '@prisma/client';
export declare class RepliesService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createReplyDto: CreateReplyDto, userId: string): Promise<{
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
    update(id: string, updateReplyDto: UpdateReplyDto, userId: string, userRole: UserRole): Promise<{
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
    submit(id: string, submitReplyDto: SubmitReplyDto, userId: string): Promise<{
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
    approve(id: string, approveReplyDto: ApproveReplyDto, userId: string, userRole: UserRole): Promise<{
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
    reject(id: string, rejectReplyDto: RejectReplyDto, userId: string, userRole: UserRole): Promise<{
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
    getApprovalQueue(userRole: UserRole): Promise<({
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
    getReplyStats(): Promise<{
        total: number;
        recentCount: number;
        byStatus: Record<string, number>;
    }>;
}
