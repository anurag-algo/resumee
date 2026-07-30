import { extractTextFromPdfBuffer } from "../services/pdf.service.js";
import { analyzeResumeWithGemini } from "../services/ai.service.js";
import { createApiResponse } from "../utils/apiResponse.js";

const analyzeResumeHandler = async (req, res, next) => {
  try {
    const { jobDescription } = req.body;
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

    const resumeText = await extractTextFromPdfBuffer(file.buffer);
    const analysis = await analyzeResumeWithGemini(resumeText, jobDescription);

    res.status(200).json(
      createApiResponse({
        statusCode: 200,
        message: "Resume analysis completed successfully.",
        data: analysis,
      }),
    );
  } catch (error) {
    next(error);
  }
};

export { analyzeResumeHandler };
export default analyzeResumeHandler;
