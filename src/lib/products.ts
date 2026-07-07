export type Availability = "available" | "one-left" | "sold";

export interface Product {
  id: string;
  title: string;
  brand: string;
  era: string;
  price: number;
  currency: string;
  availability: Availability;
  size: string;
  images: string[];
  productId: string[];
  measurements: string[];
  priceLabel: string;
  sortOrder: number;
  description: string;
  tag: string;
  condition: string;
  imageUrl: string | null;
  createdAt: number;
}

export interface Order {
  id: string;
  createdAt: number;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  customerName: string;
  customerPhone: string;
  customerInstagram: string;
  notes: string;
  pickup: 0 | 1;
  address: string;
  governorate?: string;
  subtotal?: number;
  items: { name: string; size?: string; price?: number; priceLabel?: string }[];
  total: number;
}

export interface Settings {
  announcement: string;
  whatsapp: string;
}

export const CATEGORIES = ["TEE", "SHIRT", "JEANS", "PANTS", "SHORTS", "OTHER"] as const;
export const CONDITIONS = ["Excellent", "Good", "Fair"] as const;
export type Category = typeof CATEGORIES[number];
export type Condition = typeof CONDITIONS[number];

export function availabilityLabel(a: Availability): string {
  switch (a) {
    case "available":
      return "In stock";
    case "one-left":
      return "1 left";
    case "sold":
      return "Sold out";
  }
}
