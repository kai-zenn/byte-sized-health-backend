import { Router } from 'express';
import ArticleController from '../controllers/ArticleController.js';
import Auth from '../middlewares/Auth.js';
import { Permission } from '../configs/permission.js';
import ValidateRequest from '../middlewares/ValidateRequest.js';
import { createArticleSchema, updateArticleSchema } from '../Validations/ArticleValidation.js';
import { uploadConfig } from '../configs/multer.js';

const router = Router();
const articleController = new ArticleController();
const auth = new Auth();

// Public routes
router.get('/', articleController.findAll.bind(articleController));
router.get('/slug/:slug', articleController.findBySlug.bind(articleController));
router.get('/:id', articleController.findById.bind(articleController));

// Protected routes - Admin only
router.post(
  '/',
  auth.verifyToken.bind(auth),
  auth.verifyPermission(Permission.CREATE_ARTICLE),
  uploadConfig.single('thumbnail'),
  ValidateRequest(createArticleSchema),
  articleController.create.bind(articleController)
);

router.put(
  '/:id',
  auth.verifyToken.bind(auth),
  auth.verifyPermission(Permission.UPDATE_ARTICLE),
  uploadConfig.single('thumbnail'),
  ValidateRequest(updateArticleSchema),
  articleController.update.bind(articleController)
);

router.delete(
  '/:id',
  auth.verifyToken.bind(auth),
  auth.verifyPermission(Permission.DELETE_ARTICLE),
  articleController.delete.bind(articleController)
);

// Image upload endpoint for TinyMCE
router.post(
  '/upload-image',
  auth.verifyToken.bind(auth),
  auth.verifyPermission(Permission.CREATE_ARTICLE),
  uploadConfig.single('file'),
  articleController.uploadImage.bind(articleController)
);

export { router as ArticleRoutes };
