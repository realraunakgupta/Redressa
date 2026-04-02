/**
 * Groq AI Provider Adapter (OpenAI-compatible)
 *
 * Wraps the Groq API behind a clean interface using native fetch.
 * This completely avoids external SDK dependencies while locking
 * into reliable JSON reasoning via Llama 3 models.
 */

interface GroqVisionContentPart {
  type: "text" | "image_url";
  text?: string;
  image_url?: {
    url: string;
  };
}

interface GroqMessage {
  role: "system" | "user" | "assistant";
  content: string | GroqVisionContentPart[];
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

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

async function groqFetch(payload: Record<string, unknown>, maxRetries = 3) {
  const apiKey = getApiKey();
  let attempt = 0;

  while (attempt <= maxRetries) {
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
      
      // Auto-Retry on Rate Limit (429)
      if (response.status === 429 && attempt < maxRetries) {
        // Try to extract exact wait time "Please try again in 2.29s"
        const match = errorText.match(/in ([\d.]+)s/);
        let waitMs = 4000;
        if (match && match[1]) {
          waitMs = parseFloat(match[1]) * 1000 + 500;
        }

        // If wait time is completely absurd (over 20s), fallback immediately
        if (waitMs > 20000) {
          console.warn(`[Redressa] Groq wait time too long (${waitMs}ms). Trying fallback...`);
        } else {
          console.warn(`[Redressa] Groq rate limit reached! Auto-retrying safely in ${Math.round(waitMs)}ms (Attempt ${attempt + 1}/${maxRetries})...`);
          await delay(waitMs);
          attempt++;
          continue;
        }
      }

      // Automatically fallback to Google Gemini if available
      // This catches "request too large" (413), "limit reached", or exhausted retries
      const geminiKey = process.env.GEMINI_API_KEY;
      if (geminiKey && (response.status === 413 || response.status === 429 || errorText.toLowerCase().includes("too large") || errorText.toLowerCase().includes("limit reached"))) {
         console.warn(`[Redressa] Groq rejected payload (Too Large / Hard Limit). Instantly falling back to Google Gemini 2.5 Flash!`);
         
         // Clone payload and swap to Gemini model
         const geminiPayload = { ...payload, model: "gemini-2.5-flash" };
         
         const geminiResp = await fetch("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", {
            method: "POST",
            headers: {
               "Authorization": `Bearer ${geminiKey}`,
               "Content-Type": "application/json"
            },
            body: JSON.stringify(geminiPayload)
         });

         if (geminiResp.ok) {
            const gData = await geminiResp.json();
            return gData.choices?.[0]?.message?.content || "";
         } else {
            errorText = `Groq failed, and Gemini Fallback also failed: ${await geminiResp.text()}`;
         }
      } else if (!geminiKey && (response.status === 413 || response.status === 429 || errorText.toLowerCase().includes("too large") || errorText.toLowerCase().includes("limit reached"))) {
         console.warn("[Redressa] Groq rate limit hit, but NO Gemini fallback available (GEMINI_API_KEY is missing from environment variables).");
      }

      // If not 429 or out of retries, parse hard error
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

  throw new Error(`[Groq Error]: Max retries exhausted without resolution.`);
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

/**
 * Extract text from images using Llama 3 Vision.
 */
export async function generateVision(options: {
  prompt: string;
  base64Image: string;
  mimeType: string;
}): Promise<string> {
  const text = await groqFetch({
    model: "llama-3.2-90b-vision-preview",
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: options.prompt },
          { type: "image_url", image_url: { url: `data:${options.mimeType};base64,${options.base64Image}` } }
        ]
      }
    ],
    temperature: 0.2, // Low temperature for extraction accuracy
    max_completion_tokens: 1024,
  });

  return text;
}
