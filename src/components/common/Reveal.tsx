import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Fades/slides its children in the first time they scroll into view. Content is visible by
 * default (server render, no JS, reduced motion) — the hidden state is only applied in the browser.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "li" | "section";
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [state, setState] = useState<"static" | "hidden" | "shown">("static");

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight && r.bottom > 0) return; // already on screen: don't hide it
    setState("hidden");
    const io = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting) {
          setState("shown");
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -60px 0px", threshold: 0.1 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      ref={ref as never}
      style={state === "shown" ? { transitionDelay: `${delay}ms` } : undefined}
      className={cn(
        "transition-[opacity,transform] duration-[900ms] ease-[cubic-bezier(.2,.7,.2,1)]",
        state === "hidden" && "translate-y-6 opacity-0",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
