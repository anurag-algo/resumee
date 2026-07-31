import NodeCache from "node-cache";
import crypto from "crypto";
import { openrouter } from "../config/openrouter.js";

// Initialize cache with a 24-hour time-to-live (86400 seconds)
const cache = new NodeCache({ stdTTL: 86400 });

/**
 * Generates a unique MD5 hash for the given resume and job description pair.
 */
const generateCacheKey = (resumeText, jobDescription) => {
  const normalizedInput = `${resumeText.trim().toLowerCase()}_${jobDescription.trim().toLowerCase()}`;
  return crypto.createHash("md5").update(normalizedInput).digest("hex");
};

/**
 * Utility: Pauses execution for given milliseconds
 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Helper function to call an async operation with exponential backoff retry logic.
 */
const callWithRetry = async (fn, retries = 3, delay = 2000) => {
  try {
    return await fn();
  } catch (error) {
    const isRateLimited =
      error?.status === 429 ||
      error?.statusCode === 429 ||
      error?.message?.includes("429");

    if (retries > 0 && isRateLimited) {
      console.warn(
        `⚠️ Rate limit hit (429). Retrying in ${delay / 1000}s... (${retries} retries remaining)`
      );
      await sleep(delay);
      // Double the delay for the next attempt (exponential backoff: 2s -> 4s -> 8s)
      return callWithRetry(fn, retries - 1, delay * 2);
    }

    throw error;
  }
};

const analyzeResumeWithGemini = async (resumeText, jobDescription) => {
  if (!resumeText?.trim()) {
    throw new Error("Resume text is required.");
  }

  if (!jobDescription?.trim()) {
    throw new Error("Job description is required.");
  }

  // 1. Check Memory Cache first
  const cacheKey = generateCacheKey(resumeText, jobDescription);
  if (cache.has(cacheKey)) {
    console.log("⚡ Serving analysis result directly from Memory Cache (0 API calls used)");
    return cache.get(cacheKey);
  }

  const systemPrompt = `You are an expert ATS and recruiting analyst. Analyze the resume against the job description and return strict JSON only.

Required output schema:
{
  "atsScore": 0,
  "matchSummary": "",
  "matchingSkills": [],
  "missingKeywords": [],
  "strengths": [],
  "areasOfImprovement": [
    {
      "category": "",
      "issue": "",
      "suggestedFix": ""
    }
  ]
}

Rules:
- atsScore must be an integer from 0 to 100.
- matchingSkills and missingKeywords must be arrays of strings.
- strengths must be an array of strings.
- areasOfImprovement must be an array of objects with category, issue, and suggestedFix strings.
- Respond ONLY with valid raw JSON without markdown formatting or backticks.`;

  // 2. Define execution call for OpenRouter
  const executeOpenRouterCall = async () => {
    return await openrouter.chat.completions.create({
      model: "openrouter/free",
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Resume:\n${resumeText}\n\nJob Description:\n${jobDescription}`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
    });
  };

  try {
    // 3. Execute with up to 3 retries starting at 2-second delay
    const response = await callWithRetry(executeOpenRouterCall, 3, 2000);
    const rawText = response.choices[0]?.message?.content ?? "";

    if (!rawText.trim()) {
      throw new Error("OpenRouter returned an empty response.");
    }

    // Clean potential markdown backticks just in case
    const cleanedText = rawText.replace(/```json/gi, "").replace(/```/g, "").trim();
    const parsedData = JSON.parse(cleanedText);

    // 4. Save result to Memory Cache
    cache.set(cacheKey, parsedData);
    console.log("💾 Saved new analysis result to Memory Cache");

    return parsedData;

  } catch (error) {
    console.error("OpenRouter API Error:", error);

    if (error?.status === 429 || error?.message?.includes("429")) {
      throw new Error("API rate limit reached after multiple attempts. Please try again in a moment.");
    }

    throw new Error(error.message || "Failed to analyze resume with AI.");
  }
};

export { analyzeResumeWithGemini };
export default analyzeResumeWithGemini;