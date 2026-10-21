import { Link, type LinkProps } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";

export type Crumb = { label: string; to?: LinkProps["to"]; params?: LinkProps["params"] };

/** Breadcrumb trail; the last crumb is the current page. Pair with `breadcrumbJsonLd` for SEO. */
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
        {items.map((c, i) => (
          <li key={c.label} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight className="h-3 w-3" aria-hidden="true" />}
            {c.to && i < items.length - 1 ? (
              <Link to={c.to} params={c.params ?? {}} className="hover:text-primary">
                {c.label}
              </Link>
            ) : (
              <span
                aria-current={i === items.length - 1 ? "page" : undefined}
                className="text-foreground"
              >
                {c.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
