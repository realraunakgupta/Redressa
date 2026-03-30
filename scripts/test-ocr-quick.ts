import { extractDocumentText } from "../lib/document/client";

async function run() {
  process.env.OCR_SPACE_API_KEY = "K84568019688957"; // fallback or from env
  
  // 1x1 png base64
  const base64Data = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
  const mimeType = "image/png";

  try {
    const text = await extractDocumentText({ base64Data, mimeType });
    console.log("OCR Result:", text);
  } catch (err) {
    console.error("OCR Error:", err);
  }
}

run();
