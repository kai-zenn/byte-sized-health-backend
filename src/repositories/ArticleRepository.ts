import prisma from '../configs/prismaConf.js';
import type { Prisma, ArticleStatus } from '@prisma/client';

export default class ArticleRepository {
  async create(data: Prisma.ArticleCreateInput) {
    return await prisma.article.create({
      data,
      include: {
        author: {
          select: { id: true, name: true, email: true }
        },
        images: true,
        categories: {
          include: { category: true }
        }
      }
    });
  }

  async findAll(filters?: {
    status?: ArticleStatus;
    categoryId?: string;
    search?: string;
  }) {
    const where: Prisma.ArticleWhereInput = {};

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.categoryId) {
      where.categories = {
        some: { categoryId: filters.categoryId }
      };
    }

    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } }
      ];
    }

    return await prisma.article.findMany({
      where,
      include: {
        author: {
          select: { id: true, name: true, email: true }
        },
        categories: {
          include: { category: true }
        }
      },
      orderBy: { publishedAt: 'desc' }
    });
  }

  async findBySlug(slug: string) {
    return await prisma.article.findUnique({
      where: { slug },
      include: {
        author: {
          select: { id: true, name: true, email: true }
        },
        images: true,
        categories: {
          include: { category: true }
        }
      }
    });
  }

  async findById(id: string) {
    return await prisma.article.findUnique({
      where: { id },
      include: {
        author: {
          select: { id: true, name: true, email: true }
        },
        images: true,
        categories: {
          include: { category: true }
        }
      }
    });
  }

  async update(id: string, data: Prisma.ArticleUpdateInput) {
    return await prisma.article.update({
      where: { id },
      data,
      include: {
        author: {
          select: { id: true, name: true, email: true }
        },
        images: true,
        categories: {
          include: { category: true }
        }
      }
    });
  }

  async delete(id: string) {
    return await prisma.article.delete({ where: { id } });
  }

  async incrementViewCount(id: string) {
    return await prisma.article.update({
      where: { id },
      data: { viewCount: { increment: 1 } }
    });
  }

  async saveImage(data: {
    articleId: string;
    filename: string;
    path: string;
    size: number;
    mimeType: string;
  }) {
    return await prisma.articleImage.create({ data });
  }

  async deleteImage(id: string) {
    return await prisma.articleImage.delete({ where: { id } });
  }
}
