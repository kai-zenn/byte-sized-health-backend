import { Request, Response, NextFunction } from 'express';
import LlmService from '../services/LlmService.js';
import { AuthRequest } from '../middlewares/Auth.js';
import { HttpException } from '../utils/httpException.js';

const llmService = new LlmService();

export default class LlmController {
  private llmService: LlmService;

  constructor() {
    this.llmService = llmService;
  }

  async chat(req: Request, res: Response, next: NextFunction) {
    try {
      const { message } = req.body;

      if (!message) {
        throw new HttpException(400, 'Message is required');
      }

      const response = await this.llmService.chat(message);

      res.json({
        success: true,
        data: {
          message,
          response,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  async analyze(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new HttpException(401, 'Unauthorized');
      }

      const { sleep_hours, mood_score, stress_level, activity_minutes } = req.body;

      const analysisData = {
        user_id: req.user.userId,
        sleep_hours,
        mood_score,
        stress_level,
        activity_minutes: activity_minutes || 0,
      };

      const analysis = await this.llmService.analyze(analysisData);

      res.json({
        success: true,
        data: {
          analysis,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (err) {
      next(err);
    }
  }

  async getHistory(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new HttpException(401, 'Unauthorized');
      }

      const days = parseInt(req.query.days as string) || 7;
      const history = await this.llmService.getHistory(req.user.userId, days);

      res.json({
        success: true,
        data: {
          history,
          days,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  async getPattern(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new HttpException(401, 'Unauthorized');
      }

      const pattern = await this.llmService.getPattern(req.user.userId);

      res.json({
        success: true,
        data: {
          pattern,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  async getWeeklyInsight(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new HttpException(401, 'Unauthorized');
      }

      const insight = await this.llmService.getWeeklyInsight(req.user.userId);

      res.json({
        success: true,
        data: {
          insight,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  async getBurnoutCheck(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new HttpException(401, 'Unauthorized');
      }
      
      const userId = req.params.userId;

      const burnoutCheck = await this.llmService.getBurnoutCheck(req.user.userId);

      res.json({
        success: true,
        data: {
          burnoutCheck,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  async getRiskAlert(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new HttpException(401, 'Unauthorized');
      }

      const riskAlert = await this.llmService.getRiskAlert(req.user.userId);

      res.json({
        success: true,
        data: {
          riskAlert,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  async getRecommendations(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new HttpException(401, 'Unauthorized');
      }

      const userId = req.params.userId;
      
      const recommendations = await this.llmService.getRecommendations(req.user.userId);

      res.json({
        success: true,
        data: {
          recommendations,
        },
      });
    } catch (err) {
      next(err);
    }
  }
}
