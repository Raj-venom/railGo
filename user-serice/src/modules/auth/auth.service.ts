import prisma from "../../config/prisma";
import { ConflictError } from "../../utils/ApiError";
import bcrypt from "bcrypt";
import { createOtpSession, verifyOtpSession } from "../../utils/otpHelper";
import { sendWelcomeEmail } from "../../utils/email";

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



}
export default AuthService;
