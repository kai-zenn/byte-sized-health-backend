import { Router } from 'express';
import Auth from '../middlewares/Auth.js';
import LlmController from '../controllers/LlmController.js';

const router = Router();
const llmController = new LlmController();
const auth = new Auth();

// Public chat endpoint
/**
 * @swagger
 * /llm/chat:
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
router.post('/chat', llmController.chat.bind(llmController));


// Protected endpoints - require authentication, only for user already creating/login an account
/**
 * @swagger
 * /llm/analyze:
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
 *               - mood_score
 *               - stress_level
 *             properties:
 *               sleep_hours:
 *                 type: number
 *                 example: 6
 *               mood_score:
 *                 type: number
 *                 exampple: 8
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
  llmController.analyze.bind(llmController)
);


router.get(
  '/history',
  auth.verifyToken.bind(auth),
  llmController.getHistory.bind(llmController)
);

router.get(
  '/pattern',
  auth.verifyToken.bind(auth),
  llmController.getPattern.bind(llmController)
);

router.get(
  '/weekly-insight',
  auth.verifyToken.bind(auth),
  llmController.getWeeklyInsight.bind(llmController)
);

/**
 * @swagger
 * /llm/burnout-check:
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
  '/burnout-check/:userId',
  auth.verifyToken.bind(auth),
  llmController.getBurnoutCheck.bind(llmController)
);

router.get(
  '/risk-alert',
  auth.verifyToken.bind(auth),
  llmController.getRiskAlert.bind(llmController)
);

/**
 * @swagger
 * /llm/recommendations:
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
  '/recommendations:userId',
  auth.verifyToken.bind(auth),
  llmController.getRecommendations.bind(llmController)
);

export { router as LlmRoutes };
