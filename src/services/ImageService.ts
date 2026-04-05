import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { HttpException } from '../utils/httpException.js';

export default class ImageService {
  private readonly THUMBNAIL_WIDTH = 800;
  private readonly THUMBNAIL_HEIGHT = 450;
  private readonly CONTENT_IMAGE_MAX_WIDTH = 1200;

  async processThumbnail(filePath: string): Promise<string> {
    const dir = path.dirname(filePath);
    const ext = path.extname(filePath);
    const basename = path.basename(filePath, ext);
    const outputPath = path.join(dir, `${basename}-thumb.jpg`);

    await sharp(filePath)
      .resize(this.THUMBNAIL_WIDTH, this.THUMBNAIL_HEIGHT, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 85 })
      .toFile(outputPath);

    await fs.unlink(filePath);

    return outputPath;
  }

  async processContentImage(filePath: string): Promise<string> {
    const dir = path.dirname(filePath);
    const ext = path.extname(filePath);
    const basename = path.basename(filePath, ext);
    const outputPath = path.join(dir, `${basename}-opt.jpg`);

    await sharp(filePath)
      .resize(this.CONTENT_IMAGE_MAX_WIDTH, null, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({ quality: 85 })
      .toFile(outputPath);

    await fs.unlink(filePath);

    return outputPath;
  }

  async deleteImage(filePath: string): Promise<void> {
    try {
      await fs.unlink(filePath);
    } catch (error) {
      console.error('Failed to delete image:', filePath);
    }
  }

  getPublicUrl(filePath: string): string {
    return `/${filePath.replace(/\\/g, '/')}`;
  }

  extractFirstImageFromHtml(html: string): string | null {
    const imgRegex = /<img[^>]+src="([^">]+)"/i;
    const match = html.match(imgRegex);
    return match ? match[1] : null;
  }
}
