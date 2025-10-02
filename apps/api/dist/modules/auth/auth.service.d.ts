import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/infra/prisma/prisma.service';
import { LoginDto, RegisterDto, RefreshTokenDto } from './dtos/auth.dto';
import { LoginResponse, RefreshTokenResponse } from '@/shared/types/auth.types';
export declare class AuthService {
    private prisma;
    private jwtService;
    private configService;
    constructor(prisma: PrismaService, jwtService: JwtService, configService: ConfigService);
    validateUser(email: string, password: string): Promise<{
        id: string;
        email: string;
        role: import(".prisma/client").$Enums.UserRole;
        createdAt: Date;
        updatedAt: Date;
    }>;
    login(loginDto: LoginDto): Promise<LoginResponse>;
    register(registerDto: RegisterDto): Promise<{
        id: string;
        email: string;
        role: import(".prisma/client").$Enums.UserRole;
        createdAt: Date;
        updatedAt: Date;
    }>;
    refreshToken(refreshTokenDto: RefreshTokenDto): Promise<RefreshTokenResponse>;
    logout(userId: string, refreshToken?: string): Promise<void>;
    private generateRefreshToken;
    private rotateRefreshToken;
    private hashPassword;
    private verifyPassword;
}
