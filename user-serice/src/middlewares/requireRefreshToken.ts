import { Request, Response, NextFunction } from 'express';

export const requireRefreshToken = (req: Request, res: Response, next: NextFunction) => {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
        res.status(401).json({
            success: false,
            message: 'Refresh token is missing',
        });
        return;
    }

    next();
};