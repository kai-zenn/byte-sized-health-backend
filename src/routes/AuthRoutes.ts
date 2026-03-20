import { Router } from "express";
import AuthController from "../controllers/AuthController.js";
import ValidateRequest from "../middlewares/ValidateRequest.js";
import { loginUserSchema, registerUserSchema } from "../Validations/UserValidation.js";

const router = Router();
const authController = new AuthController();

router
  .post("/login", ValidateRequest(loginUserSchema), authController.login.bind(authController))
  .post(
    "/register",
    ValidateRequest(registerUserSchema),
    authController.register.bind(authController)
  )
  .post("/refresh", authController.refresh.bind(authController))
  .post("/logout", authController.logout.bind(authController));

export { router as AuthRoutes };
