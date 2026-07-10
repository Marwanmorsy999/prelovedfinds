import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { ArrowLeft, Phone, MapPin, User, ChevronDown, Shield, Truck } from "lucide-react";
import { useCart } from "@/lib/cart";
import { createOrderFn } from "@/lib/functions/orders";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout - Preloved Finds" },
      { name: "description", content: "Complete your order." },
    ],
  }),
  component: Checkout,
});

const EGYPTIAN_GOVERNORATES = [
  "Alexandria",
  "Aswan",
  "Asyut",
  "Beheira",
  "Beni Suef",
  "Cairo",
  "Dakahlia",
  "Damietta",
  "Faiyum",
  "Gharbia",
  "Giza",
  "Ismailia",
  "Kafr El Sheikh",
  "Luxor",
  "Matrouh",
  "Minya",
  "Monufia",
  "New Valley",
  "North Sinai",
  "Port Said",
  "Qalyubia",
  "Qena",
  "Red Sea",
  "Sharqia",
  "Sohag",
  "South Sinai",
  "Suez",
];

const SHIPPING_ZONES: Record<string, number> = {
  // 100 EGP zone — Greater Cairo, Delta, Canal cities, Alexandria
  Cairo: 100,
  Giza: 100,
  Qalyubia: 100,
  Alexandria: 100,
  Beheira: 100,
  Monufia: 100,
  Gharbia: 100,
  "Kafr El Sheikh": 100,
  Dakahlia: 100,
  Sharqia: 100,
  Damietta: 100,
  "Port Said": 100,
  Ismailia: 100,
  Suez: 100,
  // 150 EGP zone — Upper Egypt, desert governorates, Sinai
  "Beni Suef": 150,
  Faiyum: 150,
  Minya: 150,
  Asyut: 150,
  Sohag: 150,
  Qena: 150,
  Luxor: 150,
  Aswan: 150,
  "Red Sea": 150,
  "New Valley": 150,
  Matrouh: 150,
  "North Sinai": 150,
  "South Sinai": 150,
};

