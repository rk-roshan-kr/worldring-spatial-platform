"use client";

import React from "react";
import { motion, useReducedMotion } from "motion/react";

export type RevealDirection = "up" | "down" | "left" | "right" | "fade" | "scale" | "none";

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  direction?: RevealDirection;
  delay?: number;
  duration?: number;
}

export function Reveal({
  children,
  className = "",
  direction = "up",
  delay = 0,
  duration = 0.65,
}: RevealProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion || direction === "none") {
    return <div className={className}>{children}</div>;
  }

  const initialVariants = {
    up: { opacity: 0, y: 0 },
    down: { opacity: 0, y: 0 },
    left: { opacity: 0, x: 12 },
    right: { opacity: 0, x: -12 },
    fade: { opacity: 0 },
    scale: { opacity: 0, scale: 0.98 },
    none: { opacity: 1 },
  };

  const initial = initialVariants[direction] || initialVariants.up;

  return (
    <motion.div
      className={className}
      initial={initial}
      whileInView={{
        opacity: 1,
        x: 0,
        y: 0,
        scale: 1,
      }}
      viewport={{ once: true, margin: "100px 0px 0px 0px" }}
      transition={{
        duration: 0.45,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {children}
    </motion.div>
  );
}

