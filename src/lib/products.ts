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

const P = (p: Partial<Product> & { id: string; title: string; price: number; size: string }): Product => ({
  brand: "Unknown",
  era: "90s",
  currency: "EGP",
  availability: "available",
  images: [],
  productId: ["Pre-owned, professionally inspected", "Minor signs of wear consistent with age", "No holes, no stains"],
  measurements: ["Chest: 56cm", "Length: 72cm", "Shoulder: 52cm", "Sleeve: 22cm"],
  createdAt: Date.now(),
  ...p,
});

export const products: Product[] = [
  P({ id: "pe-crosshair-tee", title: "Public Enemy Crosshair All-Over Tee", brand: "Public Enemy", era: "90s Bootleg", price: 1450, size: "XL", availability: "one-left" }),
  P({ id: "levis-501-black", title: "Levi's 501 Faded Black Denim", brand: "Levi's", era: "90s", price: 850, size: "34x32" }),
  P({ id: "nirvana-smiley", title: "Nirvana Smiley Face Band Tee", brand: "Nirvana", era: "00s Reprint", price: 950, size: "L", availability: "sold" }),
  P({ id: "carhartt-chore", title: "Carhartt Detroit Chore Jacket", brand: "Carhartt", era: "Y2K", price: 1800, size: "M" }),
  P({ id: "polo-oxford-blue", title: "Polo Ralph Lauren Oxford Button-Up", brand: "Ralph Lauren", era: "90s", price: 620, size: "L" }),
  P({ id: "harley-flame-tee", title: "Harley Davidson Flame Pocket Tee", brand: "Harley Davidson", era: "90s", price: 1100, size: "XXL", availability: "one-left" }),
  P({ id: "dickies-874", title: "Dickies 874 Work Trousers", brand: "Dickies", era: "00s", price: 550, size: "32x30" }),
  P({ id: "tommy-flag-tee", title: "Tommy Hilfiger Flag Logo Tee", brand: "Tommy Hilfiger", era: "90s", price: 780, size: "M" }),
  P({ id: "wrangler-western", title: "Wrangler Pearl-Snap Western Shirt", brand: "Wrangler", era: "80s", price: 680, size: "L" }),
  P({ id: "metallica-tour", title: "Metallica Load Tour Long Sleeve", brand: "Metallica", era: "90s", price: 1650, size: "L", availability: "sold" }),
  P({ id: "champion-hoodie", title: "Champion Reverse Weave Hoodie", brand: "Champion", era: "90s", price: 990, size: "XL" }),
  P({ id: "dickies-flannel", title: "Dickies Heavyweight Flannel Overshirt", brand: "Dickies", era: "00s", price: 720, size: "M", availability: "one-left" }),
];

export const getProduct = (id: string) => products.find((p) => p.id === id);
export const getRelated = (id: string, n = 4) => products.filter((p) => p.id !== id).slice(0, n);
