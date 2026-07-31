import express from "express";
import {
  googleLoginHandler,
  loginHandler,
  meHandler,
  registerHandler,
} from "../controllers/auth.controller.js";
import authenticateUser from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/register", registerHandler);
router.post("/login", loginHandler);
router.post("/google", googleLoginHandler);
router.get("/me", authenticateUser, meHandler);

export default router;
