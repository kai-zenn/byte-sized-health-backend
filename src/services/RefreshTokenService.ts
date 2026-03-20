import crypto from 'crypto';
import RefreshTokenRepository from '../repositories/RefreshTokenRepository.js';
import { HttpException } from '../utils/httpException.js';

const refreshTokenRepository = new RefreshTokenRepository();

export default class RefreshTokenService {
  private refreshTokenRepository: RefreshTokenRepository;

  constructor() {
    this.refreshTokenRepository = refreshTokenRepository;
  }

  /**
   * Hash refresh token untuk disimpan di database
   */
  hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  /**
   * Save refresh token ke database
   */
  async saveRefreshToken(userId: string, token: string, expiresInDays: number = 7) {
    const hashedToken = this.hashToken(token);
    const expireAt = new Date();
    expireAt.setDate(expireAt.getDate() + expiresInDays);

    return await this.refreshTokenRepository.create({
      hashedToken,
      User: { connect: { id: userId } },
      expireAt,
    });
  }

  /**
   * Find user by refresh token
   */
  async findUserByToken(token: string) {
    const hashedToken = this.hashToken(token);
    const tokenRecord = await this.refreshTokenRepository.findByToken(hashedToken);

    if (!tokenRecord) {
      throw new HttpException(403, 'Invalid refresh token');
    }

    if (tokenRecord.revoked) {
      throw new HttpException(403, 'Refresh token has been revoked');
    }

    if (new Date() > tokenRecord.expireAt) {
      // Token expired, delete it
      await this.refreshTokenRepository.delete(hashedToken);
      throw new HttpException(403, 'Refresh token expired');
    }

    return tokenRecord.User;
  }

  /**
   * Revoke refresh token (soft delete)
   */
  async revokeToken(token: string) {
    const hashedToken = this.hashToken(token);
    try {
      await this.refreshTokenRepository.revoke(hashedToken);
    } catch (error) {
      // Token not found is OK for logout
      return;
    }
  }

  /**
   * Revoke all user's refresh tokens (logout from all devices)
   */
  async revokeAllUserTokens(userId: string) {
    await this.refreshTokenRepository.revokeAllByUserId(userId);
  }

  /**
   * Clean up expired tokens (call this in a cron job)
   */
  async cleanupExpiredTokens() {
    await this.refreshTokenRepository.deleteExpired();
  }
}
