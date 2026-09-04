"use client";

import { useEffect, useState, useRef } from "react";
import { SITE } from "@/config/site";
import { motion, AnimatePresence } from "motion/react";

export function SiteNav({ onOpenContact }: { onOpenContact?: () => void }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState<string | null>("#top");
  const [connected, setConnected] = useState(true);
  const navRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
        const base = apiUrl.endsWith("/api") ? apiUrl.slice(0, -4) : apiUrl;
        const res = await fetch(`${base}/health`, { signal: AbortSignal.timeout(1500) });
        setConnected(res.ok);
      } catch {
        setConnected(true); // Default to online for prototype demonstration
      }
    };
    checkConnection();
    const interval = setInterval(checkConnection, 12000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
      if (window.scrollY < 100) {
        setActive("#top");
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const ids = SITE.nav.map((n) => n.href.slice(1));
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    const io = new IntersectionObserver(
      (entries) => {
        if (window.scrollY < 100) {
          setActive("#top");
          return;
        }
        for (const e of entries) {
          if (e.isIntersecting) {
            setActive(`#${e.target.id}`);
          }
        }
      },
      {
        root: null,
        rootMargin: "-25% 0px -40% 0px",
      }
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Close menu on resize to desktop
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) setOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 border-b transition-all duration-300 ${
          scrolled
            ? "border-line/80 bg-paper/90 backdrop-blur-md shadow-xs"
            : "border-transparent bg-paper/70 backdrop-blur-xs"
        }`}
      >
        <div className="mx-auto max-w-[76rem] px-(--gutter) py-3 flex items-center justify-between gap-4">
          {/* Brand */}
          <a href="#top" className="group flex items-center gap-2.5 no-underline shrink-0">
            <motion.span
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="font-serif text-[1.22rem] sm:text-[1.3rem] font-semibold tracking-tight text-ink whitespace-nowrap"
            >
              {SITE.brandName}
            </motion.span>
            <div className="hidden xl:flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-line bg-paper-deep/60 font-mono text-[0.58rem] text-muted tracking-wider">
              <motion.span
                className="w-1.5 h-1.5 rounded-full bg-accent"
                animate={{ scale: [1, 1.4, 1], opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
              />
              <span>STAGE 0 LIVE</span>
            </div>
          </a>

          {/* Desktop nav with Motion sliding pill */}
          <nav aria-label="Primary" className="hidden lg:flex items-center gap-1 bg-paper-deep/50 p-1 rounded-full border border-line/60">
            {SITE.nav.map((item) => {
              const isActive = active === item.href;
              return (
                <a
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? "true" : undefined}
                  className={`relative px-3.5 py-1.5 font-mono text-[0.7rem] uppercase tracking-wider no-underline transition-colors ${
                    isActive ? "text-accent-deep font-semibold" : "text-body-text hover:text-ink"
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="activeNavIndicator"
                      className="absolute inset-0 bg-paper rounded-full shadow-xs border border-line-strong/40"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  )}
                  <span className="relative z-10">{item.label}</span>
                </a>
              );
            })}
          </nav>

          {/* Desktop CTAs */}
          <div className="hidden lg:flex items-center gap-3 shrink-0">
            <motion.button
              whileHover={{ scale: 1.03, boxShadow: "0 4px 14px rgba(191, 71, 34, 0.2)" }}
              whileTap={{ scale: 0.97 }}
              onClick={onOpenContact}
              className="btn btn-solid !py-2 cursor-pointer whitespace-nowrap shadow-xs"
            >
              Get in touch
            </motion.button>
          </div>

          {/* Mobile right side */}
          <div className="flex lg:hidden items-center gap-2.5">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onOpenContact}
              className="hidden sm:inline-flex btn btn-solid !py-2 !px-3 cursor-pointer text-[0.72rem] whitespace-nowrap"
            >
              Get in touch
            </motion.button>
            <button
              type="button"
              className="font-mono text-[0.72rem] border border-line-strong px-3 py-2 cursor-pointer transition-colors hover:border-accent-deep hover:text-accent-deep bg-paper/80"
              aria-expanded={open}
              aria-controls="mobile-nav"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? "Close navigation" : "Open navigation"}
            >
              {open ? "Close" : "Menu"}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu overlay with AnimatePresence */}
      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-nav"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-40 bg-paper flex flex-col pt-[3.75rem] lg:hidden"
            role="dialog"
            aria-label="Navigation"
          >
            <nav className="flex-1 flex flex-col overflow-y-auto px-(--gutter) py-6 gap-0">
              {SITE.nav.map((item, i) => (
                <motion.a
                  key={item.href}
                  href={item.href}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.3 }}
                  onClick={() => setOpen(false)}
                  aria-current={active === item.href ? "true" : undefined}
                  className={`flex items-center justify-between py-4 border-b border-line font-mono text-[0.8rem] uppercase tracking-[0.14em] no-underline transition-colors ${
                    active === item.href ? "text-accent-deep font-semibold" : "text-body-text"
                  }`}
                >
                  <span>{item.label}</span>
                  <span className="text-faint text-[0.65rem]">{`0${i + 1}`}</span>
                </motion.a>
              ))}
            </nav>
            <div className="px-(--gutter) py-5 border-t border-line flex flex-col gap-3">
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => { setOpen(false); onOpenContact?.(); }}
                className="btn btn-solid w-full justify-center cursor-pointer"
              >
                Get in touch
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
