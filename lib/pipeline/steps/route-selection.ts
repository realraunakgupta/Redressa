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
  },
  {
    target: "nodal_officer",
    target_name: "IndiGo Nodal Officer",
    contact_info: "nodal.officer@goindigo.in",
    rationale: "If grievance cell does not resolve within 30 days, escalate to the nodal officer.",
    priority: 2,
  },
  {
    target: "regulator",
    target_name: "DGCA AirSewa Portal",
    contact_info: "https://airsewa.gov.in | passenger-grievance@dgca.nic.in",
    rationale: "If the airline does not resolve within 30 days, file with DGCA passenger grievance authority.",
    priority: 3,
  },
  {
    target: "consumer_forum",
    target_name: "Consumer Disputes Redressal Forum",
    contact_info: "https://consumerhelpline.gov.in | 1800-11-4000",
    rationale: "File a formal complaint under the Consumer Protection Act, 2019 if regulatory escalation is insufficient.",
    priority: 4,
  },
];

const ECOMMERCE_ROUTES: EscalationRoute[] = [
  {
    target: "grievance_cell",
    target_name: "Flipkart Customer Support",
    contact_info: "In-app chat | cs@flipkart.com | 1800-202-9898",
    rationale: "First point of contact. Request a ticket number for tracking.",
    priority: 1,
  },
  {
    target: "nodal_officer",
    target_name: "Flipkart Grievance Officer",
    contact_info: "grievance.officer@flipkart.com",
    rationale: "If customer support does not resolve, escalate to the designated grievance officer.",
    priority: 2,
  },
  {
    target: "consumer_forum",
    target_name: "National Consumer Helpline",
    contact_info: "https://consumerhelpline.gov.in | 1800-11-4000",
    rationale: "File a complaint on the National Consumer Helpline portal for mediation.",
    priority: 3,
  },
  {
    target: "consumer_forum",
    target_name: "Consumer Disputes Redressal Forum",
    contact_info: "https://edaakhil.nic.in",
    rationale: "File a formal case under the Consumer Protection Act, 2019 for legal redressal.",
    priority: 4,
  },
];

export async function stepRouteSelection(
  caseId: string,
  category: ComplaintCategory,
  evaluation: EvaluationResult
): Promise<EscalationRoute[]> {
  const baseRoutes = category === "aviation" ? AVIATION_ROUTES : ECOMMERCE_ROUTES;

  // Filter routes based on severity
  let routes: EscalationRoute[];
  if (evaluation.overall_assessment === "strong") {
    // Strong case: include all routes including legal
    routes = baseRoutes;
  } else if (evaluation.overall_assessment === "moderate") {
    // Moderate: skip legal forums initially
    routes = baseRoutes.filter((r) => r.priority <= 3);
  } else {
    // Weak: start with basic grievance only
    routes = baseRoutes.filter((r) => r.priority <= 2);
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
