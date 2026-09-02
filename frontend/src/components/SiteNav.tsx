"use client";

import { useEffect, useState, useRef } from "react";
import { SITE } from "@/config/site";
import Link from "next/link";

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
        if (res.ok) {
          setConnected(true);
        } else {
          setConnected(false);
        }
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
        rootMargin: "-30% 0px -50% 0px" 
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

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 border-b ${
        scrolled ? "border-line" : "border-transparent"
      } bg-paper/90 backdrop-blur-md transition-colors duration-200`}
    >
      <div className="mx-auto max-w-[76rem] px-(--gutter) py-3.5 flex items-center justify-between gap-6">
        <a href="#top" className="flex items-baseline gap-2.5 no-underline whitespace-nowrap">
          <span className="font-serif text-[1.28rem] font-semibold tracking-tight text-ink">
            {SITE.brandName}
          </span>
          <span className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-muted border-l border-line-strong pl-2 py-0.5 ml-1">
            {SITE.stageTag}
          </span>
          <span className="flex items-center gap-1.5 border-l border-line-strong pl-2.5 py-0.5 ml-1 select-none">
            <span className="relative flex h-1.5 w-1.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${connected ? "bg-green-500" : "bg-amber-500"}`}></span>
              <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${connected ? "bg-green-500" : "bg-amber-500"}`}></span>
            </span>
            <span className="font-mono text-[0.55rem] uppercase tracking-wider font-semibold text-muted hidden sm:inline">
              {connected ? "SANDBOX: LIVE" : "SANDBOX: OFFLINE"}
            </span>
          </span>
        </a>

        <nav aria-label="Primary">
          <button
            type="button"
            className="lg:hidden font-mono text-[0.75rem] border border-line-strong px-3.5 py-2 cursor-pointer transition-colors hover:border-accent-deep hover:text-accent-deep"
            aria-expanded={open}
            aria-controls="nav-links"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? "Close" : "Menu"}
          </button>
          <ul
            ref={navRef}
            id="nav-links"
            className={`${
              open ? "flex opacity-100 translate-y-0 pointer-events-auto" : "hidden lg:flex"
            } lg:opacity-100 lg:translate-y-0 lg:pointer-events-auto absolute lg:static top-full inset-x-0 flex-col lg:flex-row items-stretch lg:items-center gap-0 lg:gap-[clamp(1rem,2vw,1.9rem)] bg-paper border-b border-line lg:border-0 px-(--gutter) lg:p-0 m-0 p-2 pb-4 lg:m-0 list-none transition-all duration-200 ease-out ${
              open ? "" : "opacity-0 -translate-y-1 pointer-events-none"
            }`}
            style={open ? { maxHeight: "calc(100vh - 4rem)", overflow: "auto" } : undefined}
          >
            {SITE.nav.map((item) => (
              <li key={item.href} className="lg:contents w-full lg:w-auto">
                <a
                  href={item.href}
                  onClick={() => setOpen(false)}
                  aria-current={active === item.href ? "true" : undefined}
                  className={`block lg:inline py-2.5 lg:py-0 border-t border-line lg:border-0 font-mono text-[0.74rem] uppercase tracking-wider no-underline transition-colors hover:text-accent-deep ${
                    active === item.href ? "text-accent-deep font-semibold" : "text-body-text"
                  }`}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/capture"
            className="btn btn-ghost !py-2.5 hidden md:inline-flex border border-line-strong font-mono text-[0.74rem] uppercase tracking-wider text-muted hover:border-accent-deep hover:text-accent-deep transition-colors"
          >
            Launch 3D Sim
          </Link>
          <button
            onClick={onOpenContact}
            className="btn btn-solid !py-2.5 hidden sm:inline-flex cursor-pointer"
          >
            Get in touch
          </button>
        </div>
      </div>
    </header>
  );
}
