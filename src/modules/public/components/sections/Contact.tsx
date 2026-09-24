import { useState, type FormEvent } from "react";
import { CheckCircle2, Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import { getApiErrorMessage } from "@/shared/api/http";
import { toast } from "@/shared/lib/toast";
import { publicApi } from "../../api/publicApi";
import type { WebsiteContact } from "../../types";
import { SectionHeading, btnPrimary, card, container } from "../ui";

const input =
  "w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-[15px] text-slate-900 placeholder:text-slate-400 transition focus:border-[var(--site-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--site-primary-glow)]";

const EMPTY = { name: "", email: "", phone: "", company: "", message: "", website: "" };

function ContactForm() {
  const [form, setForm] = useState(EMPTY);
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);

  const set = (k: keyof typeof EMPTY) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e: FormEvent) {
    e.preventDefault();
    setPending(true);
    try {
      await publicApi.contact({ ...form, website: "" });
      setSent(true);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setPending(false);
    }
  }

  if (sent) {
    return (
      <div
        className={cn(card, "flex h-full flex-col items-center justify-center py-16 text-center")}
      >
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <CheckCircle2 className="h-7 w-7" aria-hidden="true" />
        </span>
        <h3 className="mt-5 text-xl font-bold text-slate-900">Thanks, we have your message</h3>
        <p className="mt-2 max-w-sm text-[15px] text-slate-600">
          Someone from the team will get back to you shortly.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className={cn(card, "space-y-4")} noValidate={false}>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium text-slate-700">
          Full name
          <input
            required
            value={form.name}
            onChange={set("name")}
            className={cn(input, "mt-1.5")}
            autoComplete="name"
          />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Work email
          <input
            required
            type="email"
            value={form.email}
            onChange={set("email")}
            className={cn(input, "mt-1.5")}
            autoComplete="email"
          />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Phone <span className="font-normal text-slate-400">(optional)</span>
          <input
            type="tel"
            value={form.phone}
            onChange={set("phone")}
            className={cn(input, "mt-1.5")}
            autoComplete="tel"
          />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Company <span className="font-normal text-slate-400">(optional)</span>
          <input
            value={form.company}
            onChange={set("company")}
            className={cn(input, "mt-1.5")}
            autoComplete="organization"
          />
        </label>
      </div>
      <label className="block text-sm font-medium text-slate-700">
        How do leads reach you today?
        <textarea
          required
          rows={4}
          value={form.message}
          onChange={set("message")}
          className={cn(input, "mt-1.5 resize-y")}
        />
      </label>
      {/* Honeypot: invisible to people, tempting to bots. Always submitted as "". */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Website
          <input
            tabIndex={-1}
            autoComplete="off"
            value={form.website}
            onChange={set("website")}
            name="website"
          />
        </label>
      </div>
      <button
        type="submit"
        disabled={pending}
        className={cn(btnPrimary, "w-full disabled:opacity-60")}
      >
        {pending ? "Sending…" : "Send message"}
      </button>
      <p className="text-center text-xs text-slate-500">
        No spam. We reply within one business day.
      </p>
    </form>
  );
}

export function Contact({ contact }: { contact: WebsiteContact }) {
  const rows = [
    { icon: Phone, label: contact.phone, href: contact.phone ? `tel:${contact.phone}` : "" },
    { icon: Mail, label: contact.email, href: contact.email ? `mailto:${contact.email}` : "" },
    {
      icon: MessageCircle,
      label: contact.whatsapp ? `WhatsApp ${contact.whatsapp}` : "",
      href: contact.whatsapp ? `https://wa.me/${contact.whatsapp.replace(/\D/g, "")}` : "",
    },
    { icon: MapPin, label: contact.address, href: "" },
    { icon: Clock, label: contact.businessHours, href: "" },
  ].filter((r) => r.label);

  return (
    <section id="contact" className="relative bg-slate-50 py-20 sm:py-24">
      <div className={cn(container, "grid gap-12 lg:grid-cols-[1fr_1.05fr]")}>
        <div>
          <SectionHeading
            eyebrow="Contact"
            title={contact.title}
            description={contact.description}
          />
          {rows.length > 0 && (
            <ul className="mt-8 space-y-4">
              {rows.map(({ icon: RowIcon, label, href }) => (
                <li key={label} className="flex items-start gap-3 text-[15px] text-slate-700">
                  <RowIcon
                    className="mt-0.5 h-5 w-5 shrink-0 text-[var(--site-primary)]"
                    aria-hidden="true"
                  />
                  {href ? (
                    <a
                      href={href}
                      className="hover:underline"
                      target={href.startsWith("http") ? "_blank" : undefined}
                      rel="noopener noreferrer"
                    >
                      {label}
                    </a>
                  ) : (
                    <span className="whitespace-pre-line">{label}</span>
                  )}
                </li>
              ))}
            </ul>
          )}
          {contact.socialLinks?.length > 0 && (
            <ul className="mt-8 flex flex-wrap gap-2">
              {contact.socialLinks.map((s) => (
                <li key={s.url + s.label}>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-9 items-center rounded-full border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
        {contact.formEnabled && <ContactForm />}
      </div>
    </section>
  );
}
