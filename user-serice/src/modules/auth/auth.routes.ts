import { Router } from 'express';

import { validateRequest } from "../../middlewares/validateRequest.middleware";
import { signUpSchema, loginSchema, verifyOTPSchema, googleAuthSchema } from "./auth.validation";
import AuthController from './auth.controller';
import { requireRefreshToken } from '../../middlewares/requireRefreshToken';

const router = Router();
const authController = new AuthController();



router.post('/signup/request-otp', validateRequest(signUpSchema), authController.initiateSignup);

// TODO: Check if validateRequest can handle cookies validation
router.post("/verify-otp", validateRequest(verifyOTPSchema), authController.verifyOTP);

router.post("/login", validateRequest(loginSchema), authController.login);
router.get("/refresh", requireRefreshToken, authController.rotateRefreshToken);
router.post("/google-auth", validateRequest(googleAuthSchema), authController.googleLogin);




export default router;