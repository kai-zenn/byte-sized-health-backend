import { Router } from "express";
import { UserRoutes } from "../UserRoute.js";
import { AuthRoutes } from "../AuthRoutes.js";
import Auth from "../../middlewares/Auth.js";

const router = Router();
const authMiddleware = new Auth();

// Auth routes (public)
router.use("/auth", AuthRoutes);

// User routes (protected - authentication required)
router.use(
  "/users",
  authMiddleware.verifyToken.bind(authMiddleware),
  UserRoutes
);

export { router as AppRoutes };
