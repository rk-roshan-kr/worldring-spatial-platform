"use client";

import { useEffect } from "react";

/**
 * NetlifyBadgeSuppressor
 * 
 * Actively suppresses any edge-injected "Powered by Netlify" badges,
 * Netlify drawer feedback widgets, or preview badges across all viewports.
 */
export function NetlifyBadgeSuppressor() {
  useEffect(() => {
    const purgeNetlifyBadges = () => {
      // Find any elements injected by Netlify
      const selectors = [
        'iframe[src*="netlify"]',
        'iframe[title*="Netlify" i]',
        '#netlify-badge',
        '.netlify-badge',
        '#netlify-drawer',
        '.netlify-drawer',
        '[data-netlify-drawer]',
        '[data-netlify-deploy-id]',
        'a[href*="netlify.com"][class*="badge"]',
        'div[id*="netlify-badge"]',
      ];

      selectors.forEach((sel) => {
        try {
          const els = document.querySelectorAll(sel);
          els.forEach((el) => {
            el.remove();
          });
        } catch {
          // ignore
        }
      });
    };

    // Run purge immediately
    purgeNetlifyBadges();

    // Listen for dynamically injected DOM nodes
    const observer = new MutationObserver(() => {
      purgeNetlifyBadges();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, []);

  return null;
}
