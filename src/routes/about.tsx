import { createFileRoute } from "@tanstack/react-router";
import aboutFounder from "@/assets/about-founder.jpeg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us - Preloved Finds" },
      {
        name: "description",
        content:
          "From Cairo's markets to your door - the story behind Preloved Finds, curated vintage streetwear.",
      },
      { property: "og:title", content: "About Us - Preloved Finds" },
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
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-end px-6 pb-12 md:px-12 md:pb-16">
          <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-white/70">
            Our Story
          </p>
          <h1 className="mt-3 max-w-2xl text-[40px] md:text-[48px] font-bold uppercase leading-tight tracking-tight text-white">
            From Cairo's markets to your door.
          </h1>
        </div>
      </section>

      {/* Story */}
      <section className="mx-auto max-w-3xl px-4 py-16 md:px-8 md:py-20">
        <div className="space-y-6 text-[15px] leading-relaxed text-[#374151]">
          <p className="text-[26px] md:text-[28px] font-bold uppercase tracking-tight text-[#1a1a1a]">
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

          <div className="border-l-4 border-[#1a1a1a] pl-5 italic text-[#1a1a1a]">
            "Every piece has a story. We're just the ones who find it."
          </div>

          <p className="font-semibold text-[#1a1a1a]">— Founder, Preloved Finds</p>
        </div>

        {/* CTA */}
        <div className="mt-14 text-center">
          <a
            href="/shop"
            className="inline-flex h-12 items-center justify-center bg-[#1a1a1a] text-white px-10 text-[12px] font-semibold uppercase tracking-widest hover:bg-[#6b7280] transition-colors"
          >
            Shop the Collection
          </a>
        </div>
      </section>
    </div>
  );
}
