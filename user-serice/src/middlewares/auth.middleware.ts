import { UnauthorizedError } from "../utils/ApiError";
import { verifyAccessToken } from "../utils/Auth";
import type { Request, Response, NextFunction } from "express";


const requireAuth = (req: Request, _: Response, next: NextFunction) => {

    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
        throw new UnauthorizedError("Access token missing", "ACCESS_TOKEN_MISSING");
    }

    try {

        const decoded = verifyAccessToken(token);
        req.user = { id: decoded.id };
        return next();

    } catch (error) {
        return next(new UnauthorizedError("Invalid access token", "INVALID_ACCESS_TOKEN"));
    }

}


export {
    requireAuth
}