import NodeCache from 'node-cache';
import crypto from 'crypto';

import { gemini } from "../config/gemini.js";

//initializing cache with 24 hour TTL  
const cache = new NodeCache({ stdTTL: 60 * 60 * 24, checkperiod: 120 });

//Generate a unique MD5 hash for the given resume and job description pair
const generateCacheKey = (resumeText, jobDescription) => {
  const normalizedInput = `${resumeText.trim().toLowerCase()}_${jobDescription.trim().toLowerCase()}`;
  return crypto.createHash("md5").update(normalizedInput).digest("hex");
};

//Utility: Pause execution for given milliseconds
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

//Helper funnction to call an async operation with exponential backoff retry logic..
const callWithRetry = async (fn, retries = 3, delay = 2000) => {
  try {
    return await fn();
  } catch (error) {
    const isRateLimmited = error?.status === 429 || error?.statusCode === 429 || error?.message?.includes("429") || error?.message?.includes("RESOURCE_EXHAUSTED");

    if (retries > 0 && isTateLimited) {
      console.error(`⚠️ Rate limit hit (429). Retrying in ${delay / 1000}s... (${retries} retries remaining)`);
      await sleep(delay);
      //Double the delay for the next attempt (exponential backoff)
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

  //Check if the analysis already exists in the cache
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
- Do not include markdown, commentary, or extra keys.`;


  //wrap gemini API cal with Exponential Backoff Retry
  const executeGeminiCall = async () => {
    //call gemini API if not found in cache
    return await gemini.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Resume:\n${resumeText}\n\nJob Description:\n${jobDescription}`,
            },
          ],
        },
      ],
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
      },
    });

    try {
      //Attempt execution with up to 3 retries starting at a 2-second delay
      const response = await callWithRetry(executeGeminiCall, 3, 2000);
      const rawText = response?.text ?? "";
      if (!rawText.trim()) {
        throw new Error("Gemini returned an empty response.");
      }
      console.log("Response from Gemini:", response);

      const parsedData = JSON.parse(rawText);

      //Store parsed result in cache before returning
      cache.set(cacheKey, parsedData);
      console.log("✅ Analysis result cached for future use");
      return parsedData;
    } catch (error) {
      if (error?.status === 429 || error?.message?.includes("429")) {
        throw new Error("Gemini API rate limit reached after multiple attempts. Please try again in 1 minute.");
      }
      throw error;
    }
  };
}

export { analyzeResumeWithGemini };
export default analyzeResumeWithGemini;
