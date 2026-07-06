import { createFileRoute } from "@tanstack/react-router";
import { Mail, Instagram } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Preloved Finds" },
      {
        name: "description",
        content:
          "Get in touch with Preloved Finds — questions about an order, a piece, or a custom request.",
      },
      { property: "og:title", content: "Contact — Preloved Finds" },
      { property: "og:description", content: "Get in touch with Preloved Finds." },
    ],
  }),
  component: Contact,
});

function Contact() {
  const [sent, setSent] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: wire to actual email endpoint (Formspree, Resend, etc.)
    console.log("Contact form submitted:", formData);
    setSent(true);
  };

  if (sent) {
    return (
      <div className="page-enter mx-auto flex max-w-3xl flex-col items-center justify-center px-4 py-20 text-center md:px-8">
        <div className="border border-olive bg-olive/10 px-6 py-4">
          <p className="font-mono text-[12px] font-medium uppercase tracking-[0.08em] text-olive">
            Message sent ✓
          </p>
        </div>
        <p className="mt-6 text-base text-ink/70">We'll get back to you within 24 hours.</p>
        <a
          href="/"
          className="group mt-8 inline-flex items-center gap-2 font-mono text-[12px] font-medium uppercase tracking-[0.08em] text-ink transition-all hover:opacity-60"
        >
          Back home
          <span className="inline-block transition-transform duration-200 group-hover:-translate-x-1">
            ←
          </span>
        </a>
      </div>
    );
  }

  return (
    <div className="page-enter mx-auto max-w-3xl px-4 py-20 md:px-8">
      <p className="font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-concrete">
        Get in touch
      </p>
      <h1 className="mt-2 font-display text-5xl font-bold uppercase tracking-tight text-ink md:text-[48px]">
        Contact
      </h1>
      <p className="mt-4 max-w-xl text-base text-ink/70">
        Questions about an order, sizing, or a specific piece? We'll get back to you within 24
        hours.
      </p>

      <form onSubmit={handleSubmit} className="mt-12 max-w-lg space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <Field
            label="Name"
            id="name"
            value={formData.name}
            onChange={(v) => setFormData({ ...formData, name: v })}
            required
          />
          <Field
            label="Email"
            id="email"
            type="email"
            value={formData.email}
            onChange={(v) => setFormData({ ...formData, email: v })}
            required
          />
        </div>

        <Field
          label="Subject"
          id="subject"
          value={formData.subject}
          onChange={(v) => setFormData({ ...formData, subject: v })}
        />

        <div>
          <label
            htmlFor="message"
            className="font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-ink"
          >
            Message
          </label>
          <textarea
            id="message"
            required
            rows={6}
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            className="mt-2 w-full border border-concrete bg-paper px-4 py-3 text-[15px] text-ink outline-none transition-colors focus:border-ink"
          />
        </div>

        <button
          type="submit"
          className="h-12 border border-ink bg-ink px-8 font-mono text-[12px] font-medium uppercase tracking-[0.08em] text-paper transition-colors hover:bg-ink/90"
        >
          Send Message
        </button>
      </form>

      {/* Direct contact */}
      <div className="mt-16 border-t border-concrete pt-8">
        <p className="mb-4 font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-concrete">
          Or reach us directly
        </p>
        <div className="flex flex-wrap gap-6">
          <a
            href="mailto:hello@prelovedfinds.com"
            className="flex items-center gap-2 text-sm text-ink hover:opacity-60 transition-opacity"
          >
            <Mail className="h-4 w-4" />
            hello@prelovedfinds.com
          </a>
          <a
            href="https://instagram.com/prelovedfinds"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 text-sm text-ink hover:opacity-60 transition-opacity"
          >
            <Instagram className="h-4 w-4" />
            @prelovedfinds
          </a>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  id,
  type = "text",
  value,
  onChange,
  required,
}: {
  label: string;
  id: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-ink"
      >
        {label}
        {required && <span className="text-rust"> *</span>}
      </label>
      <input
        id={id}
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full border border-concrete bg-paper px-4 py-3 text-[15px] text-ink outline-none transition-colors focus:border-ink"
      />
    </div>
  );
}
