/**
 * Pipeline Step: Complaint Classification
 *
 * Determines the category and subcategory of the complaint.
 * Uses deterministic keyword matching for the current baseline.
 */

import { addCaseEvent, updateCaseStatus } from "@/lib/supabase/helpers";
import { createServerSupabaseClient } from "@/lib/supabase/client";
import type { ExtractedFacts } from "./extraction";
import type { ComplaintCategory, ComplaintSubcategory } from "@/lib/types";

export interface ClassificationResult {
  category: ComplaintCategory;
  subcategory: ComplaintSubcategory;
  confidence: "high" | "medium" | "low";
  fallback_used?: boolean;
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
  const classification = existingCategory
    ? { category: existingCategory, fallbackUsed: false }
    : await classifyCategorySafely(facts);
  const category: ComplaintCategory = classification.category;
  const subcategory: ComplaintSubcategory = classifySubcategory(category, facts);
  const confidence: "high" | "medium" | "low" = existingCategory
    ? "high"
    : classification.fallbackUsed
      ? "low"
      : "medium";

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
    metadata: {
      category,
      subcategory,
      confidence,
      fallback_used: classification.fallbackUsed,
    },
  });

  // Move case to processing
  await updateCaseStatus(caseId, "processing");

  return { category, subcategory, confidence, fallback_used: classification.fallbackUsed };
}

import { generateJSON } from "@/lib/groq/client";

async function classifyCategorySafely(
  facts: ExtractedFacts
): Promise<{ category: ComplaintCategory; fallbackUsed: boolean }> {
  const text = `${facts.complaint_summary} ${facts.issues.join(" ")} ${facts.product_or_service ?? ""}`.toLowerCase();

  const aviationKeywords = ["flight", "airline", "indigo", "airport", "boarding", "baggage", "tarmac", "dgca", "aviation", "spicejet", "air india", "vistara", "ticket", "pilot", "pnr"];
  const ecommerceKeywords = ["flipkart", "amazon", "delivery", "order", "product", "item", "return", "refund", "damaged", "defective", "seller", "ecommerce", "e-commerce", "shopping", "cart", "courier", "myntra", "flipkart"];

  const aviationScore = aviationKeywords.filter((k) => text.includes(k)).length;
  const ecommerceScore = ecommerceKeywords.filter((k) => text.includes(k)).length;

  if (aviationScore > ecommerceScore) return { category: "aviation", fallbackUsed: false };
  if (ecommerceScore > aviationScore) return { category: "ecommerce", fallbackUsed: false };
  
  // Ambiguity Fallback: Scores are tied or 0. Use LLM safely.
  try {
    const result = await generateJSON<{ category: "aviation" | "ecommerce" }>({
      prompt: `Classify this complaint as either 'aviation' or 'ecommerce'.\n\nCOMPLAINT: ${facts.complaint_summary}\nISSUES: ${facts.issues.join(", ")}`,
      systemInstruction: "You are a routing agent. Respond ONLY with valid JSON containing a single 'category' key matching either 'aviation' or 'ecommerce'.",
    });
    return {
      category: result.category === "aviation" ? "aviation" : "ecommerce",
      fallbackUsed: true,
    };
  } catch {
    // If the provider fails, default conservatively and record that fallback was attempted.
    return { category: "ecommerce", fallbackUsed: true };
  }
}

function classifySubcategory(category: ComplaintCategory, facts: ExtractedFacts): ComplaintSubcategory {
  const text = `${facts.complaint_summary} ${facts.issues.join(" ")}`.toLowerCase();

  // Tier 1: Explicit Subcategory Deterministic Rules 
  if (category === "aviation") {
    if (text.includes("cancel") || text.includes("aborted") || text.includes("rebooked")) return "flight_cancellation";
    if (text.includes("delay") || text.includes("late") || text.includes("postpone") || text.includes("rescheduled") || text.includes("tarmac")) return "flight_delay";
    if (text.includes("refund") || text.includes("money back")) return "refund_dispute";
    return "refund_dispute"; // Safe Aviation Fallback
  }

  // Tier 2: E-Commerce Explicit Matching
  if (text.includes("damaged") || text.includes("broken") || text.includes("cracked") || text.includes("torn")) return "damaged_item";
  if (text.includes("defective") || text.includes("not working") || text.includes("malfunction") || text.includes("faulty") || text.includes("dead")) return "defective_item";
  if (text.includes("wrong") || text.includes("incorrect") || text.includes("different") || text.includes("fake") || text.includes("counterfeit")) return "wrong_item";
  if (text.includes("delay") || text.includes("not delivered") || text.includes("late") || text.includes("stuck") || text.includes("missing") || text.includes("lost")) return "delayed_delivery";
  
  // Tier 3: Contextual Inference (Smart Defaulting)
  // If the complaint mentions a refund but no specific issue was hit, assume damaged/wrong item.
  if (text.includes("refund") || text.includes("return")) return "defective_item";
  
  // Final Catch-All E-commerce Default
  return "damaged_item"; 
}
