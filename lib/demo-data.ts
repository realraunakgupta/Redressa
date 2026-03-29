export type Category = "aviation" | "ecommerce";

export interface DemoCase {
  category: Category;
  merchantName: string;
  orderReference: string;
  amount: string;
  description: string;
}

export const DEMO_AVIATION_CASE: DemoCase = {
  category: "aviation",
  merchantName: "IndiGo",
  orderReference: "PNR-WXY789",
  amount: "8500",
  description: "My flight 6E-401 from Delhi to Mumbai on May 15 was cancelled by IndiGo last minute. We were waiting at the gate and they cancelled it just 2 hours before departure. They promised a full refund instead of rebooking, but it has been over 20 days and I still haven't received my money back. I have called the customer care multiple times and they just say it is still processing. According to their policy I should have received it within 15 days. I want my INR 8500 refunded immediately along with the mandated compensation for the last-minute cancellation.",
};

export const DEMO_ECOMMERCE_CASE: DemoCase = {
  category: "ecommerce",
  merchantName: "Flipkart",
  orderReference: "OD1122334455",
  amount: "54000",
  description: "I ordered a laptop from Flipkart which was delivered 3 days ago. When I unboxed it, the screen was completely shattered. I immediately raised a return request and uploaded photos showing the physical damage, but the seller rejected it saying the damage happened after delivery. I have an unboxing video showing the seal being broken and the screen already damaged inside the box. I am within the 7-day return window. I want a full refund or a replacement immediately. Customer support is not helping and keeps closing my tickets.",
};
