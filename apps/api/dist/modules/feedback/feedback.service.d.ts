import { PrismaService } from '@/infra/prisma/prisma.service';
import { CreateFeedbackDto, FeedbackQueryDto } from './dtos/feedback.dto';
import { AuditService } from '@/modules/audit/audit.service';
export declare class FeedbackService {
    private prisma;
    private audit;
    constructor(prisma: PrismaService, audit: AuditService);
    create(createFeedbackDto: CreateFeedbackDto, userId: string): Promise<{
        customer: {
            id: string;
            name: string;
            email: string;
        };
        replies: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            content: string;
            feedbackId: string;
            status: import(".prisma/client").$Enums.ReplyStatus;
            submittedBy: string;
            reviewedBy: string | null;
            reviewedAt: Date | null;
            comment: string | null;
        }[];
    } & {
        id: string;
        createdAt: Date;
        message: string;
        channel: string;
        customerId: string;
    }>;
    findAll(queryDto: FeedbackQueryDto): Promise<{
        data: ({
            customer: {
                id: string;
                name: string;
                email: string;
            };
            replies: {
                id: string;
                createdAt: Date;
                status: import(".prisma/client").$Enums.ReplyStatus;
            }[];
        } & {
            id: string;
            createdAt: Date;
            message: string;
            channel: string;
            customerId: string;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(id: string): Promise<{
        customer: {
            id: string;
            name: string;
            email: string;
            phone: string;
        };
        replies: ({
            feedback: {
                id: string;
                message: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            content: string;
            feedbackId: string;
            status: import(".prisma/client").$Enums.ReplyStatus;
            submittedBy: string;
            reviewedBy: string | null;
            reviewedAt: Date | null;
            comment: string | null;
        })[];
    } & {
        id: string;
        createdAt: Date;
        message: string;
        channel: string;
        customerId: string;
    }>;
    getFeedbackStats(): Promise<{
        total: number;
        recentCount: number;
        byChannel: Record<string, number>;
    }>;
}
