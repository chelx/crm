import { PrismaService } from '@/infra/prisma/prisma.service';
import { CreateFeedbackDto, FeedbackQueryDto } from './dtos/feedback.dto';
export declare class FeedbackService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createFeedbackDto: CreateFeedbackDto, userId: string): Promise<{
        customer: {
            name: string;
            id: string;
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
                name: string;
                id: string;
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
            name: string;
            id: string;
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
