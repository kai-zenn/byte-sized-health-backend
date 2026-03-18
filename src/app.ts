import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { Response, Request, NextFunction } from "express";
const App = express();

dotenv.config();

App.use(cors({
  origin: process.env.CORS_ORIGIN || "*",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));
App.use(cookieParser());
App.use(express.json());
App.use(express.urlencoded({ extended: true }));



// App.use("/api", AppRoutes)

App.use((_req: Request, res: Response, next: NextFunction) => {
  res.status(404).send("Route not found")
});

export default App;
