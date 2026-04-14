import CheckInRepository from '../repositories/CheckInRepository.js';
import LlmService from './LlmService.js';
import { HttpException } from '../utils/httpException.js';
import { calculateBurnoutScore } from '../utils/BurntOutUtils.js';
import type { CreateCheckInInput, UpdateCheckInInput } from '../Validations/CheckInValidation.js';

const checkInRepository = new CheckInRepository();
const llmService = new LlmService();

export default class CheckInService {
  private checkInRepository: CheckInRepository;
  private llmService: LlmService;

  constructor() {
    this.checkInRepository = checkInRepository;
    this.llmService = llmService;
  }

  async create(userId: string, data: CreateCheckInInput) {
    const checkInDate = data.date ? new Date(data.date) : new Date();
    checkInDate.setHours(0, 0, 0, 0);

    const existing = await this.checkInRepository.findByUserAndDate(userId, checkInDate);
    if (existing) {
      throw new HttpException(400, 'Check-in already exists for this date');
    }

    const { burnoutScore, riskLevel } = calculateBurnoutScore({
      sleepHours: data.sleepHours,
      workHours: data.workHours,
      stressLevel: data.stressLevel,
      activityMinutes: data.activityMinutes,
    });

    const checkIn = await this.checkInRepository.create({
      date: checkInDate,
      sleepHours: data.sleepHours,
      workHours: data.workHours,
      moodLevel: data.moodLevel,
      stressLevel: data.stressLevel,
      activityMinutes: data.activityMinutes,
      notes: data.notes,
      llmBurnoutScore: burnoutScore,
      llmRiskLevel: riskLevel,
      user: {
        connect: { id: userId },
      },
    });

    this.analyzeWithAI(checkIn).catch(err => {
      console.error('AI analysis failed:', err);
    });

    return checkIn;
  }

  private async processWithAI(checkIn: any) {
      try {
        // Step 1: Send data to LLM for analysis
        const analysisPromise = this.llmService.analyze({
          user_id: checkIn.userId,
          sleep_hours: checkIn.sleepHours,
          work_hours: checkIn.workHours,
          stress_level: checkIn.stressLevel,
          activity_minutes: checkIn.activityMinutes,
        });

        // Step 2: Get burnout check
        const burnoutCheckPromise = this.llmService.getBurnoutCheck(checkIn.userId);

        // Step 3: Get recommendations
        const recommendationsPromise = this.llmService.getRecommendations(checkIn.userId);

        // Wait for all LLM calls
        const [analysis, burnoutCheck, recommendations] = await Promise.all([
          analysisPromise,
          burnoutCheckPromise,
          recommendationsPromise,
        ]);

        // Update check-in with LLM results
        await this.checkInRepository.update(checkIn.id, {
          llmBurnoutScore: burnoutCheck.burnoutScore,
          llmAnalysis: analysis,
          llmRiskLevel: burnoutCheck.riskLevel,
          llmRecommendations: recommendations,
          llmProcessedAt: new Date(),
        });

        console.log(`AI processing completed for check-in ${checkIn.id}`);
      } catch (error) {
        console.error('AI processing error:', error);
      }
    }

  async findByUserId(userId: string, days?: number) {
    const options: any = {};

    if (days) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      startDate.setHours(0, 0, 0, 0);

      options.startDate = startDate;
    }

    return await this.checkInRepository.findByUserId(userId, options);
  }

  async findById(id: string, userId: string) {
    const checkIn = await this.checkInRepository.findById(id);

    if (!checkIn) {
      throw new HttpException(404, 'Check-in not found');
    }

    if (checkIn.userId !== userId) {
      throw new HttpException(403, 'Forbidden - Not your check-in');
    }

    return checkIn;
  }

  async getLatest(userId: string) {
    const checkIn = await this.checkInRepository.getLatestByUserId(userId);

    if (!checkIn) {
      throw new HttpException(404, 'No check-in found');
    }

    return checkIn;
  }

  async getStats(userId: string, days: number = 7) {
    const stats = await this.checkInRepository.getUserStats(userId, days);

    if (!stats) {
      throw new HttpException(404, 'No check-in data found');
    }

    return stats;
  }

  async update(id: string, userId: string, data: UpdateCheckInInput) {
    const checkIn = await this.findById(id, userId);

    let updateData: any = { ...data };

    if (
      data.sleepHours !== undefined ||
      data.workHours !== undefined ||
      data.stressLevel !== undefined ||
      data.activityMinutes !== undefined
    ) {
      const calculationData = {
        sleepHours: data.sleepHours ?? checkIn.sleepHours,
        workHours: data.workHours ?? checkIn.workHours,
        stressLevel: data.stressLevel ?? checkIn.stressLevel,
        activityMinutes: data.activityMinutes ?? checkIn.activityMinutes,
      };

      const { burnoutScore, riskLevel } = calculateBurnoutScore(calculationData);
      updateData.burnoutScore = burnoutScore;
      updateData.riskLevel = riskLevel;
    }

    const updated = await this.checkInRepository.update(id, updateData);

    if (Object.keys(data).some(key => ['sleepHours', 'workHours', 'stressLevel', 'activityMinutes'].includes(key))) {
      this.analyzeWithAI(updated).catch(err => {
        console.error('AI re-analysis failed:', err);
      });
    }

    return updated;
  }

  async delete(id: string, userId: string) {
    await this.findById(id, userId);
    await this.checkInRepository.delete(id);
  }

  private async analyzeWithAI(checkIn: any) {
    try {
      const analysis = await this.llmService.analyze({
        user_id: checkIn.userId,
        sleep_hours: checkIn.sleepHours,
        work_hours: checkIn.workHours,
        stress_level: checkIn.stressLevel,
        activity_minutes: checkIn.activityMinutes,
      });

      await this.checkInRepository.update(checkIn.id, {
        llmAnalysis: analysis,
      });

      console.log(`AI analysis completed for check-in ${checkIn.id}`);
    } catch (error) {
      console.error('Failed to analyze check-in with AI:', error);
    }
  }
}
