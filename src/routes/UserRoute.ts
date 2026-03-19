import { Router } from "express";
import UserController from "../controllers/UserController.js";
import ValidateRequest from "../middlewares/ValidateRequest.js";
import { createUserSchema, updateUserSchema } from "../Validations/UserValidation.js";

const router = Router();
const userController = new UserController();

router.get("/", userController.findAll.bind(userController));
router.get("/:id", userController.findById.bind(userController));
router.post("/", ValidateRequest(createUserSchema),userController.create.bind(userController));
router.put("/:id", ValidateRequest(updateUserSchema), userController.update.bind(userController));
router.delete("/:id", userController.delete.bind(userController));

export { router as UserRoutes } ;
