/**
 * Gemini AI Provider Adapter
 *
 * Wraps the Gemini API behind a clean interface so the rest of the
 * codebase never imports Google SDK directly.
 *
 * Will be implemented when the Gemini SDK is installed.
 */

export function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "[Redressa] Missing GEMINI_API_KEY. " +
        "Copy .env.example to .env.local and fill in your Gemini API key."
    );
  }

  // TODO: Replace with actual GoogleGenerativeAI client after installing @google/generative-ai
  throw new Error(
    "[Redressa] Gemini client not yet installed. Run: npm install @google/generative-ai"
  );
}

/**
 * Placeholder for structured text generation.
 * Will be the main entry point for pipeline steps that need LLM reasoning.
 */
export async function generateStructuredResponse(
  _prompt: string,
  _systemInstruction?: string
): Promise<string> {
  throw new Error("[Redressa] Gemini adapter not yet implemented.");
}
