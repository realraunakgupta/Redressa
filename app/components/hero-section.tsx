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
        className="text-xs font-sans font-semibold uppercase tracking-widest text-[#C5B358] mb-4"
      >
        Consumer Redressal
      </motion.p>

      {/* H1 */}
      <motion.h1
        custom={0.1}
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        className="text-5xl sm:text-6xl font-serif font-medium tracking-tight text-on-base leading-tight"
      >
        Your Evidence.<br/>
        <span className="text-primary tracking-normal italic">AI-Verified.</span> Case-Ready.
      </motion.h1>

      {/* Body copy */}
      <motion.p
        custom={0.22}
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        className="mt-6 text-lg font-sans text-on-surface-muted leading-relaxed max-w-xl"
      >
        Turn messy complaint evidence into grounded, escalation-ready claim
        packages. Upload your evidence, and the pipeline will extract
        facts, retrieve relevant policies, evaluate your position, and generate
        action-ready outputs.
      </motion.p>

      {/* CTA */}
      <motion.div
        custom={0.34}
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        className="mt-8 flex items-center gap-4"
      >
        <Link href="/new" className="btn-primary text-base px-6 py-3">
          Start New Claim
        </Link>
      </motion.div>

      {/* Trust indicator chips */}
      <motion.div
        custom={0.46}
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        className="mt-8 flex flex-wrap gap-3"
      >
        {[
          "⚖ DGCA § 8.3 Cited",
          "✈ Aviation & E-Commerce",
          "🔒 Evidence-Grade Output",
        ].map((chip) => (
          <span
            key={chip}
            className="inline-flex items-center rounded-sm border border-[var(--color-border-ghost)] bg-surface-low px-3 py-1.5 text-xs font-sans font-medium text-on-surface-muted"
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
        className="mt-6 text-xs font-sans text-on-surface-muted/50 uppercase tracking-wider"
      >
        Guidance workflow, not legal advice.
      </motion.p>
    </div>
  );
}
