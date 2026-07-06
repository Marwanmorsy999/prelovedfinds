import { useState } from "react";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  return (
    <section className="border-y border-hairline bg-background">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-16 md:grid-cols-2 md:items-center md:px-8">
        <div>
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-rust">Newsletter</p>
          <h2 className="mt-3 font-display text-2xl uppercase tracking-tight text-ink md:text-4xl">Sign up to access our fly community perks.</h2>
        </div>
        <form
          onSubmit={(e) => { e.preventDefault(); setDone(true); }}
          className="flex border border-ink"
        >
          <input
            type="email"
            required
            placeholder="Your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 bg-transparent px-4 py-3 text-sm text-ink placeholder:text-grey outline-none"
          />
          <button
            type="submit"
            className="border-l border-ink bg-ink px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-background transition-colors hover:bg-rust"
          >
            {done ? "Subscribed" : "Subscribe"}
          </button>
        </form>
      </div>
    </section>
  );
}
