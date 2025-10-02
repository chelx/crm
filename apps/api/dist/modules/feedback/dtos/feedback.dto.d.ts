export declare class CreateFeedbackDto {
    customerId: string;
    message: string;
    channel: string;
}
export declare class FeedbackQueryDto {
    customerId?: string;
    channel?: string;
    page?: number;
    limit?: number;
}
