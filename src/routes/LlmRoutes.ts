import { Router } from 'express';
import AIController from '../controllers/LlmController.js';
import Auth from '../middlewares/Auth.js';

const router = Router();
const aiController = new AIController();
const auth = new Auth();

// Public chat endpoint
/**
 * @swagger
 * /ai/chat:
 *   post:
 *     summary: Chat with AI assistant
 *     tags: [AI]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *                 example: "Apa itu burnout?"
 *     responses:
 *       200:
 *         description: AI response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                     response:
 *                       type: string
 */
router.post('/chat', aiController.chat.bind(aiController));


// Protected endpoints - require authentication, only for user already creating/login an account
/**
 * @swagger
 * /ai/analyze:
 *   post:
 *     summary: Analyze health data with AI
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sleep_hours
 *               - work_hours
 *               - stress_level
 *             properties:
 *               sleep_hours:
 *                 type: number
 *                 example: 6
 *               work_hours:
 *                 type: number
 *                 example: 10
 *               stress_level:
 *                 type: integer
 *                 example: 8
 *               activity_minutes:
 *                 type: integer
 *                 example: 30
 *     responses:
 *       200:
 *         description: AI analysis
 */
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

/**
 * @swagger
 * /ai/burnout-check:
 *   get:
 *     summary: Get burnout check from AI
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Burnout assessment
 */
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

/**
 * @swagger
 * /ai/recommendations:
 *   get:
 *     summary: Get AI recommendations
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Personalized recommendations
 */
router.get(
  '/recommendations',
  auth.verifyToken.bind(auth),
  aiController.getRecommendations.bind(aiController)
);

export { router as LlmRoutes };
