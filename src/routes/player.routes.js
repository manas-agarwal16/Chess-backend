import { Router } from "express";
import {
  register,
  verifyOTP,
  resendOTP,
  login,
  refreshAccessToken,
  getCurrentPlayer,
  logout,
} from "../controllers/player.controller.js";

import { verifyJWT } from "../utils/verifyJWT.js";

const router = Router();

router.route("/register").post(register);
router.route("/verify-otp").post(verifyOTP);
router.route("/resend-otp/:email").get(resendOTP);
router.route("/login").post(login);
router.route("/refresh-access-token").post(refreshAccessToken);
router.route("/get-current-player").get(getCurrentPlayer);
router.route("/logout").get(verifyJWT, logout);

export default router;
