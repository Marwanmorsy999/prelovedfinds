import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/order-confirmation")({
  head: () => ({
    meta: [
      { title: "Order Confirmed - Preloved Finds" },
      { name: "description", content: "Your order has been placed." },
    ],
  }),
  validateSearch: (search: Record<string, unknown>) => ({
    orderId: typeof search.orderId === "string" ? search.orderId : "",
  }),
  component: OrderConfirmation,
});

function OrderConfirmation() {
  const { orderId } = Route.useSearch();

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-20">
      <div className="text-center max-w-md">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#f0fdf4]">
          <CheckCircle2 className="h-8 w-8 text-[#16a34a]" strokeWidth={1.5} />
        </div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#9ca3af] mb-2">
          Thank you
        </p>
        <h1 className="text-2xl font-bold text-[#1a1a1a] mb-2">Order confirmed</h1>
        <p className="text-[14px] text-[#6b7280] mb-6">
          We'll contact you via WhatsApp to confirm your order and arrange delivery.
        </p>
        {orderId && (
          <div className="inline-flex items-center gap-2 border border-[#e5e7eb] bg-white px-4 py-2 mb-8">
            <span className="text-[11px] uppercase tracking-widest text-[#9ca3af]">Order</span>
            <span className="text-[13px] font-semibold text-[#1a1a1a]">{orderId}</span>
          </div>
        )}
        <div>
          <Link
            to="/shop"
            search={{
              tag: "all",
              condition: "all",
              priceRange: "all",
              sort: "newest",
              q: "",
              page: 1,
            }}
            className="inline-flex h-12 items-center justify-center bg-[#1a1a1a] text-white px-10 text-[12px] font-bold uppercase tracking-widest hover:bg-[#6b7280] transition-colors"
          >
            Continue Shopping
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
