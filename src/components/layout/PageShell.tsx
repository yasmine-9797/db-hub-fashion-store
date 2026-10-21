import type { ReactNode } from "react";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { cn } from "@/lib/utils";

/** Standard page frame: skip link, announcement bar + header, main content, footer. */
export function PageShell({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:bg-background focus:p-3 focus:shadow"
      >
        Skip to content
      </a>
      <SiteHeader />
      <main id="main" className={cn("min-h-[60vh]", className)}>
        {children}
      </main>
      <SiteFooter />
    </>
  );
}

/** Centred content width used by most pages. */
export function Container({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("mx-auto max-w-7xl px-5 lg:px-10", className)}>{children}</div>;
}
