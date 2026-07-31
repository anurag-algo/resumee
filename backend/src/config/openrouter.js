// src/config/openrouter.js
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config(); // Must run before reading process.env

export const openrouter = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY || "dummy-key-fallback",
  defaultHeaders: {
    "HTTP-Referer": "http://localhost:3000",
    "X-Title": "AI Resume Analyzer",
  },
});