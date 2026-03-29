/**
 * Pipeline Step: Complaint Intake
 *
 * Creates the case record and emits the first case event.
 * This is the entry point of the pipeline.
 */

import { createCase, addCaseEvent, addCaseFile } from "@/lib/supabase/helpers";
import type { CaseInsert, CaseRow } from "@/lib/supabase/types";

export interface IntakeInput {
  description: string;
  category?: "aviation" | "ecommerce" | null;
  merchant_name?: string | null;
  order_reference?: string | null;
  amount?: number | null;
  is_demo?: boolean;
  files?: { name: string; type: string; size: number }[];
}

export async function stepIntake(input: IntakeInput): Promise<CaseRow> {
  const caseData: CaseInsert = {
    description: input.description,
    category: input.category ?? null,
    merchant_name: input.merchant_name ?? null,
    order_reference: input.order_reference ?? null,
    amount: input.amount ?? null,
    is_demo: input.is_demo ?? false,
    status: "intake",
  };

  const caseRow = await createCase(caseData);

  await addCaseEvent({
    case_id: caseRow.id,
    event_type: "intake_received",
    title: "Complaint received",
    detail: `Category: ${caseRow.category ?? "pending classification"} | Merchant: ${caseRow.merchant_name ?? "unknown"}`,
  });

  if (input.files && input.files.length > 0) {
    for (const file of input.files) {
      await addCaseFile({
        case_id: caseRow.id,
        file_name: file.name,
        file_type: file.type.includes("pdf") ? "pdf" : file.type.includes("image") ? "image" : "text",
        storage_path: "demo/stub/" + file.name,
        file_url: "stub_file_url",
        mime_type: file.type,
        file_size: file.size,
      });
    }
  }

  return caseRow;
}
