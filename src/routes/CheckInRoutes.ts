import { Router } from 'express';
import CheckInController from '../controllers/CheckInController.js';
import Auth from '../middlewares/Auth.js';
import ValidateRequest from '../middlewares/ValidateRequest.js';
import { createCheckInSchema, updateCheckInSchema } from '../Validations/CheckInValidation.js';

const router = Router();
const checkInController = new CheckInController();
const auth = new Auth();

// All routes require authentication
router.use(auth.verifyToken.bind(auth));


// Get user's check-ins (with optional days filter)
/**
 * @swagger
 * /check-ins:
 *   get:
 *     summary: Get user's check-ins
 *     tags: [Check-ins]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 7
 *         description: Number of days to retrieve (optional)
 *     responses:
 *       200:
 *         description: List of check-ins
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/DailyCheckIn'
 *       401:
 *         description: Unauthorized
 */
router.get('/', checkInController.findAll.bind(checkInController));

// Get latest check-in
/**
 * @swagger
 * /check-ins:
 *   get:
 *     summary: Get user's check-ins
 *     tags: [Check-ins]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 7
 *         description: Number of days to retrieve (optional)
 *     responses:
 *       200:
 *         description: List of check-ins
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/DailyCheckIn'
 *       401:
 *         description: Unauthorized
 */
router.get('/latest', checkInController.getLatest.bind(checkInController));

// Get user stats
/**
 * @swagger
 * /check-ins/stats:
 *   get:
 *     summary: Get user statistics
 *     tags: [Check-ins]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 7
 *         description: Number of days for statistics
 *     responses:
 *       200:
 *         description: User statistics
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
 *                     totalCheckIns:
 *                       type: integer
 *                     avgBurnoutScore:
 *                       type: number
 *                     avgMoodLevel:
 *                       type: number
 *                     avgStressLevel:
 *                       type: number
 *                     avgSleepHours:
 *                       type: number
 *                     avgWorkHours:
 *                       type: number
 */
router.get('/stats', checkInController.getStats.bind(checkInController));

// Get specific check-in
/**
 * @swagger
 * /check-ins/{id}:
 *   get:
 *     summary: Get check-in by ID
 *     tags: [Check-ins]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Check-in details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/DailyCheckIn'
 *       404:
 *         description: Check-in not found
 *       403:
 *         description: Forbidden - Not your check-in
 */
router.get('/:id', checkInController.findById.bind(checkInController));

// Create new check-in
router.post(
  '/',
  ValidateRequest(createCheckInSchema),
  checkInController.create.bind(checkInController)
);

// Update check-in
/**
 * @swagger
 * /check-ins:
 *   post:
 *     summary: Create daily check-in
 *     tags: [Check-ins]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sleepHours
 *               - workHours
 *               - moodLevel
 *               - stressLevel
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *                 example: "2025-01-15"
 *               sleepHours:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 24
 *                 example: 7
 *               workHours:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 24
 *                 example: 8
 *               moodLevel:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 10
 *                 example: 7
 *               stressLevel:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 10
 *                 example: 6
 *               activityMinutes:
 *                 type: integer
 *                 minimum: 0
 *                 example: 60
 *               notes:
 *                 type: string
 *                 example: "Felt good today"
 *     responses:
 *       201:
 *         description: Check-in created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/DailyCheckIn'
 *       400:
 *         description: Check-in already exists for this date
 */
router.put(
  '/:id',
  ValidateRequest(updateCheckInSchema),
  checkInController.update.bind(checkInController)
);

// Delete check-in
/**
 * @swagger
 * /check-ins/{id}:
 *   delete:
 *     summary: Delete check-in
 *     tags: [Check-ins]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Check-in deleted
 *       404:
 *         description: Check-in not found
 *       403:
 *         description: Forbidden
 */
router.delete('/:id', checkInController.delete.bind(checkInController));

export { router as CheckInRoutes };
