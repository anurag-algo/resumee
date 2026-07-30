import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn(
    "GEMINI_API_KEY is not set. Gemini client will be initialized without an API key.",
  );
}

const gemini = new GoogleGenAI({ apiKey });

export { gemini };
export default gemini;
