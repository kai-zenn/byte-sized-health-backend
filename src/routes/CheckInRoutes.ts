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
router.get('/', checkInController.findAll.bind(checkInController));

// Get latest check-in
router.get('/latest', checkInController.getLatest.bind(checkInController));

// Get user stats
router.get('/stats', checkInController.getStats.bind(checkInController));

// Get specific check-in
router.get('/:id', checkInController.findById.bind(checkInController));

// Create new check-in
router.post(
  '/',
  ValidateRequest(createCheckInSchema),
  checkInController.create.bind(checkInController)
);

// Update check-in
router.put(
  '/:id',
  ValidateRequest(updateCheckInSchema),
  checkInController.update.bind(checkInController)
);

// Delete check-in
router.delete('/:id', checkInController.delete.bind(checkInController));

export { router as CheckInRoutes };
