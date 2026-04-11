import { Router } from 'express';
import AIController from '../controllers/LlmController.js';
import Auth from '../middlewares/Auth.js';

const router = Router();
const aiController = new AIController();
const auth = new Auth();

// Public chat endpoint
router.post('/chat', aiController.chat.bind(aiController));


// Protected endpoints - require authentication, only for user already creating/login an account
router.post(
  '/analyze',
  auth.verifyToken.bind(auth),
  aiController.analyze.bind(aiController)
);

router.get(
  '/history',
  auth.verifyToken.bind(auth),
  aiController.getHistory.bind(aiController)
);

router.get(
  '/pattern',
  auth.verifyToken.bind(auth),
  aiController.getPattern.bind(aiController)
);

router.get(
  '/weekly-insight',
  auth.verifyToken.bind(auth),
  aiController.getWeeklyInsight.bind(aiController)
);

router.get(
  '/burnout-check',
  auth.verifyToken.bind(auth),
  aiController.getBurnoutCheck.bind(aiController)
);

router.get(
  '/risk-alert',
  auth.verifyToken.bind(auth),
  aiController.getRiskAlert.bind(aiController)
);

router.get(
  '/recommendations',
  auth.verifyToken.bind(auth),
  aiController.getRecommendations.bind(aiController)
);

export { router as LlmRoutes };
