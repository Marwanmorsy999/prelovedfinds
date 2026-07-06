import { createFileRoute } from "@tanstack/react-router";
import aboutFounder from "@/assets/about-founder.jpeg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us — Preloved Finds" },
      {
        name: "description",
        content:
          "From Cairo's markets to your door — the story behind Preloved Finds, curated vintage streetwear.",
      },
      { property: "og:title", content: "About Us — Preloved Finds" },
      { property: "og:description", content: "The story behind Preloved Finds." },
    ],
  }),
  component: About,
});

function About() {
  return (
    <div className="page-enter">
      {/* Hero */}
      <section className="relative h-[60vh] overflow-hidden">
        <img
          src={aboutFounder}
          alt="Founder at Cairo market"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/60 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-end px-6 pb-12 md:px-12 md:pb-16">
          <p className="font-mono text-[12px] font-medium uppercase tracking-[0.08em] text-paper/70">
            Our Story
          </p>
          <h1 className="mt-3 max-w-2xl font-display text-5xl font-bold uppercase leading-[1] tracking-tight text-paper md:text-[48px]">
            From Cairo's markets to your door.
          </h1>
        </div>
      </section>

      {/* Story */}
      <section className="mx-auto max-w-3xl px-4 py-20 md:px-8 md:py-20">
        <div className="space-y-6 text-base leading-relaxed text-ink/80">
          <p className="font-display text-3xl font-bold uppercase tracking-tight text-ink md:text-[28px]">
            Welcome to Preloved Finds.
          </p>

          <p>
            I started Preloved Finds because I couldn't find the pieces I wanted — vintage with
            soul, not just vintage for the sake of it. Every Friday morning, I'm at the markets
            outside Cairo, digging through piles of denim, band tees, and workwear. Looking for the
            one piece that tells a story.
          </p>

          <p>
            Each item here has been inspected, measured, and photographed by hand. We don't buy
            bulk. We don't source from wholesale lots. Every piece is individually selected for its
            character, condition, and place in fashion history.
          </p>

          <p>
            Vintage isn't a trend — it's an alternative to fast fashion. It's wearing something that
            existed before you, and will exist after. That's the feeling we're after.
          </p>

          <div className="border-l-3 border-rust pl-6 italic text-ink/90">
            "Every piece has a story. We're just the ones who find it."
          </div>

          <p className="font-medium text-ink">— Founder, Preloved Finds</p>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-3 gap-8 border-y border-concrete py-12 text-center">
          <div>
            <p className="font-display text-6xl font-extrabold text-ink md:text-[64px]">50+</p>
            <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.08em] text-concrete">
              Pieces Curated
            </p>
          </div>
          <div>
            <p className="font-display text-6xl font-extrabold text-ink md:text-[64px]">12</p>
            <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.08em] text-concrete">
              Countries Shipped To
            </p>
          </div>
          <div>
            <p className="font-display text-6xl font-extrabold text-ink md:text-[64px]">100%</p>
            <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.08em] text-concrete">
              Authentic Guaranteed
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <a
            href="/shop"
            className="group inline-flex items-center gap-2 font-mono text-[12px] font-medium uppercase tracking-[0.08em] text-ink transition-all hover:opacity-60"
          >
            Shop the collection
            <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">
              →
            </span>
          </a>
        </div>
      </section>
    </div>
  );
}
