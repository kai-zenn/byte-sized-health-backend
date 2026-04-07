import { Request, Response, NextFunction } from 'express';
import ArticleService from '../services/ArticleService.js';
import { AuthRequest } from '../middlewares/Auth.js';
import { HttpException } from '../utils/httpException.js';
import { ArticleStatus } from '@prisma/client';

const articleService = new ArticleService();

export default class ArticleController {
  private articleService: ArticleService;

  constructor() {
    this.articleService = articleService;
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new HttpException(401, 'Unauthorized');
      }

      if (typeof req.body.sources === 'string') {
        try {
          req.body.sources = JSON.parse(req.body.sources);
        } catch (e) {
          req.body.sources = []; // akan handle error jika JSON gak valid
        }
      }

      const thumbnailFile = req.file;
      const article = await this.articleService.create(
        req.user.userId,
        req.body,
        thumbnailFile
      );

      res.status(201).json({
        success: true,
        data: article,
      });
    } catch (err) {
      next(err);
    }
  }

  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, categoryId, search } = req.query;

      const articles = await this.articleService.findAll({
        status: status as ArticleStatus,
        categoryId: categoryId as string,
        search: search as string,
      });

      res.json({
        success: true,
        data: articles,
      });
    } catch (err) {
      next(err);
    }
  }

  async findBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const { slug } = req.params;
      const article = await this.articleService.findBySlug(slug as string);

      res.json({
        success: true,
        data: article,
      });
    } catch (err) {
      next(err);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const article = await this.articleService.findById(id as string);

      res.json({
        success: true,
        data: article,
      });
    } catch (err) {
      next(err);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const thumbnailFile = req.file;

      const article = await this.articleService.update(id as string, req.body, thumbnailFile);

      res.json({
        success: true,
        data: article,
      });
    } catch (err) {
      next(err);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await this.articleService.delete(id as string);

      res.json({
        success: true,
        message: 'Article deleted successfully',
      });
    } catch (err) {
      next(err);
    }
  }

  async uploadImage(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        throw new HttpException(400, 'No file uploaded');
      }

      // For TinyMCE, we don't need articleId yet (article not created)
      // Just upload and return URL
      const imageService = new (await import('../services/ImageService.js')).default();
      const processedPath = await imageService.processContentImage(req.file.path);
      const publicUrl = imageService.getPublicUrl(processedPath);

      // TinyMCE expects this response format
      res.json({
        location: publicUrl,
      });
    } catch (err) {
      next(err);
    }
  }
}
