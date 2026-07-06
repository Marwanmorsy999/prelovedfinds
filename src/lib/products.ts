export type Availability = "available" | "one-left" | "sold";

export interface Product {
  id: string;
  title: string;
  brand: string;
  era: string;
  price: number;
  currency: "EGP";
  availability: Availability;
  size: string;
  images: string[];
  productId: string[];
  measurements: string[];
  createdAt: number;
}
