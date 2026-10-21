import { useState, type FormEvent, type ReactNode } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { WhatsAppButton } from "@/components/common/WhatsAppButton";
import { WHOLESALE_CATEGORIES, WHOLESALE_QUANTITIES, enquirySchema } from "@/lib/enquiry";
import { cn } from "@/lib/utils";
import { wholesaleMessage } from "@/lib/whatsapp";
import { submitEnquiryFn } from "@/lib/api";

const INPUT =
  "mt-2 w-full rounded-lg border border-input bg-background px-4 py-3 text-[15px] outline-none transition placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/15 aria-invalid:border-destructive";
const ORDER = ["name", "phone", "business", "quantity", "categories", "message"];

type Status =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "sent"; name: string; wa: string }
  | { kind: "offline"; wa: string };

/** Wholesale enquiry form: saved for the team when storage is configured, always WhatsApp-able. */
export function WholesaleForm() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const raw = {
      name: String(form.get("name") ?? ""),
      phone: String(form.get("phone") ?? ""),
      business: String(form.get("business") ?? ""),
      quantity: String(form.get("quantity") ?? ""),
      categories: form.getAll("categories").map(String),
      message: String(form.get("message") ?? ""),
      website: String(form.get("website") ?? ""),
    };
    const parsed = enquirySchema.safeParse(raw);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.issues.forEach((i) => {
        errs[String(i.path[0])] ??= i.message;
      });
      setErrors(errs);
      const first = ORDER.find((f) => errs[f]);
      if (first) document.getElementById(first)?.focus();
      return;
    }
    setErrors({});
    const wa = wholesaleMessage({
      name: parsed.data.name,
      business: parsed.data.business,
      quantity: parsed.data.quantity,
      categories: parsed.data.categories,
      message: parsed.data.message,
    });
    setStatus({ kind: "sending" });
    const res = await submitEnquiryFn({ data: raw }).catch(() => null);
    setStatus(res?.ok ? { kind: "sent", name: parsed.data.name, wa } : { kind: "offline", wa });
  };

  if (status.kind === "sent") {
    return (
      <div role="status" className="rounded-lg border bg-card p-8">
        <CheckCircle2 className="h-9 w-9 text-primary" />
        <h3 className="display mt-4 text-4xl">Thank you, {status.name.split(" ")[0]}.</h3>
        <p className="mt-3 leading-relaxed text-muted-foreground">
          Your enquiry has reached our team. We'll get back to you on the number you shared. For a
          faster reply, send it on WhatsApp too.
        </p>
        <WhatsAppButton message={status.wa} className="mt-6 rounded-lg">
          Send on WhatsApp
        </WhatsAppButton>
      </div>
    );
  }

  const a = (n: string) => ({
    id: n,
    name: n,
    "aria-invalid": Boolean(errors[n]),
    "aria-describedby": errors[n] ? `${n}-err` : undefined,
  });

  return (
    <form onSubmit={submit} noValidate className="grid gap-6 sm:grid-cols-2">
      <Field id="name" label="Your name" error={errors["name"]}>
        <input {...a("name")} className={INPUT} autoComplete="name" />
      </Field>
      <Field id="phone" label="Mobile number" error={errors["phone"]}>
        <input
          {...a("phone")}
          className={INPUT}
          inputMode="tel"
          autoComplete="tel"
          placeholder="98765 43210"
        />
      </Field>
      <Field
        id="business"
        label="Business or store name"
        optional
        error={errors["business"]}
        className="sm:col-span-2"
      >
        <input {...a("business")} className={INPUT} autoComplete="organization" />
      </Field>
      <Field
        id="quantity"
        label="Approximate order quantity"
        error={errors["quantity"]}
        className="sm:col-span-2"
      >
        <select {...a("quantity")} defaultValue="" className={INPUT}>
          <option value="" disabled>
            Choose a range
          </option>
          {WHOLESALE_QUANTITIES.map((q) => (
            <option key={q}>{q}</option>
          ))}
        </select>
      </Field>
      <fieldset id="categories" tabIndex={-1} className="sm:col-span-2">
        <legend className="text-sm font-medium">
          Interested in <span className="font-normal text-muted-foreground">(optional)</span>
        </legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {WHOLESALE_CATEGORIES.map((c) => (
            <label key={c} className="cursor-pointer">
              <input type="checkbox" name="categories" value={c} className="peer sr-only" />
              <span className="inline-block rounded-full border px-4 py-2 text-sm transition-colors peer-checked:border-primary peer-checked:bg-primary peer-checked:text-primary-foreground peer-focus-visible:ring-2 peer-focus-visible:ring-primary hover:border-foreground">
                {c}
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <Field
        id="message"
        label="Anything else?"
        optional
        error={errors["message"]}
        className="sm:col-span-2"
      >
        <textarea
          {...a("message")}
          rows={4}
          className={cn(INPUT, "resize-none")}
          placeholder="Styles, sizes, budget, delivery city…"
        />
      </Field>
      {/* Honeypot for bots — hidden from people and assistive tech. */}
      <div aria-hidden="true" className="hidden">
        <label>
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {status.kind === "offline" && (
        <div
          role="alert"
          className="rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm sm:col-span-2"
        >
          <p>
            We couldn't save your enquiry online right now. Please send it on WhatsApp — your
            details are already filled in.
          </p>
          <WhatsAppButton variant="link" message={status.wa} className="mt-2 font-medium">
            Send on WhatsApp
          </WhatsAppButton>
        </div>
      )}
      <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:items-center">
        <button
          type="submit"
          disabled={status.kind === "sending"}
          className="btn-primary justify-center rounded-lg disabled:opacity-70"
        >
          {status.kind === "sending" ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Sending…
            </>
          ) : (
            "Send enquiry"
          )}
        </button>
        <WhatsAppButton variant="outline" message={wholesaleMessage({})} className="rounded-lg">
          Enquire on WhatsApp
        </WhatsAppButton>
      </div>
    </form>
  );
}

function Field({
  id,
  label,
  optional = false,
  error,
  className,
  children,
}: {
  id: string;
  label: string;
  optional?: boolean;
  error?: string | undefined;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="text-sm font-medium">
        {label}
        {optional && <span className="ml-1 font-normal text-muted-foreground">(optional)</span>}
      </label>
      {children}
      {error && (
        <p id={`${id}-err`} className="mt-1.5 text-[13px] text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
