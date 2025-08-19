import { Router } from "express";
import {
  register,
  verifyOTP,
  resendOTP,
  login,
  refreshAccessToken,
  getCurrentPlayer,
  logout,
  fetchPlayerRating,
  playerProfile,
  viewMatch,
  updateAvatar,
} from "../controllers/player.controller.js";

import { verifyJWT } from "../utils/verifyJWT.js";

const router = Router();

router.route("/register").post(register);
router.route("/verify-otp").post(verifyOTP);
router.route("/resend-otp/:email").get(resendOTP);
router.route("/login").post(login);
router.route("/refresh-access-token").get(refreshAccessToken);
router.route("/get-current-player").get(getCurrentPlayer);
router.route("/logout").get(verifyJWT, logout);
router.route("/fetch-player-rating/:id").get(fetchPlayerRating);
router.route("/profile/:handle").get(playerProfile);
router.route("/view-match/:matchId/:playerId").get(viewMatch);
router.route("/update-avatar").put(verifyJWT, updateAvatar);



export default router;
