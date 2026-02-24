import { Router } from 'express';

import { validateRequest } from "../../middlewares/validateRequest.middleware";
import { signUpSchema } from "./auth.validation";
import AuthController from './auth.controller';

const router = Router();
const authController = new AuthController();



router.post('/signup/request-otp', validateRequest(signUpSchema), authController.initiateSignup);




export default router;