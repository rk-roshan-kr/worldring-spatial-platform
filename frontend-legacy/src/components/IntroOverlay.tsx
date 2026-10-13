"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { StreetMatrixCanvas } from "@/components/StreetMatrixCanvas";

// ─── Timing Constants ─────────────────────────────────────────────────────────
const VOID_DURATION         = 800;   // ms of pure black before dots start
const MATERIALIZE_DURATION  = 5500;  // ms for the point cloud to fully appear
const SWOOSH_DELAY          = 300;   // ms pause after materialization before swoosh
const SWOOSH_DURATION       = 1400;  // ms for the canvas to fly into Hero column
const HERO_STAGGER_START    = 200;   // ms after swoosh starts before Hero text appears
const TOTAL_INTRO_TIME      = VOID_DURATION + MATERIALIZE_DURATION + SWOOSH_DELAY + SWOOSH_DURATION + 600;

const APPLE_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

interface IntroOverlayProps {
  /** Ref to the Hero's right-column container — the FLIP landing target */
  targetRef: React.RefObject<HTMLDivElement | null>;
  /** Called when the intro sequence is fully complete and overlay should unmount */
  onIntroComplete: () => void;
  /** Called at the moment hero text should start animating in */
  onHeroRevealStart: () => void;
}

export function IntroOverlay({
  targetRef,
  onIntroComplete,
  onHeroRevealStart,
}: IntroOverlayProps) {
  const [phase, setPhase] = useState<"void" | "materializing" | "swooshing" | "done">("void");
  const [swooshStyle, setSwooshStyle] = useState<React.CSSProperties>({});
  const overlayRef = useRef<HTMLDivElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const hasStartedRef = useRef(false);

  // ── Phase transitions ─────────────────────────────────────────
  useEffect(() => {
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;

    // Phase 1: Void → Materializing
    const t1 = setTimeout(() => {
      setPhase("materializing");
    }, VOID_DURATION);

    return () => clearTimeout(t1);
  }, []);

  // ── Handle materialization complete ───────────────────────────
  const handleMaterializeComplete = useCallback(() => {
    // Small pause for dramatic effect, then start swoosh
    setTimeout(() => {
      setPhase("swooshing");

      // Calculate FLIP transform to target position
      const target = targetRef.current;
      const container = canvasContainerRef.current;

      if (target && container) {
        const targetRect = target.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();

        // Calculate the transform needed to move from fullscreen to target
        const scaleX = targetRect.width / containerRect.width;
        const scaleY = targetRect.height / containerRect.height;
        const translateX = targetRect.left + targetRect.width / 2 - (containerRect.left + containerRect.width / 2);
        const translateY = targetRect.top + targetRect.height / 2 - (containerRect.top + containerRect.height / 2);

        setSwooshStyle({
          transform: `translate(${translateX}px, ${translateY}px) scale(${scaleX}, ${scaleY})`,
          borderRadius: "16px",
        });
      }

      // Start hero text reveal partway through the swoosh
      setTimeout(() => {
        onHeroRevealStart();
      }, HERO_STAGGER_START);

      // Mark intro as done after swoosh finishes
      setTimeout(() => {
        setPhase("done");
        onIntroComplete();
      }, SWOOSH_DURATION + 200);
    }, SWOOSH_DELAY);
  }, [targetRef, onHeroRevealStart, onIntroComplete]);

  return (
    <AnimatePresence>
      {phase !== "done" && (
        <motion.div
          ref={overlayRef}
          className="intro-overlay"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: APPLE_EASE }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            background: "#000000",
            overflow: "hidden",
          }}
        >
          {/* Background fade to transparent during swoosh */}
          <motion.div
            className="intro-overlay__bg"
            animate={{
              opacity: phase === "swooshing" ? 0 : 1,
            }}
            transition={{
              duration: SWOOSH_DURATION / 1000,
              ease: APPLE_EASE,
            }}
            style={{
              position: "absolute",
              inset: 0,
              background: "#000000",
              zIndex: 0,
            }}
          />

          {/* Canvas container — animates from fullscreen to Hero column position */}
          <div
            ref={canvasContainerRef}
            className="intro-overlay__canvas"
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 1,
              transition: phase === "swooshing"
                ? `transform ${SWOOSH_DURATION}ms cubic-bezier(0.16, 1, 0.3, 1), border-radius ${SWOOSH_DURATION}ms cubic-bezier(0.16, 1, 0.3, 1)`
                : "none",
              transformOrigin: "center center",
              willChange: "transform",
              ...swooshStyle,
            }}
          >
            <StreetMatrixCanvas
              className="w-full h-full"
              onMaterializeComplete={handleMaterializeComplete}
              paused={phase === "swooshing"}
            />
          </div>

          {/* Subtle branding text during void/materialization */}
          <AnimatePresence>
            {(phase === "void" || phase === "materializing") && (
              <motion.div
                className="intro-overlay__brand"
                initial={{ opacity: 0 }}
                animate={{ opacity: phase === "materializing" ? 0.35 : 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.2, delay: 0.5, ease: APPLE_EASE }}
                style={{
                  position: "absolute",
                  bottom: "2.5rem",
                  left: "50%",
                  transform: "translateX(-50%)",
                  zIndex: 2,
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.65rem",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase" as const,
                  color: "rgba(0, 210, 240, 0.5)",
                  whiteSpace: "nowrap" as const,
                  pointerEvents: "none" as const,
                }}
              >
                Reconstructing spatial reality...
              </motion.div>
            )}
          </AnimatePresence>

          {/* Progress indicator during materialization */}
          <AnimatePresence>
            {phase === "materializing" && (
              <motion.div
                className="intro-overlay__progress"
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 0.6, scaleX: 1 }}
                exit={{ opacity: 0 }}
                transition={{
                  opacity: { duration: 0.8, delay: 0.3 },
                  scaleX: { duration: MATERIALIZE_DURATION / 1000 - 0.5, ease: "linear", delay: 0.5 },
                }}
                style={{
                  position: "absolute",
                  bottom: "1.5rem",
                  left: "50%",
                  transform: "translateX(-50%)",
                  transformOrigin: "left center",
                  width: "120px",
                  height: "1px",
                  background: "linear-gradient(to right, transparent, rgba(0, 210, 240, 0.6), transparent)",
                  zIndex: 2,
                  pointerEvents: "none" as const,
                }}
              />
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
