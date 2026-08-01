import express from "express";
import authenticateUser from "../middlewares/auth.middleware.js";
import {
  createOrderHandler,
  getPackagesHandler,
  getPaymentHistoryHandler,
  verifyPaymentHandler,
} from "../controllers/payment.controller.js";

const router = express.Router();

// All payment routes require authentication
router.get("/packages", authenticateUser, getPackagesHandler);
router.post("/create-order", authenticateUser, createOrderHandler);
router.post("/verify", authenticateUser, verifyPaymentHandler);
router.get("/history", authenticateUser, getPaymentHistoryHandler);

export default router;
