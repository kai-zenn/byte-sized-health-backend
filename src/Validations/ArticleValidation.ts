import { z } from 'zod';
import { ArticleStatus } from '@prisma/client';

export const createArticleSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(200),
  description: z.string().min(20).max(500).optional(),
  content: z.string().min(50, 'Content must be at least 50 characters'),
  sources: z.array(z.object({
    title: z.string(),
    url: z.string().url()
  })).optional(),
  categoryIds: z.array(z.string().uuid()).optional(),
  status: z.nativeEnum(ArticleStatus).optional().default(ArticleStatus.DRAFT),
});

export const updateArticleSchema = createArticleSchema.partial();

export const publishArticleSchema = z.object({
  status: z.literal(ArticleStatus.PUBLISHED)
});

export type CreateArticleInput = z.infer<typeof createArticleSchema>;
export type UpdateArticleInput = z.infer<typeof updateArticleSchema>;
