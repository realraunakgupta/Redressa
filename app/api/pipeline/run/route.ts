/**
 * POST /api/pipeline/run
 *
 * Triggers the full Redressa AI pipeline for a new complaint.
 *
 * Body:
 * {
 *   "description": "My flight was cancelled...",
 *   "category": "aviation" | "ecommerce" (optional),
 *   "merchant_name": "IndiGo" (optional),
 *   "order_reference": "ABC123" (optional),
 *   "amount": 5000 (optional),
 *   "is_demo": false (optional),
 *   "files": [{ "name": "email.pdf", "type": "application/pdf", "size": 1024 }] (optional)
 * }
 *
 * Returns: { caseId: string }
 */

import { NextRequest, NextResponse } from "next/server";
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
  files: { name: string; type: string; size: number }[];
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
  const files: { name: string; type: string; size: number }[] = [];
  if (filesRaw !== undefined && filesRaw !== null) {
    if (!Array.isArray(filesRaw)) {
      return { success: false, error: "Invalid 'files'. Expected an array" };
    }
    for (const f of filesRaw) {
      if (!f || typeof f !== "object") return { success: false, error: "Invalid file entry" };
      const fObj = f as Record<string, unknown>;
      if (typeof fObj.name !== "string" || typeof fObj.type !== "string" || typeof fObj.size !== "number") {
        return { success: false, error: "Invalid file signature" };
      }
      files.push({ name: fObj.name, type: fObj.type, size: fObj.size });
    }
  }

  return {
    success: true,
    data: {
      description: payload.description.trim(),
      category,
      merchant_name: merchantName,
      order_reference: orderReference,
      amount,
      is_demo: isDemo,
      files,
    },
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = validateRunPipelineBody(body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const caseId = await runPipelineFromIntake({
      ...validation.data,
    });

    return NextResponse.json({ caseId, status: "complete" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[Redressa] Pipeline error:", message);

    return NextResponse.json(
      { error: "Pipeline failed", detail: message },
      { status: 500 }
    );
  }
}
