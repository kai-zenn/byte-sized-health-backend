import jwt from "jsonwebtoken";
import { Role } from "@prisma/client";
import { HttpException } from "../utils/httpException.js";
import dotenv from "dotenv";

dotenv.config();

export type AuthToken = {
  accessToken: string;
  refreshToken: string;
}

export type JwtPayload = {
  userId: string;
  email: string;
  role: Role;
}

const { ACCESS_TOKEN_SECRET, ACCESS_TOKEN_EXPIRY, REFRESH_TOKEN_SECRET, REFRESH_TOKEN_EXPIRY } = process.env as { [key: string]: string };

export class JwtService {
  genAuthTokens(payload: JwtPayload): AuthToken {
    const accessToken = this.sign(payload, ACCESS_TOKEN_SECRET, {
      expiresIn: ACCESS_TOKEN_EXPIRY as jwt.SignOptions["expiresIn"]
    });
    const refreshToken = this.sign(payload, REFRESH_TOKEN_SECRET, {
      expiresIn: REFRESH_TOKEN_EXPIRY as jwt.SignOptions["expiresIn"]
    });
    return { accessToken, refreshToken };
  }
  async verify(token: string, secret: string): Promise<JwtPayload> {
    const decoded: JwtPayload = await new Promise((resolve, reject) => {
      jwt.verify(token, secret, (err, decoded) => {
        if (err) {
          console.log('JWT Verify Error:', err.message);
          reject(new HttpException(403, `Token verification failed: ${err.message}`));
        } else {
          resolve(decoded as JwtPayload);
        }
      });
    });
    return decoded;
  }
  sign(payload: JwtPayload, secret: string, options?: jwt.SignOptions): string {
    return jwt.sign(payload, secret, options);
  }
}
