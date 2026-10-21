import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Info, Phone } from "lucide-react";
import { WhatsAppButton } from "@/components/common/WhatsAppButton";
import { Breadcrumbs, type Crumb } from "@/components/layout/Breadcrumbs";
import { Container, PageShell } from "@/components/layout/PageShell";
import { CONTACT } from "@/config/site";
import { cn } from "@/lib/utils";
import { waLink } from "@/lib/whatsapp";

/** Layout for editorial and policy pages: breadcrumbs, heading block and a readable column. */
export function ContentPage({
  eyebrow,
  title,
  intro,
  crumbs,
  draft = false,
  children,
}: {
  eyebrow: string;
  title: string;
  intro?: ReactNode;
  crumbs: Crumb[];
  draft?: boolean;
  children: ReactNode;
}) {
  return (
    <PageShell>
      <Container className="pb-24 pt-8 lg:pt-10">
        <Breadcrumbs items={crumbs} />
        <header className="mt-8 max-w-3xl">
          <p className="eyebrow text-primary">{eyebrow}</p>
          <h1 className="display mt-4 text-5xl sm:text-6xl">{title}</h1>
          {intro && (
            <p className="mt-6 text-[17px] leading-relaxed text-muted-foreground">{intro}</p>
          )}
        </header>
        {draft && <DraftNotice />}
        <div className="mt-12 max-w-3xl">{children}</div>
      </Container>
    </PageShell>
  );
}

/** Shown on policy pages until the owner sets POLICIES_APPROVED. */
function DraftNotice() {
  return (
    <aside
      role="note"
      aria-label="Draft policy"
      className="mt-8 max-w-3xl rounded-lg border border-champagne bg-champagne/15 p-5"
    >
      <p className="flex gap-3 text-[15px] leading-relaxed">
        <Info className="mt-1 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
        <span>
          <strong className="font-semibold">
            Draft — this policy is awaiting review by DB Hub.
          </strong>{" "}
          Contact us if you need confirmation before ordering.
        </span>
      </p>
      <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 pl-7 text-sm font-medium">
        <a
          href={`tel:${CONTACT.primary.tel}`}
          className="inline-flex items-center gap-2 hover:text-primary"
        >
          <Phone className="h-4 w-4" aria-hidden="true" />
          {CONTACT.primary.display}
        </a>
        <WhatsAppButton
          variant="link"
          message="Hello DB Hub! I have a question about your store policies."
        >
          WhatsApp us
        </WhatsAppButton>
      </div>
    </aside>
  );
}

/** Long-form text styling (headings, paragraphs, lists, links) for policy pages. */
export function Prose({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "text-[15px] leading-relaxed text-muted-foreground sm:text-base",
        "[&_h2]:display [&_h2]:mt-14 [&_h2]:scroll-mt-32 [&_h2]:text-3xl [&_h2]:text-foreground sm:[&_h2]:text-4xl [&>h2:first-child]:mt-0",
        "[&_h3]:mt-8 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-foreground",
        "[&_p]:mt-4 [&_ol]:mt-4 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-5 [&_ul]:mt-4 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5 [&_li]:pl-1 [&_li::marker]:text-primary",
        "[&_a]:font-medium [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4 [&_a:hover]:text-primary-deep",
        "[&_strong]:font-semibold [&_strong]:text-foreground",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** A detail the owner has not confirmed yet. Kept as literal bracketed text so it is easy to find and replace. */
export function ToConfirm({ children }: { children: ReactNode }) {
  return (
    <mark className="rounded bg-champagne/30 px-1 font-medium text-foreground">{children}</mark>
  );
}

/** "Last updated" line for a policy. Without a date it shows a placeholder for the owner to fill in. */
export function LastUpdated({ date }: { date?: string }) {
  return (
    <p className="text-sm text-muted-foreground">
      Last updated: {date ?? <ToConfirm>[To be confirmed]</ToConfirm>}
    </p>
  );
}

/** Widened so the "only when set" check stays meaningful once an email is added to config. */
const email: string = CONTACT.email;

/** Contact options listed at the end of each policy (render inside `Prose`). */
export function PolicyContact({ topic }: { topic: string }) {
  return (
    <ul>
      <li>
        WhatsApp:{" "}
        <a
          href={waLink(`Hello DB Hub! I have a question about your ${topic}.`)}
          target="_blank"
          rel="noopener noreferrer"
        >
          {CONTACT.primary.display}
        </a>
      </li>
      <li>
        Phone: <a href={`tel:${CONTACT.primary.tel}`}>{CONTACT.primary.display}</a> or{" "}
        <a href={`tel:${CONTACT.alternate.tel}`}>{CONTACT.alternate.display}</a>
      </li>
      {email && (
        <li>
          Email: <a href={`mailto:${email}`}>{email}</a>
        </li>
      )}
      <li>
        In person: our stores in Chennai and Coimbatore —{" "}
        <Link to="/contact">addresses and directions</Link>
      </li>
    </ul>
  );
}
