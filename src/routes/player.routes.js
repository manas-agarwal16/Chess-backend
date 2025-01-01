import { Router } from "express";
import { register , verifyOTP } from "../controllers/player.controller.js";

const router = Router();

router.route('/register').post(register);
router.route('/verify-otp').post(verifyOTP);

export default router;