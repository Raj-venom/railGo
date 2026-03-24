import { Router } from "express";

import userController from "./user.controller";
import { requireAuth } from "../../middlewares/auth.middleware";


const router = Router();

router.get("/profile", requireAuth, userController.getUserProfile);


export default router;

