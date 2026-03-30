"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
      delay,
    },
  }),
};

export function HeroSection() {
  return (
    <div className="max-w-2xl">
      {/* Eyebrow label */}
      <motion.p
        custom={0}
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        className="text-xs font-semibold uppercase tracking-widest text-primary-500 mb-3"
      >
        Agentic Consumer Redressal
      </motion.p>

      {/* H1 */}
      <motion.h1
        custom={0.1}
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        className="text-4xl font-bold tracking-tight text-neutral-50 leading-tight"
      >
        Your Evidence.{" "}
        <span className="text-primary-400">AI-Verified.</span>{" "}
        Case-Ready.
      </motion.h1>

      {/* Body copy */}
      <motion.p
        custom={0.22}
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        className="mt-4 text-base text-neutral-400 leading-relaxed"
      >
        Turn messy complaint evidence into grounded, escalation-ready claim
        packages. Upload your evidence, and the agentic pipeline will extract
        facts, retrieve relevant policies, evaluate your position, and generate
        action-ready outputs.
      </motion.p>

      {/* CTA */}
      <motion.div
        custom={0.34}
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        className="mt-7 flex items-center gap-4"
      >
        <Link href="/new" className="cta-primary">
          Start New Claim
        </Link>
      </motion.div>

      {/* Trust indicator chips */}
      <motion.div
        custom={0.46}
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        className="mt-5 flex flex-wrap gap-2"
      >
        {[
          "⚖ DGCA § 8.3 Cited",
          "✈ Aviation & E-Commerce",
          "🔒 Evidence-Grade Output",
        ].map((chip) => (
          <span
            key={chip}
            className="inline-flex items-center rounded-full border border-primary-800/60 bg-primary-950/30 px-3 py-1 text-xs font-medium text-primary-400"
          >
            {chip}
          </span>
        ))}
      </motion.div>

      <motion.p
        custom={0.52}
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        className="mt-5 text-xs text-neutral-600"
      >
        Guidance workflow, not legal advice.
      </motion.p>
    </div>
  );
}
