"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReplyQueryDto = exports.RejectReplyDto = exports.ApproveReplyDto = exports.SubmitReplyDto = exports.UpdateReplyDto = exports.CreateReplyDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const client_1 = require("@prisma/client");
class CreateReplyDto {
    constructor() {
        this.status = client_1.ReplyStatus.DRAFT;
    }
}
exports.CreateReplyDto = CreateReplyDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'fb_123', description: 'Feedback ID' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateReplyDto.prototype, "feedbackId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Thank you for reaching out. I understand your concern about the interface. Let me help you navigate through the account settings.',
        description: 'Reply content'
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(2000),
    __metadata("design:type", String)
], CreateReplyDto.prototype, "content", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 'DRAFT',
        description: 'Reply status',
        enum: client_1.ReplyStatus,
        default: client_1.ReplyStatus.DRAFT
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.ReplyStatus),
    __metadata("design:type", String)
], CreateReplyDto.prototype, "status", void 0);
class UpdateReplyDto {
}
exports.UpdateReplyDto = UpdateReplyDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 'Updated reply content...',
        description: 'Reply content'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(2000),
    __metadata("design:type", String)
], UpdateReplyDto.prototype, "content", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 'SUBMITTED',
        description: 'Reply status',
        enum: client_1.ReplyStatus
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.ReplyStatus),
    __metadata("design:type", String)
], UpdateReplyDto.prototype, "status", void 0);
class SubmitReplyDto {
}
exports.SubmitReplyDto = SubmitReplyDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'SUBMITTED',
        description: 'Submit reply for approval',
        enum: ['SUBMITTED']
    }),
    (0, class_validator_1.IsEnum)(['SUBMITTED']),
    __metadata("design:type", String)
], SubmitReplyDto.prototype, "status", void 0);
class ApproveReplyDto {
}
exports.ApproveReplyDto = ApproveReplyDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 'Looks good. Approved.',
        description: 'Approval comment'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], ApproveReplyDto.prototype, "comment", void 0);
class RejectReplyDto {
}
exports.RejectReplyDto = RejectReplyDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Needs a more empathetic tone.',
        description: 'Rejection comment (required)'
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], RejectReplyDto.prototype, "comment", void 0);
class ReplyQueryDto {
    constructor() {
        this.page = 1;
        this.limit = 20;
    }
}
exports.ReplyQueryDto = ReplyQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'fb_123', description: 'Filter by feedback ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReplyQueryDto.prototype, "feedbackId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 'SUBMITTED',
        description: 'Filter by status',
        enum: client_1.ReplyStatus
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.ReplyStatus),
    __metadata("design:type", String)
], ReplyQueryDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 1, description: 'Page number' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], ReplyQueryDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 20, description: 'Items per page' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], ReplyQueryDto.prototype, "limit", void 0);
//# sourceMappingURL=reply.dto.js.map