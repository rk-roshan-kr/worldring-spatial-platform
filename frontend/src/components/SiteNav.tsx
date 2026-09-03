"use client";

import { useEffect, useState, useRef } from "react";
import { SITE } from "@/config/site";

export function SiteNav({ onOpenContact }: { onOpenContact?: () => void }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const navRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
        const base = apiUrl.endsWith("/api") ? apiUrl.slice(0, -4) : apiUrl;
        const res = await fetch(`${base}/health`, { signal: AbortSignal.timeout(1500) });
        setConnected(res.ok);
      } catch {
        setConnected(false);
      }
    };
    checkConnection();
    const interval = setInterval(checkConnection, 8000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const container = document.getElementById("snap-container");
    const onScroll = () => {
      const scrollTop = container ? container.scrollTop : window.scrollY;
      setScrolled(scrollTop > 8);
    };
    onScroll();
    if (container) {
      container.addEventListener("scroll", onScroll, { passive: true });
    } else {
      window.addEventListener("scroll", onScroll, { passive: true });
    }
    return () => {
      if (container) {
        container.removeEventListener("scroll", onScroll);
      } else {
        window.removeEventListener("scroll", onScroll);
      }
    };
  }, []);

  useEffect(() => {
    const ids = SITE.nav.map((n) => n.href.slice(1));
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    const container = document.getElementById("snap-container");
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(`#${e.target.id}`);
        }
      },
      {
        root: container,
        rootMargin: "-30% 0px -50% 0px",
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
        className={`fixed top-0 left-0 right-0 z-50 border-b ${
          scrolled ? "border-line" : "border-transparent"
        } bg-paper/90 backdrop-blur-md transition-colors duration-200`}
      >
        <div className="mx-auto max-w-[76rem] px-(--gutter) py-3 flex items-center justify-between gap-4">
          {/* Brand */}
          <a href="#top" className="flex items-center gap-2 no-underline shrink-0">
            <span className="font-serif text-[1.2rem] sm:text-[1.28rem] font-semibold tracking-tight text-ink whitespace-nowrap">
              {SITE.brandName}
            </span>
          </a>

          {/* Desktop nav */}
          <nav aria-label="Primary" className="hidden lg:flex items-center gap-[clamp(0.75rem,1.5vw,1.6rem)]">
            {SITE.nav.map((item) => (
              <a
                key={item.href}
                href={item.href}
                aria-current={active === item.href ? "true" : undefined}
                className={`font-mono text-[0.72rem] uppercase tracking-wider no-underline transition-colors hover:text-accent-deep ${
                  active === item.href ? "text-accent-deep font-semibold" : "text-body-text"
                }`}
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Desktop CTAs */}
          <div className="hidden lg:flex items-center gap-3 shrink-0">
            <button
              onClick={onOpenContact}
              className="btn btn-solid !py-2 cursor-pointer whitespace-nowrap"
            >
              Get in touch
            </button>
          </div>

          {/* Mobile right side */}
          <div className="flex lg:hidden items-center gap-2.5">
            <button
              onClick={onOpenContact}
              className="hidden sm:inline-flex btn btn-solid !py-2 !px-3 cursor-pointer text-[0.72rem] whitespace-nowrap"
            >
              Get in touch
            </button>
            <button
              type="button"
              className="font-mono text-[0.72rem] border border-line-strong px-3 py-2 cursor-pointer transition-colors hover:border-accent-deep hover:text-accent-deep"
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

      {/* Mobile menu overlay */}
      {open && (
        <div
          id="mobile-nav"
          className="fixed inset-0 z-40 bg-paper flex flex-col pt-[3.75rem] lg:hidden"
          role="dialog"
          aria-label="Navigation"
        >
          <nav className="flex-1 flex flex-col overflow-y-auto px-(--gutter) py-6 gap-0">
            {SITE.nav.map((item, i) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                aria-current={active === item.href ? "true" : undefined}
                className={`flex items-center justify-between py-4 border-b border-line font-mono text-[0.8rem] uppercase tracking-[0.14em] no-underline transition-colors ${
                  active === item.href ? "text-accent-deep" : "text-body-text"
                }`}
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <span>{item.label}</span>
                <span className="text-faint text-[0.65rem]">{`0${i + 1}`}</span>
              </a>
            ))}
          </nav>
          <div className="px-(--gutter) py-5 border-t border-line flex flex-col gap-3">
            <button
              onClick={() => { setOpen(false); onOpenContact?.(); }}
              className="btn btn-solid w-full justify-center cursor-pointer"
            >
              Get in touch
            </button>
          </div>
        </div>
      )}
    </>
  );
}
