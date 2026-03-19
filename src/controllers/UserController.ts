import type { NextFunction, Request, Response } from "express";
import UserService from "../services/UserService.js";

const userService = new UserService();

export default class UserController {
  private readonly userService: UserService;
  constructor() {
    this.userService = userService;
  }

  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await this.userService.findAll();
      res.status(200).json({ users });
    } catch (err) {
      next(err);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {

      const user = await this.userService.findById(req.params.id as string);
      res.status(200).json({ user });
    } catch (err) {
      next(err);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await this.userService.create(req.body);
      res.status(201).json({ user });
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await this.userService.update(req.params.id as string, req.body);
      res.status(200).json({ user });
    } catch (err) {
      next(err);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await this.userService.delete(req.params.id as string);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
}
