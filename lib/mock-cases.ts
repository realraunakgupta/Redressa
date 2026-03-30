import type { CasePageData } from "./case-data";

export const MOCK_AVIATION_CASE = {
  caseRow: {
    id: "demo-aviation-id-001",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    status: "complete",
    category: "aviation",
    subcategory: "flight_cancellation",
    description: "My flight 6E-401 from Delhi to Mumbai on May 15 was cancelled by IndiGo last minute. We were waiting at the gate and they cancelled it just 2 hours before departure. They promised a full refund instead of rebooking, but it has been over 20 days and I still haven't received my money back. I have called the customer care multiple times and they just say it is still processing. According to their policy I should have received it within 15 days. I want my INR 8500 refunded immediately along with the mandated compensation for the last-minute cancellation.",
    merchant_name: "IndiGo",
    order_reference: "PNR-WXY789",
    amount: 8500.0,
    currency: "INR",
    is_demo: true,
  },
  events: [
    { id: "ev1", case_id: "demo-aviation-id-001", event_type: "intake_received", title: "Complaint received", detail: "Category: aviation | Merchant: IndiGo", metadata: {}, created_at: new Date(Date.now() - 5000).toISOString() },
    { id: "ev2", case_id: "demo-aviation-id-001", event_type: "extraction_complete", title: "Facts extracted", detail: "2 issue(s) identified | 1 evidence type(s) guessed", metadata: {}, created_at: new Date(Date.now() - 4000).toISOString() },
    { id: "ev3", case_id: "demo-aviation-id-001", event_type: "timeline_assembled", title: "Timeline assembled", detail: "3 event(s) in chronological order", metadata: {}, created_at: new Date(Date.now() - 3000).toISOString() },
    { id: "ev4", case_id: "demo-aviation-id-001", event_type: "classification_complete", title: "Complaint classified", detail: "aviation / flight_cancellation (high confidence)", metadata: {}, created_at: new Date(Date.now() - 2500).toISOString() },
    { id: "ev5", case_id: "demo-aviation-id-001", event_type: "policy_retrieved", title: "Policies retrieved", detail: "Found matching policies", metadata: {}, created_at: new Date(Date.now() - 1500).toISOString() },
    { id: "ev6", case_id: "demo-aviation-id-001", event_type: "outputs_generated", title: "Outputs generated", detail: "Generated grievance_email, internal_note, evidence_checklist", metadata: {}, created_at: new Date(Date.now() - 500).toISOString() },
  ],
  outputs: [
    {
      id: "out1",
      case_id: "demo-aviation-id-001",
      output_type: "grievance_email",
      title: "Formal Grievance Email",
      content: "Subject: Urgent: Failure to Refund for Last-Minute Cancellation - PNR-WXY789\n\nDear Nodal Officer, IndiGo,\n\nI am writing to formally escalate the failure of IndiGo to refund INR 8500 for my cancelled flight 6E-401 from Delhi to Mumbai, originally scheduled for May 15. The flight was cancelled less than 2 hours before departure while I was waiting at the boarding gate.\n\nUnder the DGCA CAR Section 3 Series M Part IV, as well as IndiGo's own Conditions of Carriage, I am entitled to a full refund within 15 days if a flight is cancelled and the passenger opts not to travel on a re-booked flight. Over 20 days have passed, and despite multiple calls to your customer service team, the refund is \"still processing.\"\n\nI request an immediate transfer of INR 8500 to my original payment source, along with the specified inconvenience compensation mandated by DGCA for last-minute cancellations without 24-hour notice.\n\nI expect a resolution within 48 hours to avoid escalation to the AirSewa grievance portal.\n\nRegards,\n[Your Name]",
      metadata: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "out2",
      case_id: "demo-aviation-id-001",
      output_type: "escalation_note",
      title: "Legal Escalation Note",
      content: "## Case Brief: IndiGo Last-Minute Cancellation\n\n**Consumer Position:**\n- Flight cancelled exactly 2 hours prior to departure.\n- Airline verbally committed to full refund instead of rerouting.\n- 20+ days elapsed without credit hitting the payment source, violating DGCA 15-day SLAs.\n\n**Legal Standing:**\n- **DGCA CAR Sec 3, Series M, Part IV (3.3):** Mandates full refund + compensation for cancellations notified less than 24 hours prior if passenger declines alternate travel.\n- **Violation:** IndiGo is in clear breach of refund timelines.\n\n**Recommended Escalate Route:**\nAviation Nodal Officer -> AirSewa Portal",
      metadata: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "out3",
      case_id: "demo-aviation-id-001",
      output_type: "evidence_checklist",
      title: "Required Evidence",
      content: "* [x] PNR/Ticket showing confirmed booking (PNR-WXY789)\n* [x] Copy of Indigo's SMS/Email confirming the cancellation of 6E-401\n* [ ] Bank statement confirming the INR 8500 charge remains uncredited\n* [x] Screenshots of Customer Care conversation history (Proof of follow-ups)",
      metadata: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "out4",
      case_id: "demo-aviation-id-001",
      output_type: "evidence_pack_preview",
      title: "Evidence Pack",
      content: "--- FINAL EVIDENCE PACK --- \n\n[DOCUMENT 1: PNR Booking Confirmation]\nBooking Ref: PNR-WXY789\nFlight: 6E-401 (DEL to BOM)\nDate: May 15\nStatus: CANCELLED\n\n[DOCUMENT 2: Airline Communication Log]\nFrom: IndiGo Customer Service\nTo: Consumer\nDate: May 15\nMessage: \"We regret to inform you that flight 6E-401 has been cancelled due to unforeseen operational reasons...\"\n\n[DOCUMENT 3: Customer Care Transcript excerpt]\nAgent: \"Your refund is still in our banking queue. We process these within 5-7 business days, though your SLA has surpassed 15 days, we request you to wait further.\"",
      metadata: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  ],
  files: [],
  parsingMetadata: {},
  extractionMetadata: {},
  facts: {
    complaint_summary: "The consumer's flight from Delhi to Mumbai was cancelled by IndiGo at the last minute, and they were refused a timely refund according to DGCA norms.",
    merchant_name: "IndiGo",
    order_id: "PNR-WXY789",
    amount: 8500,
    currency: "INR",
    product_or_service: "Flight ticket (6E-401 DEL-BOM)",
    issues: ["last minute flight cancellation", "refund delay violating SLAs"],
    desired_resolution: "Full refund of INR 8500 and DGCA mandated compensation",
    consumer_actions_taken: ["Requested refund at gate", "Multiple follow-ups with customer care"],
    merchant_responses: ["Refund is still processing"],
  },
  timeline: [
    { date: "May 15", label: "Arrived at gate. Flight 6E-401 cancelled 2 hours before departure.", source: "Consumer" },
    { date: "May 15", label: "Requested refund instead of alternative flight.", source: "Consumer" },
    { date: "June 4", label: "Followed up with customer support. Informed refund is still processing.", source: "Consumer" },
  ],
  evaluation: {
    overall_assessment: "strong",
    analysis: "The airline is in clear violation of DGCA guidelines requiring a refund within a specific SLA after a last-minute flight cancellation.",
    consumer_rights_violated: ["Timely refund processing (DGCA CAR Section 3 Series M Part IV)"],
    consumer_rights_met: [],
    merchant_obligations_unmet: ["Execute refund within 15 days"],
    recommended_actions: ["File grievance with IndiGo Nodal Officer"]
  },
  routes: [
    {
      target_name: "IndiGo Grievance Nodal Officer",
      rationale: "Direct airline escalation to bypass tier-1 support.",
      target: "nodal",
      contact_info: "nodal@goindigo.in",
      priority: "high"
    },
    {
      target_name: "AirSewa DGCA Portal",
      rationale: "Government portal for aviation grievances.",
      target: "regulator",
      contact_info: "airsewa.gov.in",
      priority: "medium"
    }
  ],
  policyCitations: [
    {
      id: "cit1",
      source_title: "IndiGo Conditions of Carriage (Refunds)",
      excerpt: "If we cancel your flight, fail to operate a flight reasonably according to schedule, or fail to stop at your destination, we shall make a full refund in accordance with DGCA norms.",
      source_name: "IndiGo CoC",
      section_label: "Refund Policy",
      source_type: "company_policy",
      url: "https://www.goindigo.in/information/conditions-of-carriage.html",
      relevance_score: 0.92,
    }
  ],
  regulationCitations: [
    {
      id: "cit2",
      source_title: "Civil Aviation Requirements (DGCA CAR)",
      excerpt: "In case of flight cancellation, airlines shall provide alternate travel or a full refund as requested by the passenger. Refunds shall be processed within 15 days.",
      source_name: "DGCA Rules",
      section_label: "Section 3 Series M Part IV",
      source_type: "regulation",
      relevance_score: 0.98,
    }
  ],
};

export const MOCK_ECOMMERCE_CASE = {
  caseRow: {
    id: "demo-ecommerce-id-001",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    status: "complete",
    category: "ecommerce",
    subcategory: "damaged_goods",
    description: "I ordered a laptop from Flipkart which was delivered 3 days ago. When I unboxed it, the screen was completely shattered. I immediately raised a return request and uploaded photos showing the physical damage, but the seller rejected it saying the damage happened after delivery. I have an unboxing video showing the seal being broken and the screen already damaged inside the box. I am within the 7-day return window. I want a full refund or a replacement immediately. Customer support is not helping and keeps closing my tickets.",
    merchant_name: "Flipkart",
    order_reference: "OD1122334455",
    amount: 54000.0,
    currency: "INR",
    is_demo: true,
  },
  events: [
    { id: "ev1", case_id: "demo-ecommerce-id-001", event_type: "intake_received", title: "Complaint received", detail: "Category: ecommerce | Merchant: Flipkart", metadata: {}, created_at: new Date(Date.now() - 5000).toISOString() },
    { id: "ev2", case_id: "demo-ecommerce-id-001", event_type: "extraction_complete", title: "Facts extracted", detail: "2 issue(s) identified", metadata: {}, created_at: new Date(Date.now() - 4000).toISOString() },
    { id: "ev3", case_id: "demo-ecommerce-id-001", event_type: "timeline_assembled", title: "Timeline assembled", detail: "2 event(s) in chronological order", metadata: {}, created_at: new Date(Date.now() - 3000).toISOString() },
    { id: "ev4", case_id: "demo-ecommerce-id-001", event_type: "classification_complete", title: "Complaint classified", detail: "ecommerce / damaged_goods (high confidence)", metadata: {}, created_at: new Date(Date.now() - 2500).toISOString() },
    { id: "ev5", case_id: "demo-ecommerce-id-001", event_type: "policy_retrieved", title: "Policies retrieved", detail: "Found matching policies", metadata: {}, created_at: new Date(Date.now() - 1500).toISOString() },
    { id: "ev6", case_id: "demo-ecommerce-id-001", event_type: "outputs_generated", title: "Outputs generated", detail: "Generated grievance_email, escalation_note, evidence_checklist, evidence_pack", metadata: {}, created_at: new Date(Date.now() - 500).toISOString() },
  ],
  outputs: [
    {
      id: "out1",
      case_id: "demo-ecommerce-id-001",
      output_type: "grievance_email",
      title: "Formal Grievance Email",
      content: "Subject: Urgent: Unjustified Return Rejection for Shattered Laptop - OD1122334455\n\nDear Grievance Officer, Flipkart,\n\nI received my order (OD1122334455) for a laptop three days ago. Upon unboxing, the display was completely shattered. Despite immediately uploading an unboxing video as irrefutable proof of DOA (Dead on Arrival) state, the seller rejected my return claim within the 7-day window citing \"post-delivery damage.\"\n\nUnder the Consumer Protection (E-Commerce) Rules, 2020, specifically Section 5(2), an e-commerce entity is obligated to ensure goods match their description and are defect-free. An unboxing video legally establishes the defect was present at the point of delivery.\n\nI request an immediate reversal of the seller's rejection and an automated pickup of the damaged unit followed by a full refund or replacement. If unresolved within 48 hours, I will formally escalate this to the National Consumer Helpline (NCH).\n\nRegards,\n[Your Name]",
      metadata: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "out2",
      case_id: "demo-ecommerce-id-001",
      output_type: "escalation_note",
      title: "Legal Escalation Note",
      content: "## Case Brief: Flipkart Damaged Item Receipt\n\n**Consumer Position:**\n- Video evidence clearly demonstrates shatter damage existing at the time of seal-breaking.\n- Post-delivery damage claim by seller is nullified by continuous unedited video frame at 00:52.\n\n**Legal Standing:**\n- **Consumer Protection Act (Deficiency in Service):** Selling fundamentally damaged high-value electronics without recourse.\n- **Violation:** Flipkart Return policy override mechanism failed to protect consumer against fraudulent seller dismissal within window.\n\n**Recommended Escalate Route:**\nFlipkart Grievance Officer -> National Consumer Helpline",
      metadata: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "out3",
      case_id: "demo-ecommerce-id-001",
      output_type: "evidence_checklist",
      title: "Required Evidence",
      content: "* [x] Unboxing Video (continuous shot showing original seal)\n* [x] Rejection Screenshot from Flipkart Seller\n* [x] Delivery Receipt",
      metadata: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "out4",
      case_id: "demo-ecommerce-id-001",
      output_type: "evidence_pack_preview",
      title: "Prepared Evidence Pack",
      content: "--- FINAL EVIDENCE PACK ---\n\n[DOCUMENT 1: Flipkart Order Invoice]\nOrder ID: OD1122334455\nItem: Laptop\nAmount: INR 54,000\nDelivered: 3 days ago\n\n[DOCUMENT 2: Unboxing Video Analysis / Extracted Transcripts]\nFrame Timestamp 00:15: Factory seal broken by user.\nFrame Timestamp 00:45: Laptop taken out of sleeve.\nFrame Timestamp 00:52: Screen visibly shattered dead-on-arrival. No dropping observed.\n\n[DOCUMENT 3: Seller Return Rejection Ticket]\nStatus: REJECTED\nSeller Comment: \"Physical damage requests must be validated before delivery acceptance. Post-delivery damage is the responsibility of the buyer. Ticket Closed.\"",
      metadata: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  ],
  files: [],
  parsingMetadata: {},
  extractionMetadata: {},
  facts: {
    complaint_summary: "The consumer received a shattered laptop and provided an unboxing video, but the seller rejected the return claim citing post-delivery damage.",
    merchant_name: "Flipkart",
    order_id: "OD1122334455",
    amount: 54000.0,
    currency: "INR",
    product_or_service: "Laptop",
    issues: ["damaged goods received", "unjustified return rejection"],
    desired_resolution: "Full refund or replacement immediately",
    consumer_actions_taken: ["Raised return request", "Uploaded unboxing video"],
    merchant_responses: ["Rejected claim (blamed post-delivery damage)"],
  },
  timeline: [
    { date: "Delivery Date", label: "Received package. Unboxed to find shattered screen.", source: "Consumer" },
    { date: "Delivery Date", label: "Raised return request instantly.", source: "Consumer" },
    { date: "Yesterday", label: "Seller rejected return falsely claiming post-delivery damage.", source: "Flipkart" },
  ],
  evaluation: {
    overall_assessment: "strong",
    analysis: "The consumer has an unboxing video proving the defect existed at the point of transfer. The seller's rejection within the 7-day return window violates the Consumer Protection E-Commerce Rules.",
    consumer_rights_violated: ["Consumer Protection Act (Deficiency in Service)", "E-Commerce Rules 2020"],
    merchant_obligations_unmet: ["Accept valid return within 7 days"],
    consumer_rights_met: [],
    recommended_actions: ["Escalate to Flipkart Grievance Officer"],
  },
  routes: [
    {
      target_name: "Flipkart Grievance Officer",
      rationale: "Escalate past the tier-1 chat support directly to the nodal officer.",
      target: "nodal",
      contact_info: "grievance.officer@flipkart.com",
      priority: "high"
    },
    {
      target_name: "National Consumer Helpline (NCH)",
      rationale: "Federal mediator for e-commerce disputes.",
      target: "regulator",
      contact_info: "1915",
      priority: "medium"
    }
  ],
  policyCitations: [
    {
      id: "cit1",
      source_title: "Flipkart Return Policy",
      excerpt: "Electronics such as laptops carry a 7-day replacement policy for damaged, defective, or 'not as described' items.",
      source_name: "Returns Policy",
      section_label: "Electronics Section",
      source_type: "company_policy",
      url: "https://www.flipkart.com/pages/returnpolicy",
      relevance_score: 0.95,
    }
  ],
  regulationCitations: [
    {
      id: "cit2",
      source_title: "Consumer Protection (E-Commerce) Rules, 2020",
      excerpt: "No e-commerce entity shall refuse to take back goods, or withdraw or discontinue services purchased or agreed to be purchased... if such goods or services are defective.",
      source_name: "Ministry of Consumer Affairs",
      source_type: "regulation",
      section_label: "Section 5(2)",
      relevance_score: 0.99,
    }
  ],
};
