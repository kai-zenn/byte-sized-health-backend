import prisma from "../configs/prismaConf.js";
import type { Prisma } from "@prisma/client";

export default class RefreshTokenRepository {
  private readonly prisma = prisma;

  constructor() {
    this.prisma = prisma;
  }

  async create(data: Prisma.RefreshTokenCreateInput) {
    return await this.prisma.refreshToken.create({ data });
  }

  async findByToken(hashedToken: string) {
    return await this.prisma.refreshToken.findUnique({
      where: { hashedToken },
      include: { User: true }, // Include user data
    });
  }

  async findByUserId(userId: string) {
    return await this.prisma.refreshToken.findMany({
      where: { userId, revoked: false },
    });
  }

  async revoke(hashedToken: string) {
    return await this.prisma.refreshToken.update({
      where: { hashedToken },
      data: { revoked: true },
    });
  }

  async revokeAllByUserId(userId: string) {
    return await this.prisma.refreshToken.updateMany({
      where: { userId, revoked: false },
      data: { revoked: true },
    });
  }

  async deleteExpired() {
    return await this.prisma.refreshToken.deleteMany({
      where: {
        expireAt: {
          lt: new Date(),
        },
      },
    });
  }

  async delete(hashedToken: string) {
    return await this.prisma.refreshToken.delete({
      where: { hashedToken },
    });
  }
}
