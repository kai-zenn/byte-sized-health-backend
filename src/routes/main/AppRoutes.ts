import { Router } from "express";
import { UserRoutes } from "../UserRoute.js";
import { AuthRoutes } from "../AuthRoutes.js";
import { ArticleRoutes } from "../ArticlesRoutes.js";
import Auth from "../../middlewares/Auth.js";
import { LlmRoutes } from "../LlmRoutes.js";

const router = Router();
const authMiddleware = new Auth();

// Auth routes (public)
router.use("/auth", AuthRoutes);

// protected - authentication required
router.use(
  "/users",
  authMiddleware.verifyToken.bind(authMiddleware),
  UserRoutes
);

// Articles routes for pubblic access
router.use("/articles", ArticleRoutes);

// LLM integration routes
router.use("/llm", LlmRoutes);

export { router as AppRoutes };
