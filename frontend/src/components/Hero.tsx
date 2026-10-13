"use client";

import React from "react";
import { HeroVoid } from "./sections/HeroVoid";

interface HeroProps {
  onOpenContact: (mode?: string) => void;
  isRevealed?: boolean;
}

/**
 * Hero Component (WorldRing Spatial Void Architecture)
 * 
 * Re-exports the left-docked editorial HeroVoid component positioned beside
 * the procedural 3D optical capture truck.
 * 
 * Top Navigation is anchored globally via AntigravityNav in src/components/nav/AntigravityNav.tsx
 */
export function Hero({ onOpenContact, isRevealed = true }: HeroProps) {
  return <HeroVoid onOpenContact={onOpenContact} isRevealed={isRevealed} />;
}

export default Hero;
