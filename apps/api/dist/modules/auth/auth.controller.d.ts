import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, RefreshTokenDto } from './dtos/auth.dto';
import { LoginResponse, RefreshTokenResponse } from '@/shared/types/auth.types';
import { AuthenticatedUser } from '@/shared/types/auth.types';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(loginDto: LoginDto): Promise<LoginResponse>;
    register(registerDto: RegisterDto): Promise<{
        id: string;
        email: string;
        role: import(".prisma/client").$Enums.UserRole;
        createdAt: Date;
        updatedAt: Date;
    }>;
    refreshToken(refreshTokenDto: RefreshTokenDto): Promise<RefreshTokenResponse>;
    logout(user: AuthenticatedUser, body?: {
        refreshToken?: string;
    }): Promise<{
        message: string;
    }>;
}
