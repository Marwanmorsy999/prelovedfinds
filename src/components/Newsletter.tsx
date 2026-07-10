import { useState } from "react";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  return (
    <section className="border-t border-hairline bg-bg-light">
      <div className="mx-auto max-w-xl px-4 py-16 text-center md:px-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#9ca3af] mb-3">
          Newsletter
        </p>
        <h2 className="text-[24px] font-bold uppercase tracking-widest text-ink mb-2">
          Sign up to access our fly community perks
        </h2>
        <p className="text-[13px] text-concrete mb-8">
          New drops, early access, and member-only pricing — straight to your inbox.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            setDone(true);
            setEmail("");
            setTimeout(() => setDone(false), 3000);
          }}
          className="flex max-w-[420px]"
        >
          <input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 bg-white text-[#111] border border-[#111] border-r-0 px-4 py-3 text-[14px] outline-none focus:border-[#2d2d2d] transition-colors placeholder:text-[#a09880] placeholder:opacity-100 rounded-none"
            aria-label="Email address"
          />
          <button
            type="submit"
            className="bg-[#111] text-white border border-[#111] px-5 py-3 text-[13px] font-bold uppercase tracking-widest hover:bg-[#2d2d2d] transition-colors cursor-pointer rounded-none whitespace-nowrap"
          >
            {done ? "Subscribed ✓" : "Subscribe"}
          </button>
        </form>

        <p className="mt-4 text-[11px] text-[#9ca3af] uppercase tracking-widest">
          No spam. Unsubscribe anytime.
        </p>
      </div>
    </section>
  );
}
