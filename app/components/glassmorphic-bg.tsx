"use client";

import { useScroll, useTransform, motion } from "framer-motion";

export function GlassmorphicBackground() {
  const { scrollY } = useScroll();

  // Each layer moves at a different rate — creates real Z-depth parallax
  const y1 = useTransform(scrollY, [0, 800], [0, -120]);
  const y2 = useTransform(scrollY, [0, 800], [0, -200]);
  const y3 = useTransform(scrollY, [0, 800], [0, -340]);
  const opacity1 = useTransform(scrollY, [0, 600], [1, 0]);
  const opacity2 = useTransform(scrollY, [0, 500], [0.7, 0]);
  const opacity3 = useTransform(scrollY, [0, 400], [0.5, 0]);

  const dots = [
    { top: "18%", left: "22%", size: 4 },
    { top: "35%", left: "75%", size: 3 },
    { top: "55%", left: "40%", size: 5 },
    { top: "25%", left: "60%", size: 3 },
    { top: "70%", left: "15%", size: 4 },
    { top: "12%", left: "85%", size: 3 },
  ];

  return (
    <div
      className="fixed inset-0 w-full h-full -z-10 overflow-hidden pointer-events-none"
      aria-hidden="true"
    >
      {/* ── Layer 1: Large deep cobalt glow orb (furthest back, slowest) ── */}
      <motion.div
        style={{
          y: y1,
          opacity: opacity1,
          background:
            "radial-gradient(ellipse at center, rgba(37,99,235,0.13) 0%, rgba(37,99,235,0.05) 45%, transparent 70%)",
          filter: "blur(60px)",
          position: "absolute",
          top: "-15%",
          left: "50%",
          width: "900px",
          height: "900px",
          borderRadius: "50%",
          transform: "translateX(-50%)",
        }}
      />

      {/* ── Layer 2: Mid cobalt ring outline (right side) ── */}
      <motion.div
        style={{
          y: y2,
          opacity: opacity2,
          position: "absolute",
          top: "8%",
          right: "6%",
          width: "320px",
          height: "320px",
          borderRadius: "50%",
          border: "1px solid rgba(37,99,235,0.20)",
          background: "rgba(37,99,235,0.03)",
          backdropFilter: "blur(2px)",
          boxShadow: "0 0 60px rgba(37,99,235,0.08), inset 0 0 40px rgba(37,99,235,0.04)",
        }}
      />

      {/* ── Layer 2b: Smaller nested ring (depth effect) ── */}
      <motion.div
        style={{
          y: y2,
          opacity: opacity2,
          position: "absolute",
          top: "13%",
          right: "11%",
          width: "190px",
          height: "190px",
          borderRadius: "50%",
          border: "1px solid rgba(37,99,235,0.12)",
          background: "rgba(37,99,235,0.02)",
        }}
      />

      {/* ── Layer 2c: Left side ring (counterbalance) ── */}
      <motion.div
        style={{
          y: y2,
          opacity: opacity2,
          position: "absolute",
          top: "28%",
          left: "-60px",
          width: "260px",
          height: "260px",
          borderRadius: "50%",
          border: "1px solid rgba(37,99,235,0.10)",
          background: "rgba(37,99,235,0.02)",
          backdropFilter: "blur(1px)",
        }}
      />

      {/* ── Layer 3: Floating micro-dots (closest, fastest) ── */}
      {dots.map((dot, i) => (
        <motion.div
          key={i}
          style={{
            y: y3,
            opacity: opacity3,
            position: "absolute",
            top: dot.top,
            left: dot.left,
            width: dot.size,
            height: dot.size,
            borderRadius: "50%",
            background: "rgba(37,99,235,0.6)",
            boxShadow: "0 0 8px rgba(37,99,235,0.9)",
          }}
        />
      ))}

      {/* ── Vertical AI scan-line (CSS-animated loop, always pulses) ── */}
      <motion.div
        style={{
          opacity: opacity1,
          position: "absolute",
          top: "4%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "1px",
          height: "280px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "60px",
            background: "linear-gradient(180deg, transparent 0%, rgba(37,99,235,0.7) 50%, transparent 100%)",
            animation: "scanPulse 3s ease-in-out infinite",
          }}
        />
      </motion.div>

      {/* ── Bottom cobalt horizon horizon line ── */}
      <motion.div
        style={{
          opacity: opacity1,
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "1px",
          background:
            "linear-gradient(90deg, transparent 0%, rgba(37,99,235,0.35) 50%, transparent 100%)",
          boxShadow: "0 0 80px 20px rgba(37,99,235,0.06)",
        }}
      />
    </div>
  );
}
