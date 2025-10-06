import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/infra/prisma/prisma.service';
import { AuditService } from '@/modules/audit/audit.service';
import { BruteForceDetectionService } from '@/modules/security/brute-force-detection.service';
import { LoginDto, RegisterDto, RefreshTokenDto } from './dtos/auth.dto';
import { LoginResponse, RefreshTokenResponse } from '@/shared/types/auth.types';
export declare class AuthService {
    private prisma;
    private jwtService;
    private configService;
    private audit;
    private bruteForceDetection;
    constructor(prisma: PrismaService, jwtService: JwtService, configService: ConfigService, audit: AuditService, bruteForceDetection: BruteForceDetectionService);
    validateUser(email: string, password: string): Promise<{
        id: string;
        createdAt: Date;
        email: string;
        role: import(".prisma/client").$Enums.UserRole;
        updatedAt: Date;
    }>;
    login(loginDto: LoginDto, clientIp?: string): Promise<LoginResponse>;
    register(registerDto: RegisterDto): Promise<{
        id: string;
        createdAt: Date;
        email: string;
        role: import(".prisma/client").$Enums.UserRole;
        updatedAt: Date;
    }>;
    refreshToken(refreshTokenDto: RefreshTokenDto): Promise<RefreshTokenResponse>;
    logout(userId: string, refreshToken?: string): Promise<void>;
    private generateRefreshToken;
    private rotateRefreshToken;
    private hashPassword;
    private verifyPassword;
}
