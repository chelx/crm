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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const crypto_1 = require("crypto");
const util_1 = require("util");
const scryptAsync = (0, util_1.promisify)(crypto_1.scrypt);
const prisma_service_1 = require("../../infra/prisma/prisma.service");
const audit_service_1 = require("../audit/audit.service");
const brute_force_detection_service_1 = require("../security/brute-force-detection.service");
let AuthService = class AuthService {
    constructor(prisma, jwtService, configService, audit, bruteForceDetection) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.configService = configService;
        this.audit = audit;
        this.bruteForceDetection = bruteForceDetection;
    }
    async validateUser(email, password) {
        const user = await this.prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            return null;
        }
        const isPasswordValid = await this.verifyPassword(password, user.password);
        if (!isPasswordValid) {
            return null;
        }
        const { password: _, ...result } = user;
        return result;
    }
    async login(loginDto, clientIp) {
        const isBlocked = await this.bruteForceDetection.isBlocked(loginDto.email, clientIp || 'unknown');
        if (isBlocked) {
            throw new common_1.HttpException('Too many failed login attempts. Please try again later.', common_1.HttpStatus.TOO_MANY_REQUESTS);
        }
        const user = await this.validateUser(loginDto.email, loginDto.password);
        if (!user) {
            await this.bruteForceDetection.recordLoginAttempt(loginDto.email, clientIp || 'unknown', false);
            await this.audit.logAnonymous('auth.login.failed', 'auth', { email: loginDto.email, ip: clientIp });
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        await this.bruteForceDetection.recordLoginAttempt(loginDto.email, clientIp || 'unknown', true);
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
        };
        const accessToken = this.jwtService.sign(payload);
        const refreshToken = await this.generateRefreshToken(user.id);
        const response = {
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
            },
        };
        await this.audit.log({
            actorId: user.id,
            action: 'auth.login.success',
            resource: 'auth',
            metadata: { ip: clientIp },
        });
        return response;
    }
    async register(registerDto) {
        const existingUser = await this.prisma.user.findUnique({
            where: { email: registerDto.email },
        });
        if (existingUser) {
            throw new common_1.BadRequestException('User with this email already exists');
        }
        const hashedPassword = await this.hashPassword(registerDto.password);
        const user = await this.prisma.user.create({
            data: {
                email: registerDto.email,
                password: hashedPassword,
                role: 'CSO',
            },
        });
        const { password: _, ...result } = user;
        return result;
    }
    async refreshToken(refreshTokenDto) {
        const tokenHash = (0, crypto_1.createHash)('sha256')
            .update(refreshTokenDto.refreshToken)
            .digest('hex');
        const refreshTokenRecord = await this.prisma.refreshToken.findFirst({
            where: {
                tokenHash,
                expiresAt: {
                    gt: new Date(),
                },
            },
            include: {
                user: true,
            },
        });
        if (!refreshTokenRecord) {
            await this.audit.logAnonymous('auth.refresh.failed', 'auth');
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
        if (refreshTokenRecord.rotatedAt) {
            throw new common_1.UnauthorizedException('Refresh token has been rotated');
        }
        const payload = {
            sub: refreshTokenRecord.user.id,
            email: refreshTokenRecord.user.email,
            role: refreshTokenRecord.user.role,
        };
        const newAccessToken = this.jwtService.sign(payload);
        const newRefreshToken = await this.rotateRefreshToken(refreshTokenRecord.id, refreshTokenRecord.user.id);
        const response = {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
        };
        await this.audit.log({
            actorId: refreshTokenRecord.user.id,
            action: 'auth.refresh.success',
            resource: 'auth',
        });
        return response;
    }
    async logout(userId, refreshToken) {
        if (refreshToken) {
            const tokenHash = (0, crypto_1.createHash)('sha256')
                .update(refreshToken)
                .digest('hex');
            await this.prisma.refreshToken.deleteMany({
                where: {
                    userId,
                    tokenHash,
                },
            });
        }
        else {
            await this.prisma.refreshToken.deleteMany({
                where: { userId },
            });
        }
        await this.audit.log({
            actorId: userId,
            action: 'auth.logout',
            resource: 'auth',
        });
    }
    async generateRefreshToken(userId) {
        const refreshToken = (0, crypto_1.randomBytes)(32).toString('hex');
        const tokenHash = (0, crypto_1.createHash)('sha256').update(refreshToken).digest('hex');
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);
        await this.prisma.refreshToken.create({
            data: {
                userId,
                tokenHash,
                expiresAt,
            },
        });
        return refreshToken;
    }
    async rotateRefreshToken(tokenId, userId) {
        const newRefreshToken = (0, crypto_1.randomBytes)(32).toString('hex');
        const newTokenHash = (0, crypto_1.createHash)('sha256').update(newRefreshToken).digest('hex');
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);
        await this.prisma.$transaction([
            this.prisma.refreshToken.update({
                where: { id: tokenId },
                data: { rotatedAt: new Date() },
            }),
            this.prisma.refreshToken.create({
                data: {
                    userId,
                    tokenHash: newTokenHash,
                    expiresAt,
                },
            }),
        ]);
        return newRefreshToken;
    }
    async hashPassword(password) {
        const salt = (0, crypto_1.randomBytes)(16).toString('hex');
        const hashedPassword = (await scryptAsync(password, salt, 64));
        return salt + ':' + hashedPassword.toString('hex');
    }
    async verifyPassword(password, hashedPassword) {
        const [salt, hash] = hashedPassword.split(':');
        const hashedBuffer = (await scryptAsync(password, salt, 64));
        return hashedBuffer.toString('hex') === hash;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService,
        audit_service_1.AuditService,
        brute_force_detection_service_1.BruteForceDetectionService])
], AuthService);
//# sourceMappingURL=auth.service.js.map