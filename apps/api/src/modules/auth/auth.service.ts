import { Injectable, UnauthorizedException, BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { scrypt, randomBytes, createHash } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);
import { PrismaService } from '@/infra/prisma/prisma.service';
import { AuditService } from '@/modules/audit/audit.service';
import { BruteForceDetectionService } from '@/modules/security/brute-force-detection.service';
import { LoginDto, RegisterDto, RefreshTokenDto } from './dtos/auth.dto';
import { LoginResponse, RefreshTokenResponse, JwtPayload } from '@/shared/types/auth.types';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private audit: AuditService,
    private bruteForceDetection: BruteForceDetectionService,
  ) {}

  async validateUser(email: string, password: string) {
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

  async login(loginDto: LoginDto, clientIp?: string): Promise<LoginResponse> {
    // Check brute force protection
    const isBlocked = await this.bruteForceDetection.isBlocked(loginDto.email, clientIp || 'unknown');
    if (isBlocked) {
      throw new HttpException('Too many failed login attempts. Please try again later.', HttpStatus.TOO_MANY_REQUESTS);
    }

    const user = await this.validateUser(loginDto.email, loginDto.password);
    
    if (!user) {
      // Record failed attempt
      await this.bruteForceDetection.recordLoginAttempt(loginDto.email, clientIp || 'unknown', false);
      // audit login failed (unknown user)
      await this.audit.logAnonymous('auth.login.failed', 'auth', { email: loginDto.email, ip: clientIp });
      throw new UnauthorizedException('Invalid credentials');
    }

    // Record successful attempt
    await this.bruteForceDetection.recordLoginAttempt(loginDto.email, clientIp || 'unknown', true);

    const payload: JwtPayload = {
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

    // audit login success
    await this.audit.log({
      actorId: user.id,
      action: 'auth.login.success',
      resource: 'auth',
      metadata: { ip: clientIp },
    });

    return response;
  }

  async register(registerDto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    const hashedPassword = await this.hashPassword(registerDto.password);

    const user = await this.prisma.user.create({
      data: {
        email: registerDto.email,
        password: hashedPassword,
        role: 'CSO', // Default role
      },
    });

    const { password: _, ...result } = user;
    return result;
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto): Promise<RefreshTokenResponse> {
    const tokenHash = createHash('sha256')
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
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Check if token was rotated
    if (refreshTokenRecord.rotatedAt) {
      throw new UnauthorizedException('Refresh token has been rotated');
    }

    const payload: JwtPayload = {
      sub: refreshTokenRecord.user.id,
      email: refreshTokenRecord.user.email,
      role: refreshTokenRecord.user.role,
    };

    const newAccessToken = this.jwtService.sign(payload);

    // Rotate refresh token and get new refresh token
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

  async logout(userId: string, refreshToken?: string) {
    if (refreshToken) {
      const tokenHash = createHash('sha256')
        .update(refreshToken)
        .digest('hex');

      await this.prisma.refreshToken.deleteMany({
        where: {
          userId,
          tokenHash,
        },
      });
    } else {
      // Logout from all devices
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

  private async generateRefreshToken(userId: string): Promise<string> {
    const refreshToken = randomBytes(32).toString('hex');
    const tokenHash = createHash('sha256').update(refreshToken).digest('hex');
    
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash,
        expiresAt,
      },
    });

    return refreshToken;
  }

  private async rotateRefreshToken(tokenId: string, userId: string) {
    const newRefreshToken = randomBytes(32).toString('hex');
    const newTokenHash = createHash('sha256').update(newRefreshToken).digest('hex');
    
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await this.prisma.$transaction([
      // Mark old token as rotated
      this.prisma.refreshToken.update({
        where: { id: tokenId },
        data: { rotatedAt: new Date() },
      }),
      // Create new token
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

  private async hashPassword(password: string): Promise<string> {
    const salt = randomBytes(16).toString('hex');
    const hashedPassword = (await scryptAsync(password, salt, 64)) as Buffer;
    return salt + ':' + hashedPassword.toString('hex');
  }

  private async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    const [salt, hash] = hashedPassword.split(':');
    const hashedBuffer = (await scryptAsync(password, salt, 64)) as Buffer;
    return hashedBuffer.toString('hex') === hash;
  }
}
