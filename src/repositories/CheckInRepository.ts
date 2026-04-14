import prisma from '../configs/prismaConf.js';
import type { Prisma } from '@prisma/client';

export default class CheckInRepository {
  async create(data: Prisma.DailyCheckInCreateInput) {
    return await prisma.dailyCheckIn.create({
      data,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async findByUserAndDate(userId: string, date: Date) {
    return await prisma.dailyCheckIn.findUnique({
      where: {
        userId_date: {
          userId,
          date,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async findByUserId(userId: string, options?: {
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }) {
    const where: Prisma.DailyCheckInWhereInput = {
      userId,
    };

    if (options?.startDate || options?.endDate) {
      where.date = {};
      if (options.startDate) {
        where.date.gte = options.startDate;
      }
      if (options.endDate) {
        where.date.lte = options.endDate;
      }
    }

    return await prisma.dailyCheckIn.findMany({
      where,
      orderBy: {
        date: 'desc',
      },
      take: options?.limit,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async findById(id: string) {
    return await prisma.dailyCheckIn.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async update(id: string, data: Prisma.DailyCheckInUpdateInput) {
    return await prisma.dailyCheckIn.update({
      where: { id },
      data,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async delete(id: string) {
    return await prisma.dailyCheckIn.delete({
      where: { id },
    });
  }

  async getLatestByUserId(userId: string) {
    return await prisma.dailyCheckIn.findFirst({
      where: { userId },
      orderBy: { date: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async getUserStats(userId: string, days: number = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const checkIns = await prisma.dailyCheckIn.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
        },
      },
      orderBy: {
        date: 'desc',
      },
    });

    if (checkIns.length === 0) {
      return null;
    }

    const avgBurnoutScore = checkIns.reduce((sum, ci) => sum + ci.llmBurnoutScore, 0) / checkIns.length;
    const avgMoodLevel = checkIns.reduce((sum, ci) => sum + ci.moodLevel, 0) / checkIns.length;
    const avgStressLevel = checkIns.reduce((sum, ci) => sum + ci.stressLevel, 0) / checkIns.length;
    const avgSleepHours = checkIns.reduce((sum, ci) => sum + ci.sleepHours, 0) / checkIns.length;
    const avgWorkHours = checkIns.reduce((sum, ci) => sum + ci.workHours, 0) / checkIns.length;

    return {
      totalCheckIns: checkIns.length,
      avgBurnoutScore: Math.round(avgBurnoutScore * 10) / 10,
      avgMoodLevel: Math.round(avgMoodLevel * 10) / 10,
      avgStressLevel: Math.round(avgStressLevel * 10) / 10,
      avgSleepHours: Math.round(avgSleepHours * 10) / 10,
      avgWorkHours: Math.round(avgWorkHours * 10) / 10,
      checkIns,
    };
  }
}
