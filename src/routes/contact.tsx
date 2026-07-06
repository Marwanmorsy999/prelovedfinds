import { createFileRoute } from "@tanstack/react-router";
import { Instagram, Mail } from "lucide-react";

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
  return (
    <div className="mx-auto max-w-3xl px-4 py-20 md:px-8">
      <p className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-rust">
        Get in touch
      </p>
      <h1 className="mt-2 font-display text-4xl uppercase tracking-tight text-ink md:text-6xl">
        Contact
      </h1>
      <p className="mt-4 max-w-xl text-sm text-grey">
        Questions about an order, sizing, or a specific piece? Send us a message and we'll get back
        to you — usually within a day.
      </p>

      <div className="mt-8 flex flex-wrap gap-6">
        <a
          href="mailto:hello@prelovedfinds.com"
          className="flex items-center gap-2 text-sm text-ink hover:opacity-60"
        >
          <Mail className="h-4 w-4" />
          hello@prelovedfinds.com
        </a>
        <a
          href="https://instagram.com/prelovedfinds"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 text-sm text-ink hover:opacity-60"
        >
          <Instagram className="h-4 w-4" />
          @prelovedfinds
        </a>
      </div>

      <form
        className="mt-12 space-y-6"
        onSubmit={(e) => {
          e.preventDefault();
          // TODO: wire this up to an actual email/form endpoint (Formspree,
          // Resend, a server function, etc). Currently front-end only.
        }}
      >
        <div className="grid gap-6 md:grid-cols-2">
          <Field label="Name" name="name" type="text" required />
          <Field label="Email" name="email" type="email" required />
        </div>
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-[0.2em] text-grey">
            Message
          </label>
          <textarea
            name="message"
            required
            rows={6}
            className="mt-2 w-full border border-hairline bg-transparent px-4 py-3 text-sm text-ink outline-none focus:border-ink"
          />
        </div>
        <button
          type="submit"
          className="border border-ink bg-ink px-8 py-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-background transition-colors hover:border-rust hover:bg-rust"
        >
          Send Message
        </button>
      </form>
    </div>
  );
}

function Field({
  label,
  name,
  type,
  required,
}: {
  label: string;
  name: string;
  type: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="text-[11px] font-semibold uppercase tracking-[0.2em] text-grey">
        {label}
      </label>
      <input
        name={name}
        type={type}
        required={required}
        className="mt-2 w-full border border-hairline bg-transparent px-4 py-3 text-sm text-ink outline-none focus:border-ink"
      />
    </div>
  );
}
