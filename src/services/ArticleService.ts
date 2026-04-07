import ArticleRepository from '../repositories/ArticleRepository.js';
import ImageService from './ImageService.js';
import { HttpException } from '../utils/httpException.js';
import { generateSlug, generateUniqueSlug } from '../utils/SlugifyUtil.js';
import { sanitizeHtml } from '../utils/SanitizeUtil.js';
import type { CreateArticleInput, UpdateArticleInput } from '../Validations/ArticleValidation.js';
import { ArticleStatus } from '@prisma/client';

const articleRepository = new ArticleRepository();
const imageService = new ImageService();

export default class ArticleService {
  private articleRepository: ArticleRepository;
  private imageService: ImageService;

  constructor() {
    this.articleRepository = articleRepository;
    this.imageService = imageService;
  }

  async create(authorId: string, data: CreateArticleInput, thumbnailFile?: Express.Multer.File) {
    // Generate slug from title
    const baseSlug = generateSlug(data.title);
    const existingArticles = await this.articleRepository.findAll({});
    const existingSlugs = existingArticles.map(a => a.slug);
    const slug = generateUniqueSlug(baseSlug, existingSlugs);

    // Sanitize HTML content
    const sanitizedContent = sanitizeHtml(data.content);

    // Determine thumbnail
    let thumbnailPath: string | null = null;

    if (thumbnailFile) {
      // Use uploaded thumbnail
      const processedPath = await this.imageService.processThumbnail(thumbnailFile.path);
      thumbnailPath = this.imageService.getPublicUrl(processedPath);
    } else {
      // Extract first image from content
      const firstImageUrl = this.imageService.extractFirstImageFromHtml(sanitizedContent);
      if (firstImageUrl) {
        thumbnailPath = firstImageUrl;
      }
    }

    // Set publishedAt if status is PUBLISHED
    const publishedAt = data.status === ArticleStatus.PUBLISHED ? new Date() : null;

    const article = await this.articleRepository.create({
      title: data.title,
      slug,
      description: data.description,
      content: sanitizedContent,
      thumbnail: thumbnailPath,
      sources: data.sources || [],
      status: data.status || ArticleStatus.DRAFT,
      publishedAt,
      author: {
        connect: { id: authorId }
      },
      ...(data.categoryIds && {
        categories: {
          create: data.categoryIds.map(categoryId => ({
            category: { connect: { id: categoryId } }
          }))
        }
      })
    });

    return article;
  }

  async findAll(filters?: {
    status?: ArticleStatus;
    categoryId?: string;
    search?: string;
  }) {
    return await this.articleRepository.findAll(filters);
  }

  async findBySlug(slug: string) {
    const article = await this.articleRepository.findBySlug(slug);

    if (!article) {
      throw new HttpException(404, 'Article not found');
    }

    this.articleRepository.incrementViewCount(article.id).catch(console.error);

    return article;
  }

  async findById(id: string) {
    const article = await this.articleRepository.findById(id);

    if (!article) {
      throw new HttpException(404, 'Article not found');
    }

    return article;
  }

  async update(id: string, data: UpdateArticleInput, thumbnailFile?: Express.Multer.File) {
    const existingArticle = await this.findById(id);

    let updateData: any = {};

    if (data.title) {
      const baseSlug = generateSlug(data.title);
      const existingArticles = await this.articleRepository.findAll({});
      const existingSlugs = existingArticles
        .filter(a => a.id !== id)
        .map(a => a.slug);
      updateData.slug = generateUniqueSlug(baseSlug, existingSlugs);
      updateData.title = data.title;
    }

    if (data.description !== undefined) {
      updateData.description = data.description;
    }

    if (data.content) {
      updateData.content = sanitizeHtml(data.content);
    }

    if (data.sources !== undefined) {
      updateData.sources = data.sources;
    }

    if (thumbnailFile) {
      if (existingArticle.thumbnail) {
        const oldPath = existingArticle.thumbnail.replace(/^\//, '');
        await this.imageService.deleteImage(oldPath);
      }

      const processedPath = await this.imageService.processThumbnail(thumbnailFile.path);
      updateData.thumbnail = this.imageService.getPublicUrl(processedPath);
    }

    if (data.status === ArticleStatus.PUBLISHED && existingArticle.status !== ArticleStatus.PUBLISHED) {
      updateData.publishedAt = new Date();
    }

    if (data.status) {
      updateData.status = data.status;
    }

    // Handle category updates
    if (data.categoryIds) {
      updateData.categories = {
        deleteMany: {},
        create: data.categoryIds.map(categoryId => ({
          category: { connect: { id: categoryId } }
        }))
      };
    }

    return await this.articleRepository.update(id, updateData);
  }

  async delete(id: string) {
    const article = await this.findById(id);

    if (article.thumbnail) {
      const thumbnailPath = article.thumbnail.replace(/^\//, '');
      await this.imageService.deleteImage(thumbnailPath);
    }

    // Delete all associated images
    for (const image of article.images) {
      await this.imageService.deleteImage(image.path);
    }

    await this.articleRepository.delete(id);
  }

  async uploadContentImage(articleId: string, file: Express.Multer.File) {
    // Process image
    const processedPath = await this.imageService.processContentImage(file.path);
    const publicUrl = this.imageService.getPublicUrl(processedPath);

    // Save to database
    await this.articleRepository.saveImage({
      articleId,
      filename: file.originalname,
      path: processedPath,
      size: file.size,
      mimeType: file.mimetype,
    });

    return { url: publicUrl };
  }
}
