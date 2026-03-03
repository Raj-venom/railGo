import { config } from "../../config";
import { BadRequestError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";
import { CookieNames } from "../../utils/constant";
import AuthService from "./auth.service";
import { StatusCodes } from "http-status-codes";

import { SignUpBody } from "./auth.types";

const cookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: "strict" as const,
    maxAge: Number(config.OTP_TTL) * 1000
}

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
            const { firstName, lastName, email, password } = req.body;

            const { otpSessionId } = await this.authService.initiateSignup({ firstName, lastName, email, password });

            const response = new ApiResponse(StatusCodes.OK, null, "User logged in successfully");

            return res
                .status(response.statusCode)
                .cookie(CookieNames.OTP_SESSION, otpSessionId, cookieOptions)
                .json(response);
        }
    )

}

export default AuthController;