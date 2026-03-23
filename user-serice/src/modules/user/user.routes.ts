import { Router } from "express";

import userController from "./user.controller";


const router = Router();

router.get("/profile", userController.getUserProfile);


export default router;

