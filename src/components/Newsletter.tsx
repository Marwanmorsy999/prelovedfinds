import { useState } from "react";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  return (
    <section className="border-y border-concrete bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-20 text-center md:px-8">
        <p className="font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-concrete">
          Newsletter
        </p>
        <h2 className="mt-4 font-display text-4xl font-bold uppercase tracking-tight text-ink md:text-5xl">
          Get first dibs.
        </h2>
        <p className="mx-auto mt-4 max-w-md text-base text-ink/70">
          New drops, restocks, and member-only pricing — straight to your inbox.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            setDone(true);
            setTimeout(() => setDone(false), 2000);
          }}
          className="mx-auto mt-8 flex max-w-md flex-col gap-3 md:flex-row"
        >
          <input
            type="email"
            required
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-12 flex-1 border border-concrete bg-paper px-4 text-[15px] text-ink outline-none transition-colors focus:border-ink placeholder:text-concrete"
            aria-label="Email address"
          />
          <button
            type="submit"
            className="h-12 border border-ink bg-ink px-8 font-mono text-[12px] font-medium uppercase tracking-[0.08em] text-paper transition-colors hover:bg-ink/90"
          >
            {done ? "Subscribed ✓" : "Subscribe"}
          </button>
        </form>

        <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.05em] text-concrete">
          No spam. Unsubscribe anytime.
        </p>
      </div>
    </section>
  );
}
