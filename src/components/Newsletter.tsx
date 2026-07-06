import { useState } from "react";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  return (
    <section className="border-t border-[#e5e7eb] bg-[#f9fafb]">
      <div className="mx-auto max-w-xl px-4 py-16 text-center md:px-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#9ca3af] mb-3">
          Newsletter
        </p>
        <h2 className="text-[24px] font-bold uppercase tracking-widest text-[#1a1a1a] mb-2">
          Sign up to access our fly community perks
        </h2>
        <p className="text-[13px] text-[#6b7280] mb-8">
          New drops, early access, and member-only pricing — straight to your inbox.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            setDone(true);
            setEmail("");
            setTimeout(() => setDone(false), 3000);
          }}
          className="flex flex-col sm:flex-row gap-2 max-w-sm mx-auto"
        >
          <input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 h-11 px-4 border border-[#e5e7eb] bg-white text-[13px] text-[#1a1a1a] outline-none focus:border-[#1a1a1a] transition-colors placeholder:text-[#9ca3af]"
            aria-label="Email address"
          />
          <button
            type="submit"
            className="h-11 px-6 bg-[#1a1a1a] text-white text-[12px] font-semibold uppercase tracking-widest hover:bg-black transition-colors whitespace-nowrap"
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
