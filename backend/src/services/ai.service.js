import { gemini } from "../config/gemini.js";

const analyzeResumeWithGemini = async (resumeText, jobDescription) => {
  if (!resumeText?.trim()) {
    throw new Error("Resume text is required.");
  }

  if (!jobDescription?.trim()) {
    throw new Error("Job description is required.");
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

  const response = await gemini.models.generateContent({
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

  console.log(response)

  const rawText = response?.text ?? "";

  if (!rawText.trim()) {
    throw new Error("Gemini returned an empty response.");
  }

  try {
    return JSON.parse(rawText);
  } catch (error) {
    throw new Error("Failed to parse Gemini response as JSON.");
  }
};

export { analyzeResumeWithGemini };
export default analyzeResumeWithGemini;