function Checkout() {
  const { items, clear, count } = useCart();
  const navigate = useNavigate();
  const [placing, setPlacing] = useState(false);
  const [name, setName] = useState(() => sessionStorage.getItem("checkout_name") ?? "");
  const [phone, setPhone] = useState(() => sessionStorage.getItem("checkout_phone") ?? "");
  const [governorate, setGovernorate] = useState(() => sessionStorage.getItem("checkout_governorate") ?? "");
  const [address, setAddress] = useState(() => sessionStorage.getItem("checkout_address") ?? "");
  const persistRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Persist non-payment fields to sessionStorage debounced at 200ms
  useEffect(() => {
    if (persistRef.current) clearTimeout(persistRef.current);
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    persistRef.current = setTimeout(() => {
      try {
        sessionStorage.setItem("checkout_name", name);
        sessionStorage.setItem("checkout_phone", phone);
        sessionStorage.setItem("checkout_governorate", governorate);
        sessionStorage.setItem("checkout_address", address);
      } catch {
        // ignore
      }
    }, 200);
  }, [name, phone, governorate, address]);

  const subtotal = items.reduce((sum, i) => sum + i.price, 0);
  const shippingCost = governorate ? (SHIPPING_ZONES[governorate] ?? 100) : 0;
  const total = subtotal + shippingCost;

  const validateForm = () => {
    if (!name.trim()) {
      toast.error("Please enter your full name");
      return false;
    }
    if (!phone.trim()) {
      toast.error("Please enter your phone number");
      return false;
    }
    if (!/^01[0125]\d{8}$/.test(phone)) {
      toast.error("Enter a valid Egyptian phone number (01xxxxxxxxx)");
      return false;
    }
    if (!governorate) {
      toast.error("Please select your governorate");
      return false;
    }
    if (!address.trim()) {
      toast.error("Please enter your delivery address");
      return false;
    }
    if (!count) {
      toast.error("Your cart is empty");
      return false;
    }
    return true;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setPlacing(true);
    try {
      const orderId = `ORD-${Date.now()}`;
      await createOrderFn({
        data: {
          id: orderId,
          // Only product IDs are sent — the server looks up current price,
          // size, and availability itself so the order total can't be
          // manipulated by a client (see src/lib/functions/orders.ts).
          items: items.map((i) => ({ id: i.id })),
          customerName: name.trim(),
          customerPhone: phone.trim(),
          governorate,
          address: address.trim(),
        },
      });
      clear();
      toast.success("Order placed successfully! We'll contact you soon.");
      navigate({
        to: "/order-confirmation",
        search: { orderId },
      });
    } catch (err) {
      console.error("Failed to place order:", err);
      toast.error(err instanceof Error ? err.message : "Failed to place order. Try again.");
    } finally {
      setPlacing(false);
    }
  };

  if (!count) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#f5f5f5]">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#9ca3af"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 01-8 0" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[#1a1a1a] mb-2">Your cart is empty</h1>
          <p className="text-[14px] text-[#6b7280] mb-8">Add some vintage pieces to get started.</p>
          <button
            onClick={() =>
              navigate({
                to: "/shop",
                search: {
                  tag: "all",
                  size: "all",
                  condition: "all",
                  priceRange: "all",
                  sort: "newest",
                  q: "",
                  pages: 1,
                },
              })
            }
            className="inline-flex h-12 items-center justify-center bg-[#1a1a1a] text-white px-10 text-[12px] font-bold uppercase tracking-widest hover:bg-[#6b7280] transition-colors"
          >
            Shop All
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Top bar */}
      <div className="border-b border-[#e5e7eb] bg-white">
        <div className="mx-auto max-w-5xl px-4 py-4 md:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() =>
                navigate({
                  to: "/shop",
                  search: {
                    tag: "all",
                    size: "all",
                    condition: "all",
                    priceRange: "all",
                    sort: "newest",
                    q: "",
                    pages: 1,
                  },
                })
              }
              className="p-1.5 text-[#6b7280] hover:text-[#1a1a1a] transition-colors rounded-lg hover:bg-[#f5f5f5]"
              aria-label="Back to shop"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="h-5 w-px bg-[#e5e7eb]" />
            <p className="text-[13px] font-semibold text-[#1a1a1a] tracking-tight">Checkout</p>
          </div>
        </div>
      </div>

      <form onSubmit={submit} className="mx-auto max-w-5xl px-4 py-8 md:px-8 md:py-12">
        <div className="grid gap-8 lg:grid-cols-[1fr_380px] lg:gap-12">
          {/* Left column — form */}
          <div className="space-y-8">
            {/* Shipping information */}
            <div className="bg-white rounded-xl border border-[#e5e7eb] overflow-hidden">
              <div className="px-6 py-5 border-b border-[#e5e7eb]">
                <div className="flex items-center gap-2.5">
                  <Truck className="h-4 w-4 text-[#6b7280]" />
                  <h2 className="text-[13px] font-bold uppercase tracking-widest text-[#1a1a1a]">
                    Shipping Information
                  </h2>
                </div>
              </div>
              <div className="px-6 py-6 space-y-5">
                {/* Full Name */}
                <div>
                  <label
                    htmlFor="name"
                    className="block text-[13px] font-semibold text-[#1a1a1a] mb-1.5"
                  >
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9ca3af]" />
                    <input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your full name"
                      className="w-full h-12 border border-[#e5e7eb] bg-white pl-10 pr-4 text-[14px] text-[#1a1a1a] outline-none focus:border-[#1a1a1a] focus:ring-1 focus:ring-[#1a1a1a]/10 transition-all rounded-lg placeholder:text-[#9ca3af]"
                    />
                  </div>
                </div>

                {/* Phone Number */}
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-[13px] font-semibold text-[#1a1a1a] mb-1.5"
                  >
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9ca3af]" />
                    <input
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="01xxxxxxxxx"
                      className="w-full h-12 border border-[#e5e7eb] bg-white pl-10 pr-4 text-[14px] text-[#1a1a1a] outline-none focus:border-[#1a1a1a] focus:ring-1 focus:ring-[#1a1a1a]/10 transition-all rounded-lg placeholder:text-[#9ca3af]"
                    />
                  </div>
                </div>

                {/* Governorate */}
                <div>
                  <label
                    htmlFor="governorate"
                    className="block text-[13px] font-semibold text-[#1a1a1a] mb-1.5"
                  >
                    Governorate
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9ca3af] z-10" />
                    <select
                      id="governorate"
                      value={governorate}
                      onChange={(e) => setGovernorate(e.target.value)}
                      className="w-full h-12 appearance-none border border-[#e5e7eb] bg-white pl-10 pr-10 text-[14px] text-[#1a1a1a] outline-none focus:border-[#1a1a1a] focus:ring-1 focus:ring-[#1a1a1a]/10 transition-all rounded-lg cursor-pointer"
                    >
                      <option value="">Select governorate</option>
                      {EGYPTIAN_GOVERNORATES.map((g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9ca3af]" />
                  </div>
                  {governorate && (
                    <p className="mt-1.5 text-[12px] text-[#6b7280] flex items-center gap-1">
                      <Truck className="h-3 w-3" />
                      Shipping to <strong>{governorate}</strong>: LE {shippingCost.toLocaleString()}
                    </p>
                  )}
                </div>

                {/* Full Address */}
                <div>
                  <label
                    htmlFor="address"
                    className="block text-[13px] font-semibold text-[#1a1a1a] mb-1.5"
                  >
                    Full Delivery Address
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-3.5 h-4 w-4 text-[#9ca3af]" />
                    <textarea
                      id="address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Street name, building number, apartment, landmark..."
                      rows={3}
                      className="w-full border border-[#e5e7eb] bg-white pl-10 pr-4 py-3 text-[14px] text-[#1a1a1a] outline-none focus:border-[#1a1a1a] focus:ring-1 focus:ring-[#1a1a1a]/10 transition-all rounded-lg placeholder:text-[#9ca3af] resize-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Trust indicators */}
            <div className="bg-white rounded-xl border border-[#e5e7eb] px-6 py-5">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-[#9ca3af] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-[12px] font-semibold text-[#1a1a1a] mb-0.5">Secure Checkout</p>
                  <p className="text-[12px] text-[#6b7280] leading-relaxed">
                    Your information is safe. We'll contact you via WhatsApp to confirm your order.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right column — order summary */}
          <div className="lg:sticky lg:top-8 lg:self-start">
            <div className="bg-white rounded-xl border border-[#e5e7eb] overflow-hidden">
              <div className="px-6 py-5 border-b border-[#e5e7eb]">
                <h2 className="text-[13px] font-bold uppercase tracking-widest text-[#1a1a1a]">
                  Order Summary
                </h2>
              </div>

              <div className="px-6 py-5 space-y-4">
                {/* Items */}
                <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium text-[#1a1a1a] truncate">
                          {item.name}
                        </p>
                        {item.size && (
                          <p className="text-[11px] text-[#9ca3af] mt-0.5">Size: {item.size}</p>
                        )}
                        <p className="text-[11px] text-[#9ca3af]">Qty 1</p>
                      </div>
                      <p className="text-[13px] font-medium text-[#1a1a1a] whitespace-nowrap">
                        LE {item.price.toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="px-6 py-5 border-t border-[#e5e7eb] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] text-[#6b7280]">Subtotal</span>
                  <span className="text-[13px] text-[#1a1a1a]">LE {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[13px] text-[#6b7280]">Shipping</span>
                  <span className="text-[13px] text-[#1a1a1a] font-medium">
                    {governorate ? `LE ${shippingCost.toLocaleString()}` : "—"}
                  </span>
                </div>
                <div className="border-t border-[#e5e7eb] pt-3 flex items-center justify-between">
                  <span className="text-[14px] font-bold text-[#1a1a1a]">Total</span>
                  <span className="text-[18px] font-bold text-[#1a1a1a]">
                    LE {total.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Place order button */}
              <div className="px-6 pb-6">
                <button
                  type="submit"
                  disabled={placing || !governorate}
                  className="w-full h-13 bg-[#1a1a1a] text-white text-[13px] font-bold uppercase tracking-widest rounded-lg hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  style={{ height: "52px" }}
                >
                  {placing ? (
                    <>
                      <span className="inline-block h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      Placing Order...
                    </>
                  ) : (
                    "Place Order"
                  )}
                </button>
                <p className="text-[11px] text-[#9ca3af] text-center mt-3">
                  You'll receive a WhatsApp confirmation after ordering.
                </p>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}