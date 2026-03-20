import { Router } from "express";
import UserController from "../controllers/UserController.js";
import ValidateRequest from "../middlewares/ValidateRequest.js";
import { createUserSchema, updateUserSchema } from "../Validations/UserValidation.js";
import Auth from "../middlewares/Auth.js";
import { Permission } from "../configs/permission.js";

const router = Router();
const userController = new UserController();
const auth = new Auth();

// Get all users - ADMIN only
router.get(
  "/",
  auth.verifyPermission(Permission.READ_ALL_USERS),
  userController.findAll.bind(userController)
);

// Get user by ID - bisa user atau admin
router.get(
  "/:id",
  userController.findById.bind(userController)
);

// Create user - ADMIN only
router.post(
  "/",
  auth.verifyPermission(Permission.CREATE_USER),
  ValidateRequest(createUserSchema),
  userController.create.bind(userController)
);

// Update user - bisa user atau admin
router.put(
  "/:id",
  ValidateRequest(updateUserSchema),
  userController.update.bind(userController)
);

// Delete user - ADMIN only
router.delete(
  "/:id",
  auth.verifyPermission(Permission.DELETE_ANY_USER),
  userController.delete.bind(userController)
);

export { router as UserRoutes };
