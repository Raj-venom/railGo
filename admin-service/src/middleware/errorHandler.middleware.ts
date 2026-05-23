import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";
import { config } from "../config";


const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const isDev = config.NODE_ENV !== "production";

  // Handle custom ApiError
  if (err instanceof ApiError) {
    req.logger?.warn(
      {
        statusCode: err.statusCode,
        code: err.code,
      },
      err.message,
    );

    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      code: err.code,
      data: null,
      ...(isDev && { stack: err.stack }),
    });
  }

  // Handle unknown/system errors
  req.logger?.error(
    {
      stack: (err as Error).stack,
      path: req.path,
      method: req.method,
    },
    (err as Error).message || "Unhandled error",
  );

  return res.status(500).json({
    success: false,
    message: "Internal Server Error",
    code: "INTERNAL_SERVER_ERROR",
    data: null,
    ...(isDev && { stack: (err as Error).stack }),
  });
};

export { errorHandler };
