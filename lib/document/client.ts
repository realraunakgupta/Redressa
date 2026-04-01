/**
 * Dedicated Document OCR Adapter (OCR.space)
 *
 * This client strictly handles extracting text from Evidence uploads 
 * (Images, Screenshots, and limited PDFs).
 * 
 * OCR.space Free Tier Constraints:
 * - Max 5MB file sizes.
 * - Extracts only textual layers (Engine 1, default language).
 */

function getApiKey(): string {
  const apiKey = process.env.OCR_SPACE_API_KEY;
  if (!apiKey || apiKey.trim() === "") {
    console.warn(
      "[Redressa] Missing OCR_SPACE_API_KEY in environment. Falling back to public free-tier key 'helloworld'."
    );
    return "helloworld";
  }
  return apiKey;
}

export async function extractDocumentText(options: {
  base64Data: string;
  mimeType: string;
}): Promise<string> {
  const apiKey = getApiKey();
  const url = "https://api.ocr.space/parse/image";

  // OCR.space requires the data URI prefix strictly for base64 uploads
  const dataUri = `data:${options.mimeType};base64,${options.base64Data}`;

  const formData = new FormData();
  formData.append("base64Image", dataUri);
  formData.append("language", "eng");       // Safe default
  formData.append("isOverlayRequired", "false"); 

  const response = await fetch(url, {
    method: "POST",
    headers: {
      apikey: apiKey,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`[OCR.space API Error HTTP ${response.status}]: ${errorText}`);
  }

  const data = await response.json();

  if (data.IsErroredOnProcessing || data.ErrorMessage) {
    const msgs = Array.isArray(data.ErrorMessage) ? data.ErrorMessage.join(", ") : String(data.ErrorMessage);
    throw new Error(`[OCR.space Content Error]: ${msgs}`);
  }

  const parsedResults = data.ParsedResults || [];
  let extractedText = "";

  for (const page of parsedResults) {
    if (page.ParsedText) {
      extractedText += page.ParsedText + "\n";
    }
  }

  extractedText = extractedText.trim();

  if (!extractedText) {
    throw new Error("OCR.space returned an empty string or could not detect any text layers.");
  }

  return extractedText;
}
