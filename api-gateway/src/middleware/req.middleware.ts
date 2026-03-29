import type { Request, Response, NextFunction } from "express";
import { randomUUID } from "crypto";
import logger from "../config/logger";

// Extend Express Request interface
declare module "express-serve-static-core" {
  interface Request {
    requestId: string;
    logger: typeof logger;
  }
}

const requestMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const startTime = process.hrtime.bigint();

  const requestId = randomUUID();

  // Attach requestId
  req.requestId = requestId;

  // Create scoped child logger
  const childLogger = logger.child({
    requestId,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.headers["user-agent"],
  });

  req.logger = childLogger;

  childLogger.info("Incoming request");

  res.on("finish", () => {
    const endTime = process.hrtime.bigint();
    const durationMs = Number(endTime - startTime) / 1_000_000;

    childLogger.info(
      {
        statusCode: res.statusCode,
        duration: `${durationMs.toFixed(2)}ms`,
      },
      "Request completed",
    );
  });

  next();
};

export default requestMiddleware;
