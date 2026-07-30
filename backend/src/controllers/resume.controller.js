import { extractTextFromPdfBuffer } from "../services/pdf.service.js";
import { analyzeResumeWithGemini } from "../services/ai.service.js";
import { createApiResponse } from "../utils/apiResponse.js";
import Analysis from "../models/analysis.model.js";

const analyzeResumeHandler = async (req, res, next) => {
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

    if (!req.user?.userId) {
      const error = new Error("Authentication required.");
      error.statusCode = 401;
      throw error;
    }

    const resumeText = await extractTextFromPdfBuffer(file.buffer);
    const analysis = await analyzeResumeWithGemini(resumeText, jobDescription);

    const savedAnalysis = await Analysis.create({
      userId: req.user.userId,
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
    next(error);
  }
};

export { analyzeResumeHandler };
export default analyzeResumeHandler;
