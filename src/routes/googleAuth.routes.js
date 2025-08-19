import express from "express";
import passport from "../config/passport.js";
import { generateAccessToken, generateRefreshToken } from "../utils/tokens.js";
import { Player } from "../models/index.js";

const router = express.Router();

// 1. Start Google login
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// 2. Google OAuth callback
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  async (req, res) => {
    const player = req.user;

    // issue JWTs like your normal login
    const accessToken = await generateAccessToken(player);
    const refreshToken = await generateRefreshToken(player);

    console.log("here");
    
    await Player.update({ refreshToken }, { where: { id: player.id } });

    return res
      .cookie("accessToken", accessToken, {
        sameSite: "None",
        httpOnly: true,
        secure: true,
        maxAge: 24 * 60 * 60 * 1000,
      })
      .cookie("refreshToken", refreshToken, {
        sameSite: "None",
        httpOnly: true,
        secure: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .redirect("http://localhost:5173"); // frontend route
  }
);

export default router;
