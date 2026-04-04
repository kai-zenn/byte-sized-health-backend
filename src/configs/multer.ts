import multer from 'multer';
import path from 'path';
import { HttpException } from '../utils/httpException.js';

const UPLOAD_DIR = 'uploads/articles';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

// Disk storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `article-${uniqueSuffix}${ext}`);
  }
});

// File filter
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new HttpException(400, `Invalid file type. Allowed: ${ALLOWED_MIME_TYPES.join(', ')}`));
  }
};

export const uploadConfig = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter,
});
