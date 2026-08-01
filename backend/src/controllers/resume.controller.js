import { extractTextFromPdfBuffer } from "../services/pdf.service.js";
import { analyzeResumeWithGemini } from "../services/ai.service.js";
import { createApiResponse } from "../utils/apiResponse.js";
import { deductCredits, refundCredits, ANALYSIS_COST } from "../services/wallet.service.js";
import Analysis from "../models/analysis.model.js";

const analyzeResumeHandler = async (req, res, next) => {
  const userId = req.user?.userId;
  let creditsDeducted = false;

  try {
    const { jobDescription, jobTitle } = req.body;
    const file = req.file;

    if (!jobDescription?.trim()) {
      const error = new Error("Job description is required.");
      error.statusCode = 400;
      throw error;
    }

    if (!file) {
      const error = new Error("A PDF resume file is required.");
      error.statusCode = 400;
      throw error;
    }

    if (!userId) {
      const error = new Error("Authentication required.");
      error.statusCode = 401;
      throw error;
    }

    // Step 1: Deduct credits BEFORE calling the AI (requireCredits middleware
    // already validated balance, but we deduct atomically here)
    await deductCredits(userId, ANALYSIS_COST, "RESUME_ANALYSIS");
    creditsDeducted = true;

    // Step 2: Extract text and run AI analysis
    const resumeText = await extractTextFromPdfBuffer(file.buffer);

    let analysis;
    try {
      analysis = await analyzeResumeWithGemini(resumeText, jobDescription);
    } catch (aiError) {
      // Step 3: AI failed — refund credits automatically
      console.error("AI analysis failed, initiating credit refund:", aiError.message);
      await refundCredits(userId, ANALYSIS_COST, null, {
        reason: "AI analysis failed",
        originalError: aiError.message,
      });
      creditsDeducted = false;
      throw aiError;
    }

    // Step 4: Save analysis result
    const savedAnalysis = await Analysis.create({
      userId,
      jobTitle: jobTitle || "Target Role",
      atsScore: analysis?.atsScore,
      analysisData: analysis,
    });

    res.status(200).json(
      createApiResponse({
        statusCode: 200,
        message: "Resume analysis completed successfully.",
        data: {
          analysisId: savedAnalysis._id,
          analysis,
        },
      }),
    );
  } catch (error) {
    // Safety net: if credits were deducted but we hit an unexpected error
    // AFTER the AI call (e.g., DB failure saving analysis), refund credits
    if (creditsDeducted && userId) {
      try {
        await refundCredits(userId, ANALYSIS_COST, null, {
          reason: "Unexpected error after AI analysis",
          error: error.message,
        });
      } catch (refundError) {
        console.error("Critical: Failed to refund credits after error:", refundError.message);
      }
    }
    next(error);
  }
};

const getHistoryHandler = async (req, res, next) => {
  try {
    const analyses = await Analysis.find({ userId: req.user.userId })
      .sort({ createdAt: -1 })
      .select("jobTitle atsScore createdAt")
      .lean();

    res.status(200).json(
      createApiResponse({
        statusCode: 200,
        message: "Analysis history fetched successfully.",
        data: { analyses },
      }),
    );
  } catch (error) {
    next(error);
  }
};

const getAnalysisByIdHandler = async (req, res, next) => {
  try {
    const { id } = req.params;

    const analysis = await Analysis.findOne({
      _id: id,
      userId: req.user.userId,
    }).lean();

    if (!analysis) {
      const error = new Error("Analysis not found.");
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json(
      createApiResponse({
        statusCode: 200,
        message: "Analysis fetched successfully.",
        data: { analysis },
      }),
    );
  } catch (error) {
    next(error);
  }
};

export { analyzeResumeHandler, getAnalysisByIdHandler, getHistoryHandler };
export default analyzeResumeHandler;
