import express, { Router } from "express";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import { errorHandler } from "./middleware/errorHandler.middleware";
import { requestLogger } from "./middleware/req.middleware";
import { notFoundHandler } from "./middleware/notFound.middleware";
import { corsMiddleware } from "./middleware/cors.middlware";
import { config } from "./config";
import router from "./routes";

const app = express();

app.use(corsMiddleware);
app.use(
  helmet({
    crossOriginOpenerPolicy: false,
    crossOriginEmbedderPolicy: false,
  }),
);
app.use(requestLogger);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

if (config.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API Gateway is running",
    timestamp: new Date().toISOString(),
    environment: config.NODE_ENV,
  });
});

app.use("/api", router);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
