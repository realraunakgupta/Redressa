/**
 * POST /api/pipeline/run
 *
 * Triggers the full Redressa pipeline for a new complaint.
 *
 * Body:
 * {
 *   "description": "My flight was cancelled...",
 *   "category": "aviation" | "ecommerce" (optional),
 *   "merchant_name": "IndiGo" (optional),
 *   "order_reference": "ABC123" (optional),
 *   "amount": 5000 (optional),
 *   "is_demo": false (optional),
 *   "files": [{ "name": "email.pdf", "type": "application/pdf", "size": 1024, "storage_path": "uploads/xyz.png" }] (optional)
 * }
 *
 * Returns: { caseId: string }
 */

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createSupabaseServerAuthClient } from "@/lib/supabase/auth";
import { runPipelineFromIntake } from "@/lib/pipeline";

export const maxDuration = 60;

type IntakeCategory = "aviation" | "ecommerce";

interface RunPipelineBody {
  description: string;
  category: IntakeCategory | null;
  merchant_name: string | null;
  order_reference: string | null;
  amount: number | null;
  is_demo: boolean;
  consumer_name: string | null;
  consumer_email: string | null;
  consumer_phone: string | null;
  files: { name: string; type: string; size: number; storage_path: string }[];
}

function validateRunPipelineBody(body: unknown):
  | { success: true; data: RunPipelineBody }
  | { success: false; error: string } {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { success: false, error: "Request body must be a JSON object" };
  }

  const payload = body as Record<string, unknown>;

  if (
    typeof payload.description !== "string" ||
    payload.description.trim().length === 0
  ) {
    return { success: false, error: "Missing or invalid 'description' field" };
  }

  const category =
    payload.category === undefined || payload.category === null
      ? null
      : payload.category;
  if (category !== null && category !== "aviation" && category !== "ecommerce") {
    return {
      success: false,
      error: "Invalid 'category'. Expected 'aviation', 'ecommerce', or null",
    };
  }

  const merchantName =
    payload.merchant_name === undefined || payload.merchant_name === null
      ? null
      : payload.merchant_name;
  if (merchantName !== null && typeof merchantName !== "string") {
    return { success: false, error: "Invalid 'merchant_name'. Expected string or null" };
  }

  const orderReference =
    payload.order_reference === undefined || payload.order_reference === null
      ? null
      : payload.order_reference;
  if (orderReference !== null && typeof orderReference !== "string") {
    return {
      success: false,
      error: "Invalid 'order_reference'. Expected string or null",
    };
  }

  const amount =
    payload.amount === undefined || payload.amount === null ? null : payload.amount;
  if (amount !== null && (typeof amount !== "number" || !Number.isFinite(amount))) {
    return { success: false, error: "Invalid 'amount'. Expected a finite number or null" };
  }

  const isDemo =
    payload.is_demo === undefined || payload.is_demo === null
      ? false
      : payload.is_demo;
  if (typeof isDemo !== "boolean") {
    return { success: false, error: "Invalid 'is_demo'. Expected boolean" };
  }

  const filesRaw = payload.files;
  const files: { name: string; type: string; size: number; storage_path: string }[] = [];
  if (filesRaw !== undefined && filesRaw !== null) {
    if (!Array.isArray(filesRaw)) {
      return { success: false, error: "Invalid 'files'. Expected an array" };
    }
    for (const f of filesRaw) {
      if (!f || typeof f !== "object") return { success: false, error: "Invalid file entry" };
      const fObj = f as Record<string, unknown>;
      if (typeof fObj.name !== "string" || typeof fObj.type !== "string" || typeof fObj.size !== "number" || typeof fObj.storage_path !== "string") {
        return { success: false, error: "Invalid file signature" };
      }
      files.push({ name: fObj.name, type: fObj.type, size: fObj.size, storage_path: fObj.storage_path });
    }
  }

  const consumer_name = typeof payload.consumer_name === "string" ? payload.consumer_name : null;
  const consumer_email = typeof payload.consumer_email === "string" ? payload.consumer_email : null;
  const consumer_phone = typeof payload.consumer_phone === "string" ? payload.consumer_phone : null;

  return {
    success: true,
    data: {
      description: payload.description.trim(),
      category,
      merchant_name: merchantName,
      order_reference: orderReference,
      amount,
      is_demo: isDemo,
      consumer_name,
      consumer_email,
      consumer_phone,
      files,
    },
  };
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabaseAuth = createSupabaseServerAuthClient(cookieStore);
    const { data: { user } } = await supabaseAuth.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validation = validateRunPipelineBody(body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const caseId = await runPipelineFromIntake({
      ...validation.data,
      user_id: user.id
    });

    return NextResponse.json({ caseId, status: "complete" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[Redressa] Pipeline error:", message);

    if (
      message.includes("429 Too Many Requests") ||
      message.toLowerCase().includes("quota exceeded")
    ) {
      return NextResponse.json(
        {
          error: "AI provider quota exceeded",
          detail:
            "The configured AI provider key has exhausted its current quota. The live pipeline cannot complete until quota is restored or the key is replaced.",
        },
        { status: 503 }
      );
    }

    if (message.includes("ModelNotFound")) {
      return NextResponse.json(
        {
          error: "AI provider model unavailable",
          detail:
            "The configured model is not available for the current API key or SDK path. Switch to a supported model before retrying.",
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: "Pipeline failed", detail: message },
      { status: 500 }
    );
  }
}
