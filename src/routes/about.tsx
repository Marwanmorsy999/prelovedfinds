import { createFileRoute, Link } from "@tanstack/react-router";
import aboutPhoto from "@/assets/about-founder.jpeg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us — Preloved Finds" },
      {
        name: "description",
        content: "From zero to hero — the story behind Preloved Finds, curated vintage streetwear from Cairo.",
      },
      { property: "og:title", content: "About Us — Preloved Finds" },
      { property: "og:description", content: "The story behind Preloved Finds." },
    ],
  }),
  component: About,
});

function About() {
  return (
    <div>
      <section className="relative">
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-surface md:aspect-[21/9]">
          <img
            src={aboutPhoto}
            alt="Preloved Finds founder setting up a vintage clothing stall outdoors"
            className="h-full w-full object-cover grayscale-[15%] contrast-[1.05]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/25 to-rust/25 mix-blend-multiply" />
          <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.3em] text-paper/80">Our Story</p>
            <h1 className="mt-4 font-display text-5xl uppercase tracking-tight text-paper md:text-8xl">
              About Us
            </h1>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-20 md:px-8">
        <div className="space-y-6 text-[15px] leading-relaxed text-ink md:text-base">
          <p className="font-display text-2xl uppercase tracking-tight text-rust md:text-3xl">
            Welcome to Preloved Finds.
          </p>

          <p>
            From zero to hero — a boy who started with nothing. That journey is the inspiration
            behind Preloved Finds, and the passion to build something meaningful.
          </p>

          <p>
            We curate unique vintage pieces with a focus on timeless style, quality, and
            authenticity. Our goal is to make it easier for vintage lovers to discover standout
            items from different eras, all in one place.
          </p>

          <p>Every piece is selected with care to offer something distinctive and full of character.</p>

          <p className="pt-4 font-medium">Thank you for visiting Preloved Finds.</p>
        </div>

        <div className="mt-14 flex justify-center">
          <Link
            to="/shop"
            className="border border-ink bg-transparent px-8 py-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-ink transition-colors hover:border-rust hover:bg-rust hover:text-paper"
          >
            Shop All
          </Link>
        </div>
      </section>
    </div>
  );
}
