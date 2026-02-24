import { config } from "../../config";
import { BadRequestError } from "../../utils/ApiError";
import { asyncHandler } from "../../utils/asyncHandler";
import AuthService from "./auth.service";

import { SignUpBody } from "./auth.types";



class AuthController {

    private authService: AuthService;

    constructor() {
        this.authService = new AuthService();
    }

    // Validate (already done by middleware):
    // Ensure email is unique, otherwise throw error
    // Hash the password
    // Enforce OTP generation rate limits per email
    // Generate OTP and create OTP session ID
    // Store HMAC of OTP and email in Redis with expiration
    // Increment OTP generation counter in Redis with expiration
    // Send OTP to the user's email
    // Set OTP session ID in cookies and return response

    public initiateSignup = asyncHandler<{}, any, SignUpBody>(
        async (req, res) => {
            const { firstName, lastName, email, password, confirmPassword } = req.body;

            const { otpSessionId } = await this.authService.initiateSignup({ firstName, lastName, email, password });



        }
    );


}

export default AuthController;