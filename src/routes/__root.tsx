import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import logoUrl from "../assets/logo.png";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { BagProvider } from "../hooks/use-bag";
import { SavedProvider } from "../hooks/use-saved";
import { CartDrawer } from "../components/cart/CartDrawer";
import { Container, PageShell } from "../components/layout/PageShell";
import { Toaster } from "../components/ui/sonner";
import { CONTACT, SITE } from "../config/site";
import { absoluteUrl } from "../lib/seo";

function NotFoundComponent() {
  return (
    <PageShell>
      <Container className="py-24 text-center">
        <p className="eyebrow text-primary">Error 404</p>
        <h1 className="display mt-4 text-6xl sm:text-7xl">This page has moved on</h1>
        <p className="mx-auto mt-5 max-w-md leading-relaxed text-muted-foreground">
          The page you're looking for doesn't exist — but your next favourite outfit might.
        </p>
        <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
          <Link to="/shop" className="btn-primary justify-center rounded-lg">
            Shop the collection
          </Link>
          <Link to="/" className="btn-outline justify-center rounded-lg">
            Back to home
          </Link>
        </div>
      </Container>
    </PageShell>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "theme-color", content: "#80002A" },
      // Defaults; each page overrides title/description/OG via seo().
      { title: `${SITE.name} | ${SITE.tagline}` },
      { name: "description", content: SITE.description },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500;1,600&family=Manrope:wght@400;500;600;700&display=swap",
      },
      { rel: "icon", href: "/favicon.ico?v=2", type: "image/x-icon" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        // Organisation data limited to verified facts: name, logo, Instagram and phone.
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ClothingStore",
          name: SITE.name,
          ...(SITE.url && { url: SITE.url }),
          logo: absoluteUrl(logoUrl),
          telephone: CONTACT.primary.tel,
          sameAs: [CONTACT.instagram.url],
        }),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <BagProvider>
        <SavedProvider>
          {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
          <Outlet />
          <CartDrawer />
          <Toaster position="bottom-center" closeButton />
        </SavedProvider>
      </BagProvider>
    </QueryClientProvider>
  );
}
