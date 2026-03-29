import crypto from 'crypto';
import { config } from '../config';
import jwt from 'jsonwebtoken';
import logger from '../config/logger';
import { UnauthorizedError } from './ApiError';


const generateAccessToken = (userId: string) => {

    const payload = { id: userId };

    return jwt.sign(payload, config.JWT_ACCESS_SECRET!, { expiresIn: config.ACCESS_TOKEN_EXP } as jwt.SignOptions);

}


const generateRefreshToken = (userId: string) => {

    const payload = {
        id: userId,
        jti: crypto.randomUUID()
    };

    return jwt.sign(payload, config.JWT_REFRESH_SECRET!, { expiresIn: config.REFRESH_TOKEN_EXP } as jwt.SignOptions);
}


const verifyAccessToken = (token: string) => {
    try {
        const decoded = jwt.verify(token, config.JWT_ACCESS_SECRET!) as { id: string };
        return decoded;
    } catch (err) {
        logger.error("Invalid access token", { token, error: err });
        throw new UnauthorizedError("Invalid access token", "INVALID_ACCESS_TOKEN");
    }
}

const verifyRefreshToken = (token: string) => {
    try {
        const decoded = jwt.verify(token, config.JWT_REFRESH_SECRET!) as { id: string, deviceId: string, jti: string };
        return decoded;
    } catch (err) {
        logger.error("Invalid refresh token", { token, error: err });
        throw new UnauthorizedError("Invalid refresh token", "INVALID_REFRESH_TOKEN");
    }
}


export {
    generateAccessToken,
    generateRefreshToken,
    verifyAccessToken,
    verifyRefreshToken
}