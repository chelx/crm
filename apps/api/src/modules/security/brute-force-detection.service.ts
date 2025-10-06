import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/infra/prisma/prisma.service';
import { AuditService } from '@/modules/audit/audit.service';

interface LoginAttempt {
  email: string;
  ip: string;
  timestamp: Date;
  success: boolean;
}

@Injectable()
export class BruteForceDetectionService {
  private readonly logger = new Logger(BruteForceDetectionService.name);
  private readonly loginAttempts = new Map<string, LoginAttempt[]>();
  private readonly maxAttempts: number;
  private readonly windowMs: number;
  private readonly lockoutMs: number;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
    private audit: AuditService,
  ) {
    this.maxAttempts = this.configService.get<number>('BRUTE_FORCE_MAX_ATTEMPTS', 5);
    this.windowMs = this.configService.get<number>('BRUTE_FORCE_WINDOW_MS', 15 * 60 * 1000); // 15 minutes
    this.lockoutMs = this.configService.get<number>('BRUTE_FORCE_LOCKOUT_MS', 30 * 60 * 1000); // 30 minutes
  }

  async recordLoginAttempt(email: string, ip: string, success: boolean): Promise<boolean> {
    const key = `${email}:${ip}`;
    const now = new Date();
    
    // Clean old attempts
    this.cleanOldAttempts(key, now);
    
    // Get current attempts
    const attempts = this.loginAttempts.get(key) || [];
    
    // Add new attempt
    attempts.push({
      email,
      ip,
      timestamp: now,
      success,
    });
    
    this.loginAttempts.set(key, attempts);
    
    // Check if should be blocked
    const recentFailedAttempts = attempts.filter(
      attempt => !attempt.success && 
      (now.getTime() - attempt.timestamp.getTime()) < this.windowMs
    );
    
    if (recentFailedAttempts.length >= this.maxAttempts) {
      await this.handleBruteForceDetected(email, ip, recentFailedAttempts.length);
      return false; // Block the request
    }
    
    return true; // Allow the request
  }

  private cleanOldAttempts(key: string, now: Date): void {
    const attempts = this.loginAttempts.get(key) || [];
    const cleaned = attempts.filter(
      attempt => (now.getTime() - attempt.timestamp.getTime()) < this.lockoutMs
    );
    
    if (cleaned.length === 0) {
      this.loginAttempts.delete(key);
    } else {
      this.loginAttempts.set(key, cleaned);
    }
  }

  private async handleBruteForceDetected(email: string, ip: string, attemptCount: number): Promise<void> {
    this.logger.warn(`Brute force attack detected for email: ${email}, IP: ${ip}, attempts: ${attemptCount}`);
    
    // Log to audit
    await this.audit.logAnonymous('security.brute_force_detected', 'security', {
      email,
      ip,
      attemptCount,
      timestamp: new Date().toISOString(),
    });
    
    // TODO: Send alert to administrators
    // await this.sendSecurityAlert(email, ip, attemptCount);
  }

  async isBlocked(email: string, ip: string): Promise<boolean> {
    const key = `${email}:${ip}`;
    const attempts = this.loginAttempts.get(key) || [];
    const now = new Date();
    
    const recentFailedAttempts = attempts.filter(
      attempt => !attempt.success && 
      (now.getTime() - attempt.timestamp.getTime()) < this.windowMs
    );
    
    return recentFailedAttempts.length >= this.maxAttempts;
  }

  async getAttemptCount(email: string, ip: string): Promise<number> {
    const key = `${email}:${ip}`;
    const attempts = this.loginAttempts.get(key) || [];
    const now = new Date();
    
    return attempts.filter(
      attempt => !attempt.success && 
      (now.getTime() - attempt.timestamp.getTime()) < this.windowMs
    ).length;
  }
}
