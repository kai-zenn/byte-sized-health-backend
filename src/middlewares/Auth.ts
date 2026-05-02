import type { Request, Response, NextFunction } from "express";
import { HttpException } from "../utils/httpException.js";
import { Role } from "@prisma/client";
import { hasPermission, Permission } from "../configs/permission.js";
import { JwtService } from "../services/JwtService.js";

const { ACCESS_TOKEN_SECRET } = process.env as { [key: string]: string };

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: Role;
  };
}

export default class Auth {
  private jwtService: JwtService;

  constructor() {
    this.jwtService = new JwtService();
  }

  /**
   * Verify JWT access token
   */
  async verifyToken(req: AuthRequest, _res: Response, next: NextFunction): Promise<void> {
    try {
      const { authorization } = req.headers;

      if (!authorization) {
        throw new HttpException(401, "Unauthorized - No token provided");
      }

      const [type, token] = authorization.split(" ");

      if (type !== "Bearer") {
        throw new HttpException(401, "Unauthorized - Invalid token type");
      }

      if (!token) {
        throw new HttpException(401, "Unauthorized - Token missing");
      }

      console.log('Verifying token...');
      console.log("AUTH HEADER:", authorization);
      console.log("TYPE:", type);
      console.log("TOKEN:", token);

      const decoded = await this.jwtService.verify(token, ACCESS_TOKEN_SECRET);

      console.log('Token verified:', { userId: decoded.userId, email: decoded.email, role: decoded.role });

      req.user = decoded as { userId: string; email: string; role: Role };

      next();
    } catch (err) {
      console.error('Auth middleware error:', err);
      next(err);
    }
  }

  /**
   * Verify if user has any of the allowed roles
   */
  verifyRoles(allowedRoles: Role[]) {
    return (req: AuthRequest, _res: Response, next: NextFunction): void => {
      try {
        if (!req.user || !req.user?.role) {
          throw new HttpException(403, "Forbidden - No user role found");
        }

        const hasRole = allowedRoles.includes(req.user.role);

        if (!hasRole) {
          throw new HttpException(
            403,
            `Forbidden - Requires one of: ${allowedRoles.join(", ")}`
          );
        }

        next();
      } catch (err) {
        next(err);
      }
    };
  }

  /**
   * Verify if user has specific permission
   */
  verifyPermission(permission: Permission) {
    return (req: AuthRequest, _res: Response, next: NextFunction): void => {
      try {
        if (!req.user || !req.user?.role) {
          throw new HttpException(403, "Forbidden - No user role found");
        }

        const hasRequiredPermission = hasPermission(req.user.role, permission);

        if (!hasRequiredPermission) {
          throw new HttpException(
            403,
            `Forbidden - Missing permission: ${permission}`
          );
        }

        next();
      } catch (err) {
        next(err);
      }
    };
  }

  /**
   * Verify admin role
   */
  verifyAdmin() {
    return this.verifyRoles([Role.ADMIN]);
  }
}
