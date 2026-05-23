import { NotFoundError } from "../utils/ApiError";
import type { Request, Response, NextFunction } from "express";


function notFoundHandler(req: Request, res: Response, next: NextFunction): void {
    next(new NotFoundError(`Route ${req.method} ${req.path} not found`));
}

export { notFoundHandler };