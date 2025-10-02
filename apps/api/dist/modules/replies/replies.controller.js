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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RepliesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const replies_service_1 = require("./replies.service");
const reply_dto_1 = require("./dtos/reply.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../../core/guards/roles.guard");
const roles_decorator_1 = require("../../shared/decorators/roles.decorator");
const current_user_decorator_1 = require("../../shared/decorators/current-user.decorator");
const client_1 = require("@prisma/client");
let RepliesController = class RepliesController {
    constructor(repliesService) {
        this.repliesService = repliesService;
    }
    async create(createReplyDto, user) {
        return this.repliesService.create(createReplyDto, user.id);
    }
    async findAll(queryDto) {
        return this.repliesService.findAll(queryDto);
    }
    async getApprovalQueue(user) {
        return this.repliesService.getApprovalQueue(user.role);
    }
    async getStats() {
        return this.repliesService.getReplyStats();
    }
    async findOne(id) {
        return this.repliesService.findOne(id);
    }
    async update(id, updateReplyDto, user) {
        return this.repliesService.update(id, updateReplyDto, user.id, user.role);
    }
    async submit(id, submitReplyDto, user) {
        return this.repliesService.submit(id, submitReplyDto, user.id);
    }
    async approve(id, approveReplyDto, user) {
        return this.repliesService.approve(id, approveReplyDto, user.id, user.role);
    }
    async reject(id, rejectReplyDto, user) {
        return this.repliesService.reject(id, rejectReplyDto, user.id, user.role);
    }
};
exports.RepliesController = RepliesController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(client_1.UserRole.CSO, client_1.UserRole.MANAGER),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new reply' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Reply created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid input data' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Feedback not found' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [reply_dto_1.CreateReplyDto, Object]),
    __metadata("design:returntype", Promise)
], RepliesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(client_1.UserRole.CSO, client_1.UserRole.MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Get all replies with pagination and filters' }),
    (0, swagger_1.ApiQuery)({ name: 'feedbackId', required: false, description: 'Filter by feedback ID' }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, description: 'Filter by status' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, description: 'Page number', type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, description: 'Items per page', type: Number }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Replies retrieved successfully' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [reply_dto_1.ReplyQueryDto]),
    __metadata("design:returntype", Promise)
], RepliesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('approval-queue'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Get approval queue for managers' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Approval queue retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Only managers can view approval queue' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RepliesController.prototype, "getApprovalQueue", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.CSO, client_1.UserRole.MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Get reply statistics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Statistics retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RepliesController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.CSO, client_1.UserRole.MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Get reply by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Reply ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Reply retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Reply not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RepliesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.CSO, client_1.UserRole.MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Update reply' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Reply ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Reply updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Can only update draft replies or your own replies' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Reply not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, reply_dto_1.UpdateReplyDto, Object]),
    __metadata("design:returntype", Promise)
], RepliesController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/submit'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.CSO, client_1.UserRole.MANAGER),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Submit reply for approval' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Reply ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Reply submitted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Can only submit draft replies' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Can only submit your own replies' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Reply not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, reply_dto_1.SubmitReplyDto, Object]),
    __metadata("design:returntype", Promise)
], RepliesController.prototype, "submit", null);
__decorate([
    (0, common_1.Post)(':id/approve'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.MANAGER),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Approve reply' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Reply ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Reply approved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Can only approve submitted replies' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Only managers can approve replies' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Reply not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, reply_dto_1.ApproveReplyDto, Object]),
    __metadata("design:returntype", Promise)
], RepliesController.prototype, "approve", null);
__decorate([
    (0, common_1.Post)(':id/reject'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.MANAGER),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Reject reply' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Reply ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Reply rejected successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Can only reject submitted replies' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Only managers can reject replies' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Reply not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, reply_dto_1.RejectReplyDto, Object]),
    __metadata("design:returntype", Promise)
], RepliesController.prototype, "reject", null);
exports.RepliesController = RepliesController = __decorate([
    (0, swagger_1.ApiTags)('Replies'),
    (0, common_1.Controller)('replies'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [replies_service_1.RepliesService])
], RepliesController);
//# sourceMappingURL=replies.controller.js.map