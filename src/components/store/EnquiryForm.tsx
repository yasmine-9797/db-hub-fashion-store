import { useState } from "react";
import { z } from "zod";
import { CheckCircle2 } from "lucide-react";
import { PHONES } from "@/lib/store-data";

const schema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(80),
  phone: z.string().trim().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
  business: z.string().trim().max(100).optional(),
  interest: z.string().min(1, "Choose a product interest"),
  quantity: z.string().min(1, "Choose an estimated quantity"),
  location: z.string().min(1, "Choose a preferred store"),
  message: z.string().trim().max(1000, "Max 1000 characters").optional(),
});
type Errors = Partial<Record<keyof z.infer<typeof schema>, string>>;

export function EnquiryForm() {
  const [errors, setErrors] = useState<Errors>({});
  const [done, setDone] = useState<string | null>(null);

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    const r = schema.safeParse(data);
    if (!r.success) {
      const errs: Errors = {};
      r.error.issues.forEach((i) => { errs[i.path[0] as keyof Errors] ??= i.message; });
      setErrors(errs);
      return;
    }
    setErrors({});
    setDone(r.data.name);
  };

  if (done) return (
    <div role="status" className="reveal border bg-card p-10">
      <CheckCircle2 className="h-8 w-8 text-primary" />
      <h3 className="display mt-4 text-3xl">Thank you, {done}.</h3>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        Your details look good. Note: this is a demo form — your enquiry has <strong>not</strong> been sent yet.
        For now, please call <a className="text-primary underline" href={`tel:${PHONES[0]}`}>{PHONES[0]}</a> or <a className="text-primary underline" href={`tel:${PHONES[1]}`}>{PHONES[1]}</a>.
      </p>
      <button onClick={() => setDone(null)} className="btn-outline mt-6">New enquiry</button>
    </div>
  );

  const a = (n: keyof Errors) => ({ id: n, name: n, "aria-invalid": !!errors[n], "aria-describedby": errors[n] ? `${n}-err` : undefined });

  return (
    <form onSubmit={submit} noValidate className="grid gap-6 sm:grid-cols-2">
      <F error={errors.name} name="name" label="Name *"><input {...a("name")} className="field" autoComplete="name" /></F>
      <F error={errors.phone} name="phone" label="Phone *"><input {...a("phone")} className="field" inputMode="numeric" autoComplete="tel" /></F>
      <F error={errors.business} name="business" label="Business name (optional)"><input {...a("business")} className="field" /></F>
      <F error={errors.interest} name="interest" label="Product interest *">
        <select {...a("interest")} className="field" defaultValue="">
          <option value="" disabled>Select</option>
          <option>Korean Edit</option><option>Unisex Collection</option><option>Women's Wear</option><option>Imported &amp; Surplus</option><option>Mixed</option>
        </select>
      </F>
      <F error={errors.quantity} name="quantity" label="Estimated quantity *">
        <select {...a("quantity")} className="field" defaultValue="">
          <option value="" disabled>Select</option>
          <option>Retail (1–5 pcs)</option><option>Small lot (6–50 pcs)</option><option>Wholesale (50–200 pcs)</option><option>Bulk (200+ pcs)</option>
        </select>
      </F>
      <F error={errors.location} name="location" label="Preferred location *">
        <select {...a("location")} className="field" defaultValue="">
          <option value="" disabled>Select</option><option>Chennai</option><option>Coimbatore</option><option>Either</option>
        </select>
      </F>
      <div className="sm:col-span-2">
        <F error={errors.message} name="message" label="Message"><textarea {...a("message")} rows={3} className="field resize-none" /></F>
      </div>
      <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:items-center">
        <button type="submit" className="btn-primary justify-center">Submit enquiry</button>
        <p className="text-xs text-muted-foreground">Demo form — not yet connected to email or messaging.</p>
      </div>
    </form>
  );
}

function F({ name, label, error, children }: { name: string; label: string; error?: string | undefined; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={name} className="eyebrow text-[0.6rem] text-muted-foreground">{label}</label>
      {children}
      {error && <p id={`${name}-err`} className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}
