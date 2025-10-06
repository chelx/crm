import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, RefreshTokenDto } from './dtos/auth.dto';
import { LoginResponse, RefreshTokenResponse } from '@/shared/types/auth.types';
import { AuthenticatedUser } from '@/shared/types/auth.types';
import { Request } from 'express';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(loginDto: LoginDto, req: Request): Promise<LoginResponse>;
    register(registerDto: RegisterDto): Promise<{
        id: string;
        createdAt: Date;
        email: string;
        role: import(".prisma/client").$Enums.UserRole;
        updatedAt: Date;
    }>;
    refreshToken(refreshTokenDto: RefreshTokenDto): Promise<RefreshTokenResponse>;
    logout(user: AuthenticatedUser, body?: {
        refreshToken?: string;
    }): Promise<{
        message: string;
    }>;
}
