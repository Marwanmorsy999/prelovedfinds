import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Phone, MapPin } from "lucide-react";
import { useCart } from "@/lib/cart";
import { createOrderFn } from "@/lib/functions/orders";

const GOVERNORATES = [
  "Cairo",
  "Giza",
  "Alexandria",
  "Dakahlia",
  "Red Sea",
  "Beheira",
  "Fayoum",
  "Gharbia",
  "Ismailia",
  "Menofia",
  "Minya",
  "Qaliubiya",
  "New Valley",
  "Suez",
  "Aswan",
  "Asyut",
  "Beni Suef",
  "Port Said",
  "Damietta",
  "Sharkia",
  "South Sinai",
  "Kafr El Sheikh",
  "Matrouh",
  "Luxor",
  "Qena",
  "North Sinai",
  "Sohag",
];

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout - Preloved Finds" },
      { name: "description", content: "Complete your order." },
    ],
  }),
  component: Checkout,
});

function Checkout() {
  const { items, clear, count } = useCart();
  const navigate = useNavigate();
  const [placing, setPlacing] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [governorate, setGovernorate] = useState(GOVERNORATES[0]);
  const [address, setAddress] = useState("");

  const subtotal = items.reduce((sum, i) => sum + i.price, 0);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !address.trim() || !governorate.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    if (!/^01[0-2,5]{1}[0-9]{7}$/.test(phone)) {
      toast.error("Enter a valid Egyptian phone number (01xxxxxxxxx)");
      return;
    }
    if (!count) {
      toast.error("Your cart is empty");
      return;
    }
    setPlacing(true);
    try {
      const orderId = `ORD-${Date.now()}`;
      await createOrderFn({
        data: {
          id: orderId,
          items: items.map((i) => ({ id: i.id, title: i.title, price: i.price, quantity: 1 })),
          customerName: name.trim(),
          customerPhone: phone.trim(),
          governorate,
          address: address.trim(),
          subtotal,
        },
      });
      clear();
      toast.success("Order placed successfully");
      navigate({ to: "/" });
    } catch {
      toast.error("Failed to place order. Try again.");
    } finally {
      setPlacing(false);
    }
  };

  if (!count) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#9ca3af] mb-2">
          Checkout
        </p>
        <h1 className="text-[20px] font-bold uppercase tracking-widest text-[#1a1a1a] mb-4">
          No items yet
        </h1>
        <button
          onClick={() => navigate({ to: "/shop" })}
          className="h-11 bg-[#1a1a1a] text-white px-8 text-[12px] font-bold uppercase tracking-widest hover:bg-[#6b7280] transition-colors"
        >
          Shop All
        </button>
      </div>
    );
  }

  return (
    <div className="page-enter">
      <div className="border-b border-[#e5e7eb] px-4 py-6 md:px-8">
        <div className="mx-auto max-w-7xl flex items-center gap-3">
          <button
            onClick={() => navigate({ to: "/shop" })}
            className="p-1 text-[#6b7280] hover:text-[#1a1a1a] transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <p className="text-[11px] font-bold uppercase tracking-widest text-[#9ca3af]">Checkout</p>
        </div>
      </div>

      <form onSubmit={submit} className="mx-auto max-w-7xl px-4 py-10 md:px-8">
        <div className="grid gap-10 md:grid-cols-[1fr_320px]">
          <div className="space-y-8">
            <section>
              <h2 className="text-[11px] font-bold uppercase tracking-widest text-[#6b7280] mb-4">
                Contact
              </h2>
              <div className="grid gap-4">
                <div>
                  <label className="block text-[12px] font-semibold text-[#1a1a1a] mb-1.5">
                    Full name
                  </label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="w-full border border-[#e5e7eb] bg-white px-4 py-3 text-[14px] text-[#1a1a1a] outline-none focus:border-[#1a1a1a] transition-colors placeholder:text-[#9ca3af]"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-[#1a1a1a] mb-1.5">
                    Phone number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9ca3af]" />
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="01xxxxxxxxx"
                      className="w-full border border-[#e5e7eb] bg-white pl-9 pr-4 py-3 text-[14px] text-[#1a1a1a] outline-none focus:border-[#1a1a1a] transition-colors placeholder:text-[#9ca3af]"
                    />
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-[11px] font-bold uppercase tracking-widest text-[#6b7280] mb-4">
                Delivery details
              </h2>
              <div className="grid gap-4">
                <div>
                  <label className="block text-[12px] font-semibold text-[#1a1a1a] mb-1.5">
                    Address
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9ca3af]" />
                    <input
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Street, building, apartment"
                      className="w-full border border-[#e5e7eb] bg-white pl-9 pr-4 py-3 text-[14px] text-[#1a1a1a] outline-none focus:border-[#1a1a1a] transition-colors placeholder:text-[#9ca3af]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-[#1a1a1a] mb-1.5">
                    Governorate
                  </label>
                  <select
                    value={governorate}
                    onChange={(e) => setGovernorate(e.target.value)}
                    className="w-full h-10 appearance-none border border-[#e5e7eb] bg-white pl-3 pr-8 text-[12px] font-medium text-[#1a1a1a] outline-none hover:border-[#1a1a1a] transition-colors cursor-pointer"
                  >
                    {GOVERNORATES.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </section>
          </div>

          <div className="md:sticky md:top-28 md:self-start space-y-4">
            <div className="border border-[#e5e7eb] bg-white p-5">
              <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#6b7280] mb-4">
                Order Summary
              </h3>
              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={item.id} className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-[#1a1a1a] truncate">
                        {item.title}
                      </p>
                      <p className="text-[11px] text-[#9ca3af]">Qty 1</p>
                    </div>
                    <p className="text-[13px] font-medium text-[#1a1a1a]">
                      LE {item.price.toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
              <div className="border-t border-[#e5e7eb] mt-4 pt-4 flex items-center justify-between">
                <span className="text-[12px] font-semibold uppercase tracking-widest text-[#6b7280]">
                  Subtotal
                </span>
                <span className="text-[16px] font-bold text-[#1a1a1a]">
                  LE {subtotal.toLocaleString()}
                </span>
              </div>
            </div>
            <button
              type="submit"
              disabled={placing}
              className="w-full h-12 bg-[#1a1a1a] text-white text-[12px] font-bold uppercase tracking-widest hover:bg-black transition-colors disabled:opacity-50"
            >
              {placing ? "Placing order..." : "Place order"}
            </button>
            <p className="text-[11px] text-[#9ca3af] text-center">
              You will be contacted to confirm your order.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
