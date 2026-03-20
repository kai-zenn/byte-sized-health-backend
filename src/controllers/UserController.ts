import type { Response, NextFunction } from "express";
import { HttpException } from "../utils/httpException.js";
import type { AuthRequest } from "../middlewares/Auth.js";
import { hasPermission, Permission } from "../configs/permission.js";
import UserService from "../services/UserService.js";

export default class UserController {
  private readonly userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  async findAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      // Already protected by middleware, just execute
      const users = await this.userService.findAll();

      res.status(200).json({
        success: true,
        data: users,
      });
    } catch (err) {
      next(err);
    }
  }

  async findById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      if (!req.user) {
        throw new HttpException(401, "Unauthorized");
      }

      const isOwnProfile = req.user.userId === id;

      // If not own profile, check admin permission
      if (!isOwnProfile) {
        const canReadAllUsers = hasPermission(req.user.role, Permission.READ_ALL_USERS);

        if (!canReadAllUsers) {
          throw new HttpException(403, "Forbidden - You can only view your own profile");
        }
      }

      const user = await this.userService.findById(id as string);

      if (!user) {
        throw new HttpException(404, "User not found");
      }

      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (err) {
      next(err);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      if (!req.user) {
        throw new HttpException(401, "Unauthorized");
      }

      const isOwnProfile = req.user.userId === id;

      // If not user own profile, it will check admin permission
      if (!isOwnProfile) {
        const canUpdateAnyUser = hasPermission(req.user.role, Permission.UPDATE_ANY_USER);

        if (!canUpdateAnyUser) {
          throw new HttpException(403, "Forbidden - You can only update your own profile");
        }
      }

      const updatedUser = await this.userService.update(id as string, req.body);

      res.status(200).json({
        success: true,
        data: updatedUser,
      });
    } catch (err) {
      next(err);
    }
  }

  /* Admin only method */
  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      await this.userService.delete(id as string);

      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const newUser = await this.userService.create(req.body);

      res.status(201).json({
        success: true,
        data: newUser,
      });
    } catch (err) {
      next(err);
    }
  }
}
