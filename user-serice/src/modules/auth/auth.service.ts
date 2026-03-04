import prisma from "../../config/prisma";
import { ApiError, ConflictError, ForbiddenError, UnauthorizedError } from "../../utils/ApiError";
import bcrypt from "bcrypt";
import { createOtpSession, verifyOtpSession } from "../../utils/otpHelper";
import { sendWelcomeEmail } from "../../utils/email";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../../utils/Auth";
import jwt from "jsonwebtoken";
import { redisClient } from "../../config/redis";
import { config } from "../../config";

class AuthService {

    initiateSignup = async ({ firstName, lastName, email, password }) => {

        const existingUser = await prisma.user.findUnique({ where: { email } });

        if (existingUser) {
            throw new ConflictError("Email already in use", "EMAIL_ALREADY_IN_USE");
        }


        const hashedPassword = await bcrypt.hash(password, 12);
        const meta = { firstName, lastName, email, hashedPassword };
        const { otp, otpSessionId } = await createOtpSession(meta);

        return { otpSessionId }

    }

    verifyOTP = async ({ otp, otpSessionId }) => {
        // 1. Retrieve OTP session from Redis using otpSessionId
        // 2. If session doesn't exist, throw error (OTP expired or invalid)
        // 3. Compare provided OTP with stored HMAC in Redis
        // 4. If OTP is invalid, throw error
        // 5. If valid, create user in database using meta from OTP session
        // 6. Delete OTP session from Redis
        // 7. Return user data

        const meta = await verifyOtpSession(otp, otpSessionId);

        const user = await prisma.user.create({
            data: {
                firstName: meta.firstName,
                lastName: meta.lastName,
                email: meta.email,
                password: meta.hashedPassword
            }
        });

        await sendWelcomeEmail(user.email, user.firstName);
        return { user };

    }



    login = async ({ email, password, deviceId }: {
        email: string;
        password: string;
        deviceId: string;
    }) => {

        const existingUser = await prisma.user.findUnique({ where: { email } });

        if (!existingUser) {
            throw new UnauthorizedError("Invalid email or password", "INVALID_CREDENTIALS");
        }

        const isPasswordValid = await bcrypt.compare(password, existingUser.password);

        if (!isPasswordValid) {
            throw new UnauthorizedError("Invalid email or password", "INVALID_CREDENTIALS");
        }

        const accessToken = generateAccessToken(existingUser.id);
        const refreshToken = generateRefreshToken(existingUser.id);

        const { jti } = jwt.decode(refreshToken) as { jti: string };

        await redisClient.set(`refresh:${existingUser.id}:${deviceId}`, jti, 'EX', config.REFRESH_TOKEN_EXP_SEC);
        const { password: _password, ...safeUser } = existingUser;

        await redisClient.set(`user:${existingUser.id}`, JSON.stringify(safeUser), 'EX', config.REDIS_USER_TTL);
        return { accessToken, refreshToken, loggedInUser: safeUser };
    }


    rotateRefreshToken = async (refreshToken: string, deviceId: string) => {

        const payload = verifyRefreshToken(refreshToken);
        const { id: userId, jti } = payload;

        const storedJti = await redisClient.get(`refresh:${userId}:${deviceId}`);

        if (!storedJti) {
            throw new ForbiddenError("Session expired. Please log in again.", "SESSION_EXPIRED");
        }

        if (storedJti !== jti) {
            await redisClient.del(`refresh:${userId}:${deviceId}`);
            throw new ForbiddenError("Invalid session. Please log in again.", "INVALID_SESSION");
        }

        const newAccessToken = generateAccessToken(payload.id);
        const newRefreshToken = generateRefreshToken(payload.id);
        const { jti: newJti } = jwt.decode(newRefreshToken) as { jti: string };

        await redisClient.set(`refresh:${payload.id}:${deviceId}`, newJti, 'EX', config.REFRESH_TOKEN_EXP_SEC);
        return { newAccessToken, newRefreshToken };

    }




}



export default AuthService;
