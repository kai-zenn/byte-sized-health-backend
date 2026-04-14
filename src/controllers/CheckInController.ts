import { Request, Response, NextFunction } from 'express';
import CheckInService from '../services/CheckInService.js';
import { AuthRequest } from '../middlewares/Auth.js';
import { HttpException } from '../utils/httpException.js';

const checkInService = new CheckInService();

export default class CheckInController {
  private checkInService: CheckInService;

  constructor() {
    this.checkInService = checkInService;
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new HttpException(401, 'Unauthorized');
      }

      const checkIn = await this.checkInService.create(req.user.userId, req.body);

      res.status(201).json({
        success: true,
        message: 'Check-in created successfully',
        data: checkIn,
      });
    } catch (err) {
      next(err);
    }
  }

  async findAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new HttpException(401, 'Unauthorized');
      }

      const days = req.query.days ? parseInt(req.query.days as string) : undefined;
      const checkIns = await this.checkInService.findByUserId(req.user.userId, days);

      res.json({
        success: true,
        data: checkIns,
      });
    } catch (err) {
      next(err);
    }
  }

  async findById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new HttpException(401, 'Unauthorized');
      }

      const { id } = req.params;
      const checkIn = await this.checkInService.findById(id as string, req.user.userId);

      res.json({
        success: true,
        data: checkIn,
      });
    } catch (err) {
      next(err);
    }
  }

  async getLatest(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new HttpException(401, 'Unauthorized');
      }

      const checkIn = await this.checkInService.getLatest(req.user.userId);

      res.json({
        success: true,
        data: checkIn,
      });
    } catch (err) {
      next(err);
    }
  }

  async getStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new HttpException(401, 'Unauthorized');
      }

      const days = req.query.days ? parseInt(req.query.days as string) : 7;
      const stats = await this.checkInService.getStats(req.user.userId, days);

      res.json({
        success: true,
        data: stats,
      });
    } catch (err) {
      next(err);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new HttpException(401, 'Unauthorized');
      }

      const { id } = req.params;
      const checkIn = await this.checkInService.update(id as string, req.user.userId, req.body);

      res.json({
        success: true,
        message: 'Check-in updated successfully',
        data: checkIn,
      });
    } catch (err) {
      next(err);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new HttpException(401, 'Unauthorized');
      }

      const { id } = req.params;
      await this.checkInService.delete(id as string, req.user.userId);

      res.json({
        success: true,
        message: 'Check-in deleted successfully',
      });
    } catch (err) {
      next(err);
    }
  }
}
