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
exports.AuditController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const audit_service_1 = require("./audit.service");
const audit_dto_1 = require("./dtos/audit.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../../core/guards/roles.guard");
const roles_decorator_1 = require("../../shared/decorators/roles.decorator");
const current_user_decorator_1 = require("../../shared/decorators/current-user.decorator");
const client_1 = require("@prisma/client");
let AuditController = class AuditController {
    constructor(auditService) {
        this.auditService = auditService;
    }
    async findAll(queryDto) {
        return this.auditService.findAll(queryDto);
    }
    async getStats() {
        return this.auditService.getAuditStats();
    }
    async getMyActivity(user, days) {
        return this.auditService.getUserActivity(user.id, days || 30);
    }
    async getResourceHistory(resource) {
        return this.auditService.getResourceHistory(resource);
    }
    async findOne(id) {
        return this.auditService.findOne(id);
    }
};
exports.AuditController = AuditController;
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(client_1.UserRole.MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Get audit logs with filters' }),
    (0, swagger_1.ApiQuery)({ name: 'actorId', required: false, description: 'Filter by actor ID' }),
    (0, swagger_1.ApiQuery)({ name: 'action', required: false, description: 'Filter by action' }),
    (0, swagger_1.ApiQuery)({ name: 'resource', required: false, description: 'Filter by resource' }),
    (0, swagger_1.ApiQuery)({ name: 'from', required: false, description: 'Start date (ISO string)' }),
    (0, swagger_1.ApiQuery)({ name: 'to', required: false, description: 'End date (ISO string)' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, description: 'Page number', type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, description: 'Items per page', type: Number }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Audit logs retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Only managers can view audit logs' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [audit_dto_1.AuditQueryDto]),
    __metadata("design:returntype", Promise)
], AuditController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Get audit statistics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Statistics retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Only managers can view audit statistics' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AuditController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)('my-activity'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.CSO, client_1.UserRole.MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Get current user activity' }),
    (0, swagger_1.ApiQuery)({ name: 'days', required: false, description: 'Number of days to look back', type: Number }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User activity retrieved successfully' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('days')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], AuditController.prototype, "getMyActivity", null);
__decorate([
    (0, common_1.Get)('resource/:resource'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Get resource history' }),
    (0, swagger_1.ApiParam)({ name: 'resource', description: 'Resource identifier (e.g., customer:cus_123)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Resource history retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Only managers can view resource history' }),
    __param(0, (0, common_1.Param)('resource')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuditController.prototype, "getResourceHistory", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Get audit log by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Audit log ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Audit log retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Audit log not found' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Only managers can view audit logs' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuditController.prototype, "findOne", null);
exports.AuditController = AuditController = __decorate([
    (0, swagger_1.ApiTags)('Audit'),
    (0, common_1.Controller)('audits'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [audit_service_1.AuditService])
], AuditController);
//# sourceMappingURL=audit.controller.js.map