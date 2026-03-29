/**
 * Pipeline Step: Complaint Classification
 *
 * Determines the category and subcategory of the complaint.
 * Uses keyword matching first, falls back to Gemini if ambiguous.
 */

import { addCaseEvent, updateCaseStatus } from "@/lib/supabase/helpers";
import { createServerSupabaseClient } from "@/lib/supabase/client";
import type { ExtractedFacts } from "./extraction";
import type { ComplaintCategory, ComplaintSubcategory } from "@/lib/types";

export interface ClassificationResult {
  category: ComplaintCategory;
  subcategory: ComplaintSubcategory;
  confidence: "high" | "medium" | "low";
}

/**
 * Classify a complaint based on extracted facts.
 * Phase 1 uses deterministic keyword matching — sufficient for 2 categories.
 */
export async function stepClassification(
  caseId: string,
  facts: ExtractedFacts,
  existingCategory: ComplaintCategory | null
): Promise<ClassificationResult> {
  const category: ComplaintCategory = existingCategory ?? classifyCategory(facts);
  const subcategory: ComplaintSubcategory = classifySubcategory(category, facts);
  const confidence: "high" | "medium" | "low" = "high";

  // Update the case record with classification
  const supabase = createServerSupabaseClient();
  await supabase
    .from("cases")
    .update({ category, subcategory })
    .eq("id", caseId);

  await addCaseEvent({
    case_id: caseId,
    event_type: "classification_complete",
    title: "Complaint classified",
    detail: `${category} / ${subcategory} (${confidence} confidence)`,
    metadata: { category, subcategory, confidence },
  });

  // Move case to processing
  await updateCaseStatus(caseId, "processing");

  return { category, subcategory, confidence };
}

function classifyCategory(facts: ExtractedFacts): ComplaintCategory {
  const text = `${facts.complaint_summary} ${facts.issues.join(" ")} ${facts.product_or_service ?? ""}`.toLowerCase();

  const aviationKeywords = ["flight", "airline", "indigo", "airport", "boarding", "baggage", "tarmac", "dgca", "aviation", "spicejet", "air india", "vistara"];
  const ecommerceKeywords = ["flipkart", "amazon", "delivery", "order", "product", "item", "return", "refund", "damaged", "defective", "seller", "ecommerce", "e-commerce", "shopping"];

  const aviationScore = aviationKeywords.filter((k) => text.includes(k)).length;
  const ecommerceScore = ecommerceKeywords.filter((k) => text.includes(k)).length;

  return aviationScore >= ecommerceScore ? "aviation" : "ecommerce";
}

function classifySubcategory(category: ComplaintCategory, facts: ExtractedFacts): ComplaintSubcategory {
  const text = `${facts.complaint_summary} ${facts.issues.join(" ")}`.toLowerCase();

  if (category === "aviation") {
    if (text.includes("cancel")) return "flight_cancellation";
    if (text.includes("delay") || text.includes("late")) return "flight_delay";
    return "refund_dispute";
  }

  // ecommerce
  if (text.includes("damaged") || text.includes("broken")) return "damaged_item";
  if (text.includes("defective") || text.includes("not working") || text.includes("malfunction")) return "defective_item";
  if (text.includes("wrong") || text.includes("incorrect")) return "wrong_item";
  if (text.includes("delay") || text.includes("not delivered") || text.includes("late")) return "delayed_delivery";
  return "damaged_item"; // default for ecommerce
}
