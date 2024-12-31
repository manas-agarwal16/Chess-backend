import { Router } from "express";
import { registerPlayer } from "../controllers/player.controller.js";

const router = Router();

router.route('/register').post(registerPlayer);

export default router;