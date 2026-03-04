import { config } from "../../config";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";
import { CookieNames } from "../../utils/constant";
import AuthService from "./auth.service";
import { StatusCodes } from "http-status-codes";

import { SignUpBody } from "./auth.types";
import { getDeviceFingerprint } from "../../utils/deviceFingerPrint";
import { UnauthorizedError } from "../../utils/ApiError";

const cookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: "strict" as const,
    maxAge: Number(config.OTP_TTL) * 1000
}

const getCookieOptions = (maxAge?: number) => ({
    ...cookieOptions,
    ...(maxAge !== undefined && { maxAge: maxAge * 1000 })
});


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

    public verifyOTP = asyncHandler<{}, any, { otp: string, otpSessionId: string }>(
        async (req, res) => {
            const { otp } = req.body;
            const otpSessionId = req.cookies[CookieNames.OTP_SESSION]

            const { user } = await this.authService.verifyOTP({ otp, otpSessionId });

            res.clearCookie(CookieNames.OTP_SESSION);

            return res
                .status(StatusCodes.OK)
                .json(new ApiResponse(StatusCodes.OK, user, "User signed up successfully"));

        }
    )

    public login = asyncHandler<{}, any, { email: string, password: string }>(
        async (req, res) => {
            // 1. Validate email and password
            // 2. Find user by email
            // 3. If user not found, throw error
            // 4. Compare password with hashed password in database
            // 5. If password is invalid, throw error
            // 6. If valid, generate JWT token
            // 7. Return token in response

            const { email, password } = req.body;

            const deviceId = getDeviceFingerprint(req);

            const { accessToken, loggedInUser, refreshToken } = await this.authService.login({ email, password, deviceId });

            return res
                .status(StatusCodes.OK)
                .cookie(CookieNames.ACCESS_TOKEN, accessToken, getCookieOptions(config.ACCESS_TOKEN_EXP_SEC))
                .cookie(CookieNames.REFRESH_TOKEN, refreshToken, getCookieOptions(config.REFRESH_TOKEN_EXP_SEC))
                .json(new ApiResponse(StatusCodes.OK, { accessToken, refreshToken, user: loggedInUser }, "User logged in successfully"));

        }
    )

    public rotateRefreshToken = asyncHandler<{}, any, { refreshToken: string }>(
        async (req, res) => {

            const refreshToken = req.cookies.refreshToken;

            if (!refreshToken) {
                throw new UnauthorizedError("Refresh token is missing", "LOGIN AGAIN")
            }

            const deviceId = getDeviceFingerprint(req);

            const { newAccessToken, newRefreshToken } = await this.authService.rotateRefreshToken(refreshToken, deviceId);

            return res
                .status(StatusCodes.OK)
                .cookie(CookieNames.ACCESS_TOKEN, newAccessToken, getCookieOptions(config.ACCESS_TOKEN_EXP_SEC))
                .cookie(CookieNames.REFRESH_TOKEN, newRefreshToken, getCookieOptions(config.REFRESH_TOKEN_EXP_SEC))
                .json(new ApiResponse(StatusCodes.OK, { accessToken: newAccessToken, refreshToken: newRefreshToken }, "Access and Refresh token reissued successfully"));

        }
    )


}

export default AuthController;