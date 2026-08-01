import express from "express";
import authenticateUser from "../middlewares/auth.middleware.js";
import {
  getTransactionHistoryHandler,
  getWalletHandler,
} from "../controllers/wallet.controller.js";

const router = express.Router();

// All wallet routes require authentication
router.get("/", authenticateUser, getWalletHandler);
router.get("/history", authenticateUser, getTransactionHistoryHandler);

export default router;
