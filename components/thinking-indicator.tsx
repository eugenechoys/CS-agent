"use client";

import { useEffect, useState } from "react";

const steps = [
  "Reading your request...",
  "Figuring out the best approach...",
  "Calling in a specialist...",
  "Building your results...",
];

export function ThinkingIndicator() {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex((current) => (current + 1) % steps.length);
    }, 2400);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="thinking-indicator">
      <div className="thinking-dots">
        <span className="thinking-dot" />
        <span className="thinking-dot" />
        <span className="thinking-dot" />
      </div>
      <span className="thinking-label">{steps[stepIndex]}</span>
    </div>
  );
}
