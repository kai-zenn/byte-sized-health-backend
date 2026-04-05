import express from "express";
// import helmet from "helmet";
// import morgan from "morgan";
import path from "path";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { Response, Request, NextFunction } from "express";
import ErrorHandler from "./middlewares/ErrorHandler.js";
import { HttpException } from "./utils/httpException.js";
import { AppRoutes } from "./routes/main/AppRoutes.js";
const App = express();

dotenv.config();

/* Middleware */
// App.use(helmet());
App.use(cors({
  origin: process.env.CORS_ORIGIN || "*",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));
App.use(cookieParser());
App.use(express.json());
App.use(express.urlencoded({ extended: true }));
// if (process.env.NODE_ENV === "development") {
//   App.use(morgan("dev"));
// } else {
//   App.use(morgan("combined")); // or use pino/winston in production
// }

// Serve static files (uploaded images)
App.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

/* Routes */
App.use("/api", AppRoutes)

/* Error Handling */
App.use((_req: Request, res: Response, next: NextFunction) => {
  next(new HttpException(404, "Route not found"));
});
App.use(ErrorHandler)

export default App;
