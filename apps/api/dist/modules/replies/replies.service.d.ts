import { PrismaService } from '@/infra/prisma/prisma.service';
import { AuditService } from '@/modules/audit/audit.service';
import { NotificationService } from '@/modules/notifications/notification.service';
import { CreateReplyDto, UpdateReplyDto, SubmitReplyDto, ApproveReplyDto, RejectReplyDto, ReplyQueryDto } from './dtos/reply.dto';
import { UserRole } from '@prisma/client';
export declare class RepliesService {
    private prisma;
    private audit;
    private notification;
    constructor(prisma: PrismaService, audit: AuditService, notification: NotificationService);
    create(createReplyDto: CreateReplyDto, userId: string): Promise<{
        feedback: {
            customer: {
                id: string;
                name: string;
                email: string;
            };
        } & {
            id: string;
            createdAt: Date;
            message: string;
            channel: string;
            customerId: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.ReplyStatus;
        content: string;
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
                    name: string;
                    email: string;
                };
            } & {
                id: string;
                createdAt: Date;
                message: string;
                channel: string;
                customerId: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.ReplyStatus;
            content: string;
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
                name: string;
                email: string;
                phone: string;
            };
        } & {
            id: string;
            createdAt: Date;
            message: string;
            channel: string;
            customerId: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.ReplyStatus;
        content: string;
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
                name: string;
                email: string;
            };
        } & {
            id: string;
            createdAt: Date;
            message: string;
            channel: string;
            customerId: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.ReplyStatus;
        content: string;
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
                name: string;
                email: string;
            };
        } & {
            id: string;
            createdAt: Date;
            message: string;
            channel: string;
            customerId: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.ReplyStatus;
        content: string;
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
                name: string;
                email: string;
            };
        } & {
            id: string;
            createdAt: Date;
            message: string;
            channel: string;
            customerId: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.ReplyStatus;
        content: string;
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
                name: string;
                email: string;
            };
        } & {
            id: string;
            createdAt: Date;
            message: string;
            channel: string;
            customerId: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.ReplyStatus;
        content: string;
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
                name: string;
                email: string;
            };
        } & {
            id: string;
            createdAt: Date;
            message: string;
            channel: string;
            customerId: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.ReplyStatus;
        content: string;
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
