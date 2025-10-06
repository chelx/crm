import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto, FeedbackQueryDto } from './dtos/feedback.dto';
import { User } from '@prisma/client';
export declare class FeedbackController {
    private readonly feedbackService;
    constructor(feedbackService: FeedbackService);
    create(createFeedbackDto: CreateFeedbackDto, user: User): Promise<{
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
    getStats(): Promise<{
        total: number;
        recentCount: number;
        byChannel: Record<string, number>;
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
}
