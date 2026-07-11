import { createFileRoute, Link } from "@tanstack/react-router";
import { Instagram, MessageCircle } from "lucide-react";
import { useState } from "react";
import { useSettings } from "@/lib/settings-context";
import { submitContactFn } from "@/lib/functions/contact";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact - Preloved Finds" },
      {
        name: "description",
        content:
          "Get in touch with Preloved Finds — questions about an order, a piece, or a custom request.",
      },
    ],
  }),
  component: Contact,
});

function Contact() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const { whatsapp } = useSettings();
  const waHref = whatsapp ? `https://wa.me/${whatsapp.replace(/[^0-9]/g, "")}` : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await submitContactFn({
        data: { name: formData.name, email: formData.email, message: formData.message },
      });
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <div className="page-enter mx-auto flex max-w-2xl flex-col items-center justify-center px-4 py-24 text-center md:px-8">
        <div className="border border-[#bbf7d0] bg-[#f0fdf4] px-6 py-4 mb-6">
          <p className="text-[12px] font-semibold uppercase tracking-widest text-[#16a34a]">
            Message sent ✓
          </p>
        </div>
        <p className="text-[14px] text-concrete">We'll get back to you within 24 hours.</p>
        <Link
          to="/"
          className="mt-8 inline-flex h-11 items-center justify-center border border-[#1a1a1a] px-8 text-[12px] font-semibold uppercase tracking-widest text-ink hover:bg-[#1a1a1a] hover:text-white transition-colors"
        >
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="page-enter">
      {/* Header */}
      <div className="border-b border-hairline px-4 py-8 md:px-8">
        <div className="mx-auto max-w-2xl">
          <p className="text-[11px] uppercase tracking-[0.2em] text-concrete mb-1">Support</p>
          <h1 className="text-[28px] font-bold uppercase tracking-widest text-ink">
            Contact Us
          </h1>
          <p className="mt-2 text-[14px] text-concrete">
            Questions about an order, sizing, or a specific piece? We'll get back to you within 24
            hours.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-12 md:px-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
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
              className="block text-[11px] font-semibold uppercase tracking-widest text-ink mb-2"
            >
              Message <span className="text-[#dc2626]">*</span>
            </label>
            <textarea
              id="message"
              required
              rows={6}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="w-full border border-hairline bg-white px-4 py-3 text-[14px] text-ink outline-none focus:border-[#1a1a1a] transition-colors resize-none"
            />
          </div>

          {error && (
            <div className="border border-[#fecaca] bg-[#fef2f2] px-4 py-3">
              <p className="text-[12px] text-[#dc2626]">{error}</p>
            </div>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="h-12 bg-[#1a1a1a] text-white px-10 text-[12px] font-semibold uppercase tracking-widest hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Sending..." : "Send Message"}
          </button>
        </form>

        {/* Direct contact */}
        <div className="mt-14 border-t border-hairline pt-10">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-concrete mb-5">
            Or reach us directly
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:gap-8">
            <a
              href="https://www.instagram.com/preloved.finds._"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2.5 text-[13px] text-ink hover:text-concrete transition-colors"
            >
              <Instagram className="h-4 w-4" />
              @preloved.finds._
            </a>
            {waHref && (
              <a
                href={waHref}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2.5 text-[13px] text-ink hover:text-concrete transition-colors"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </a>
            )}
          </div>
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
        className="block text-[11px] font-semibold uppercase tracking-widest text-ink mb-2"
      >
        {label}
        {required && <span className="text-[#dc2626] ml-1">*</span>}
      </label>
      <input
        id={id}
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-hairline bg-white px-4 py-3 text-[14px] text-ink outline-none focus:border-[#1a1a1a] transition-colors"
      />
    </div>
  );
}
