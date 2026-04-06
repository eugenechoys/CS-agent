"use client";

import { useEffect, useState } from "react";

const fallbackSteps = [
  "Reading your request...",
  "Figuring out the best approach...",
  "Calling in a specialist...",
  "Building your results...",
];

export function ThinkingIndicator({ step }: { step?: string | null }) {
  const [fallbackIndex, setFallbackIndex] = useState(0);

  useEffect(() => {
    if (step) return; /* Don't cycle if we have a real step */
    const interval = setInterval(() => {
      setFallbackIndex((current) => (current + 1) % fallbackSteps.length);
    }, 2400);
    return () => clearInterval(interval);
  }, [step]);

  const label = step ?? fallbackSteps[fallbackIndex];

  return (
    <div className="thinking-indicator">
      <div className="thinking-dots">
        <span className="thinking-dot" />
        <span className="thinking-dot" />
        <span className="thinking-dot" />
      </div>
      <span className="thinking-label">{label}</span>
    </div>
  );
}
