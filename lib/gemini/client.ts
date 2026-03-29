/**
 * Gemini AI Provider Adapter
 *
 * Wraps the Gemini API behind a clean interface so the rest of the
 * codebase never imports Google SDK directly.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

let genAI: GoogleGenerativeAI | null = null;

function getClient(): GoogleGenerativeAI {
  if (genAI) return genAI;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "[Redressa] Missing GEMINI_API_KEY. " +
        "Copy .env.example to .env.local and fill in your Gemini API key."
    );
  }

  genAI = new GoogleGenerativeAI(apiKey);
  return genAI;
}

/**
 * Generate text using Gemini with a system instruction.
 * Used by pipeline steps that need LLM reasoning.
 */
export async function generateText(options: {
  prompt: string;
  systemInstruction?: string;
  temperature?: number;
  maxTokens?: number;
}): Promise<string> {
  const client = getClient();
  const model = client.getGenerativeModel({
    model: "gemini-2.0-flash",
    systemInstruction: options.systemInstruction,
    generationConfig: {
      temperature: options.temperature ?? 0.3,
      maxOutputTokens: options.maxTokens ?? 4096,
    },
  });

  const result = await model.generateContent(options.prompt);
  const text = result.response.text();
  return text;
}

/**
 * Generate a structured JSON response from Gemini.
 * Parses the response and returns the parsed object.
 * Falls back to raw text if JSON parsing fails.
 */
export async function generateJSON<T = Record<string, unknown>>(options: {
  prompt: string;
  systemInstruction?: string;
  temperature?: number;
}): Promise<T> {
  const client = getClient();
  const model = client.getGenerativeModel({
    model: "gemini-2.0-flash",
    systemInstruction: options.systemInstruction,
    generationConfig: {
      temperature: options.temperature ?? 0.1,
      maxOutputTokens: 4096,
      responseMimeType: "application/json",
    },
  });

  const result = await model.generateContent(options.prompt);
  const text = result.response.text();

  try {
    return JSON.parse(text) as T;
  } catch (error) {
    // Try extracting JSON from markdown code blocks
    const jsonMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[1]) as T;
      } catch (innerError) {
        throw new Error(
          `[Redressa] Failed to parse extracted Gemini JSON format. Text: ${text.slice(0, 200)} | Inner Error: ${innerError instanceof Error ? innerError.message : String(innerError)}`
        );
      }
    }
    throw new Error(`[Redressa] Failed to parse Gemini JSON response: ${text.slice(0, 200)}`);
  }
}
