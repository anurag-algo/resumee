import express from "express";
import upload from "../middlewares/multer.middleware.js";
import {
  analyzeResumeHandler,
  getAnalysisByIdHandler,
  getHistoryHandler,
} from "../controllers/resume.controller.js";
import authenticateUser from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post(
  "/analyze",
  authenticateUser,
  upload.single("resume"),
  analyzeResumeHandler,
);

router.get("/history", authenticateUser, getHistoryHandler);
router.get("/history/:id", authenticateUser, getAnalysisByIdHandler);

export default router;
