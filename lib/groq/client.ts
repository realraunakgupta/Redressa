/**
 * Groq AI Provider Adapter (OpenAI-compatible)
 *
 * Wraps the Groq API behind a clean interface using native fetch.
 * This completely avoids external SDK dependencies while locking
 * into reliable JSON reasoning via Llama 3 models.
 */

interface GroqMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

function getApiKey(): string {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error(
      "[Redressa] Missing GROQ_API_KEY. " +
        "Copy .env.example to .env.local and fill in your Groq API key."
    );
  }
  return apiKey;
}

async function groqFetch(payload: Record<string, unknown>) {
  const apiKey = getApiKey();
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let errorText = await response.text();
    try {
      const parsed = JSON.parse(errorText);
      if (parsed.error && parsed.error.message) {
        errorText = parsed.error.message;
      }
    } catch {
      // Keep raw fallback
    }
    throw new Error(`[Groq Error]: ${errorText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}

/**
 * Generate text using Groq with a system instruction.
 */
export async function generateText(options: {
  prompt: string;
  systemInstruction?: string;
  temperature?: number;
  maxTokens?: number;
}): Promise<string> {
  const messages: GroqMessage[] = [];
  
  if (options.systemInstruction) {
    messages.push({ role: "system", content: options.systemInstruction });
  }
  messages.push({ role: "user", content: options.prompt });

  const text = await groqFetch({
    model: "llama-3.3-70b-versatile",
    messages,
    temperature: options.temperature ?? 0.3,
    max_completion_tokens: options.maxTokens ?? 4096,
  });

  return text;
}

/**
 * Generate a structured JSON response from Groq.
 * Uses Groq's native 'json_object' format constraint but retains
 * defense-in-depth parsing for maximum reliability.
 */
export async function generateJSON<T = Record<string, unknown>>(options: {
  prompt: string;
  systemInstruction?: string;
  temperature?: number;
}): Promise<T> {
  const messages: GroqMessage[] = [];
  
  if (options.systemInstruction) {
    messages.push({ role: "system", content: options.systemInstruction });
  }
  messages.push({ role: "user", content: options.prompt });

  const text = await groqFetch({
    model: "llama-3.3-70b-versatile",
    messages,
    temperature: options.temperature ?? 0.1,
    max_completion_tokens: 4096,
    response_format: { type: "json_object" },
  });

  try {
    return JSON.parse(text) as T;
  } catch {
    // Defense-in-depth: Try extracting JSON from markdown code blocks
    const jsonMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[1]) as T;
      } catch (innerError) {
        throw new Error(
          `[Redressa] Failed to parse extracted Groq JSON format. Text: ${text.slice(0, 200)} | Error: ${innerError instanceof Error ? innerError.message : String(innerError)}`
        );
      }
    }
    throw new Error(`[Redressa] Failed to parse raw Groq JSON response: ${text.slice(0, 200)}`);
  }
}
