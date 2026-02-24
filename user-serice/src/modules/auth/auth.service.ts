import prisma from "../../config/prisma";
import { ConflictError } from "../../utils/ApiError";
import bcrypt from "bcrypt";

class AuthService {

    initiateSignup = async ({ firstName, lastName, email, password }) => {

        const existingUser = await prisma.user.findUnique({ where: { email } });

        if(existingUser) {
            throw new ConflictError("Email already in use", "EMAIL_ALREADY_IN_USE");
        }

        if (existingUser) {
            throw new ConflictError("Email already in use", "EMAIL_ALREADY_IN_USE");
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        const meta = {firstName, lastName, email, hashedPassword};
     const {otp, otpSessionId} = await generateAndStoreOtp(meta);

     return {otpSessionId}





    };
}
export default AuthService;
