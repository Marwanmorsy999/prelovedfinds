import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms & Policies - Preloved Finds" },
      { name: "description", content: "Terms and policies for Preloved Finds." },
    ],
  }),
  component: Terms,
});

function Terms() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-20">
      <div className="text-center max-w-lg">
        <h1 className="text-[28px] font-bold uppercase tracking-widest text-ink mb-4">
          Terms & Policies
        </h1>
        <p className="text-[14px] text-concrete leading-relaxed">
          Coming soon. We're putting the finishing touches on our terms and policies.
        </p>
      </div>
    </div>
  );
}