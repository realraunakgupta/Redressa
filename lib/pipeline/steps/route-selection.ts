/**
 * Pipeline Step: Escalation Route Recommendation
 *
 * Recommends escalation paths based on evaluation results and category.
 * Deterministic — uses a curated escalation map, not LLM.
 */

import { addCaseEvent } from "@/lib/supabase/helpers";
import type { EscalationRoute, ComplaintCategory } from "@/lib/types";
import type { EvaluationResult } from "./evaluation";

// Curated escalation routes for Phase 1 categories
const AVIATION_ROUTES: EscalationRoute[] = [
  {
    target: "grievance_cell",
    target_name: "IndiGo Grievance Cell",
    contact_info: "customer.relations@goindigo.in",
    rationale: "First point of escalation. Airline must acknowledge within 7 days and resolve within 30 days.",
    priority: 1,
    legal_weight: "low",
    estimated_timeframe: "30 days",
  },
  {
    target: "nodal_officer",
    target_name: "IndiGo Nodal Officer",
    contact_info: "nodal.officer@goindigo.in",
    rationale: "If grievance cell does not resolve within 30 days, escalate to the nodal officer.",
    priority: 2,
    legal_weight: "medium",
    estimated_timeframe: "30 days",
  },
  {
    target: "regulator",
    target_name: "DGCA AirSewa Portal",
    contact_info: "https://airsewa.gov.in | passenger-grievance@dgca.nic.in",
    rationale: "If the airline does not resolve within 30 days, file with DGCA passenger grievance authority.",
    priority: 3,
    legal_weight: "high",
    estimated_timeframe: "45-60 days",
  },
  {
    target: "consumer_forum",
    target_name: "Consumer Disputes Redressal Forum",
    contact_info: "https://consumerhelpline.gov.in | 1800-11-4000",
    rationale: "File a formal complaint under the Consumer Protection Act, 2019 if regulatory escalation is insufficient.",
    priority: 4,
    legal_weight: "high",
    estimated_timeframe: "3-6 months",
  },
];

const ECOMMERCE_ROUTES: EscalationRoute[] = [
  {
    target: "grievance_cell",
    target_name: "Flipkart Customer Support",
    contact_info: "In-app chat | cs@flipkart.com | 1800-202-9898",
    rationale: "First point of contact. Request a ticket number for tracking.",
    priority: 1,
    legal_weight: "low",
    estimated_timeframe: "3-7 days",
  },
  {
    target: "nodal_officer",
    target_name: "Flipkart Grievance Officer",
    contact_info: "grievance.officer@flipkart.com",
    rationale: "If customer support does not resolve, escalate to the designated grievance officer.",
    priority: 2,
    legal_weight: "medium",
    estimated_timeframe: "15-30 days",
  },
  {
    target: "consumer_forum",
    target_name: "National Consumer Helpline",
    contact_info: "https://consumerhelpline.gov.in | 1800-11-4000",
    rationale: "File a complaint on the National Consumer Helpline portal for mediation.",
    priority: 3,
    legal_weight: "high",
    estimated_timeframe: "30-60 days",
  },
  {
    target: "consumer_forum",
    target_name: "Consumer Disputes Redressal Forum",
    contact_info: "https://edaakhil.nic.in",
    rationale: "File a formal case under the Consumer Protection Act, 2019 for legal redressal.",
    priority: 4,
    legal_weight: "high",
    estimated_timeframe: "3-6 months",
  },
];

export async function stepRouteSelection(
  caseId: string,
  category: ComplaintCategory,
  evaluation: EvaluationResult
): Promise<EscalationRoute[]> {
  const baseRoutes = category === "aviation" ? AVIATION_ROUTES : ECOMMERCE_ROUTES;

  let routes: EscalationRoute[] = [];
  
  // Core structural signals representing escalating legal strength
  const hasRegViolations = evaluation.regulatory_violations && evaluation.regulatory_violations.length > 0;
  const hasRightsViolations = evaluation.consumer_rights_violated && evaluation.consumer_rights_violated.length > 0;
  const hasUnmetObligations = evaluation.merchant_obligations_unmet && evaluation.merchant_obligations_unmet.length > 0;
  const hasWeakAssessment = evaluation.overall_assessment === "weak";

  // Tier 1: Highest Legal Severity (Regulatory Violations OR Direct Consumer Rights Abuses)
  // Regulator and Consumer Forum paths become valid
  if ((hasRegViolations || hasRightsViolations) && !hasWeakAssessment) {
    routes = baseRoutes; // Show the full escalation path including regulators/courts
  } 
  // Tier 2: Moderate Legal Severity (Contractual/Merchant Obligations Unmet)
  // Nodal Officer / Grievance Officer paths become valid
  else if (hasUnmetObligations || evaluation.overall_assessment === "moderate") {
    routes = baseRoutes.filter((r) => r.priority <= 2);
  } 
  // Tier 3: Low/Undefined Severity (Service complaints with no proven violations)
  // Only frontline Grievance Cell path is valid
  else {
    routes = baseRoutes.filter((r) => r.priority <= 1);
  }

  await addCaseEvent({
    case_id: caseId,
    event_type: "route_recommended",
    title: "Escalation routes recommended",
    detail: `${routes.length} route(s) suggested (assessment: ${evaluation.overall_assessment})`,
    metadata: {
      route_count: routes.length,
      targets: routes.map((r) => r.target),
      routes,
    },
  });

  return routes;
}
