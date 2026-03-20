import type { Role } from "@prisma/client";
import bcrypt from "bcrypt";
import UserService from "./UserService.js";
import RefreshTokenService from "./RefreshTokenService.js";
import { JwtService, type AuthToken } from "./JwtService.js";
import type { LoginUserInput, RegisterUserInput, CreateUserInput } from "../Validations/UserValidation.js";
import { HttpException } from "../utils/httpException.js";
import { Role as RoleEnum } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();

const userService = new UserService();
const refreshTokenService = new RefreshTokenService();
const jwtService = new JwtService();

export default class AuthService {
  private readonly userService: UserService;
  private readonly refreshTokenService: RefreshTokenService;
  private readonly jwtService: JwtService;

  constructor() {
    this.userService = userService;
    this.refreshTokenService = refreshTokenService;
    this.jwtService = jwtService;
  }

  async login(data: LoginUserInput): Promise<AuthToken> {
    let user;

    // Find user by phone or email
    if (data.phone) {
      user = await this.userService.findByKey("phone", data.phone);
    } else if (data.email) {
      user = await this.userService.findByKey("email", data.email);
    }

    if (!user) {
      throw new HttpException(401, "Invalid credentials");
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    if (!isPasswordValid) {
      throw new HttpException(401, "Invalid credentials");
    }

    // Generate tokens with userId, email, role
    const { id, email, role } = user;
    const { accessToken, refreshToken } = this.jwtService.genAuthTokens({
      userId: id,
      email,
      role
    });

    await this.refreshTokenService.saveRefreshToken(user.id, refreshToken);

    return { accessToken, refreshToken };
  }

  async register(data: RegisterUserInput): Promise<AuthToken> {
    const existingUserByEmail = await this.userService.findByKey("email", data.email);
    if (existingUserByEmail) {
      throw new HttpException(400, "Email already registered");
    }

    const existingUserByPhone = await this.userService.findByKey("phone", data.phone);
    if (existingUserByPhone) {
      throw new HttpException(400, "Phone number already registered");
    }

    const createUserData: CreateUserInput = {
      ...data,
      role: RoleEnum.USER,
    };

    const newUser = await this.userService.create(createUserData);

    // Generate tokens with userId, email, role
    const { id, email, role } = newUser;
    const { accessToken, refreshToken } = this.jwtService.genAuthTokens({
      userId: id,
      email,
      role
    });

    await this.refreshTokenService.saveRefreshToken(newUser.id, refreshToken);

    return { accessToken, refreshToken };
  }

  async refresh(refreshToken: string): Promise<{ accessToken: string }> {
    if (!refreshToken) {
      throw new HttpException(401, "Refresh token required");
    }

    const user = await this.refreshTokenService.findUserByToken(refreshToken);

    const decoded = await this.jwtService.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET as string
    );

    // Validate dengan userId
    if (decoded.userId !== user.id || decoded.email !== user.email || decoded.role !== user.role) {
      throw new HttpException(403, "Token validation failed");
    }

    // Generate new access token dengan userId
    const { accessToken } = this.jwtService.genAuthTokens({
      userId: user.id,
      email: user.email,
      role: user.role
    });

    return { accessToken };
  }

  async logout(refreshToken: string) {
    // Revoke refresh token
    await this.refreshTokenService.revokeToken(refreshToken);
  }

  /**
   * Logout from all devices
   */
  async logoutAll(userId: string) {
    await this.refreshTokenService.revokeAllUserTokens(userId);
  }
}
