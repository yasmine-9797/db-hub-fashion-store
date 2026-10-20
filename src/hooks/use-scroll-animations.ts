import { useEffect } from "react";

/** Auto-animates content inside <main> sections as it scrolls into view. */
const SELECTOR = [
  "main section:not(#home) .eyebrow",
  "main section:not(#home) h2",
  "main section:not(#home) h3",
  "main section:not(#home) p",
  "main section:not(#home) img",
  "main section:not(#home) form",
  "main section:not(#home) li:not(.card-3d)",
  "main section:not(#home) a",
  "main section:not(#home) button",
  "footer > *",
].join(",");

export function useScrollAnimations() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("sa-in"); io.unobserve(e.target); }
      }),
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );
    const scan = () => {
      document.querySelectorAll<HTMLElement>(SELECTOR).forEach((el) => {
        if (el.dataset.sa || el.closest(".card-3d") || el.closest("[role=dialog]")) return;
        el.dataset.sa = "1";
        const kind = el.tagName === "IMG" ? "sa-zoom" : el.tagName === "H2" ? "sa-title" : "sa-up";
        el.classList.add("sa", kind);
        const sibs = el.parentElement ? Array.from(el.parentElement.children) : [];
        el.style.transitionDelay = `${Math.min(sibs.indexOf(el), 6) * 80}ms`;
        io.observe(el);
      });
    };
    scan();
    const mo = new MutationObserver(scan);
    mo.observe(document.body, { childList: true, subtree: true });
    return () => { io.disconnect(); mo.disconnect(); };
  }, []);
}
