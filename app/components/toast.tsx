"use client";

import { useEffect, useState } from "react";

interface ToastProps {
  message: string;
  onDone: () => void;
  durationMs?: number;
}

export function Toast({ message, onDone, durationMs = 2200 }: ToastProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setVisible(false), durationMs - 400);
    const doneTimer = setTimeout(onDone, durationMs);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(doneTimer);
    };
  }, [onDone, durationMs]);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] pointer-events-none">
      <div
        className={`pointer-events-auto px-6 py-3 rounded-sm border border-primary/30 bg-base shadow-2xl flex items-center gap-3 transition-all duration-300 ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
        }`}
      >
        <span className="text-primary text-sm">✓</span>
        <span className="text-sm font-sans text-on-base">{message}</span>
      </div>
    </div>
  );
}
