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
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-ink/40" />
          <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-background/80">Our Story</p>
            <h1 className="mt-4 text-4xl font-semibold uppercase leading-tight text-background md:text-6xl">
              About Us
            </h1>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-20 md:px-8">
        <div className="space-y-6 text-[15px] leading-relaxed text-ink md:text-base">
          <p className="text-lg font-semibold md:text-xl">Welcome to Preloved Finds.</p>

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
            className="border border-ink bg-transparent px-8 py-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-ink hover:bg-ink hover:text-background"
          >
            Shop All
          </Link>
        </div>
      </section>
    </div>
  );
}
