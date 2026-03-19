import type { Request, Response, NextFunction } from "express";
import { type z, ZodError } from "zod";
import { HttpValidationException } from "../utils/httpException.js";

const ValidateRequest = (validationSchema: z.Schema) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      validationSchema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const errorMessages = err.issues.map(
        (error) => `${error.path.join(".")} is
        ${error.message.toLowerCase()}`);
        next(new HttpValidationException(errorMessages));
      }
    }
  };
};
export default ValidateRequest;
