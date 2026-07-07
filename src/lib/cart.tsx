import { createContext, useContext, useState, useRef, useEffect, type ReactNode } from "react";
import type { Product } from "@/lib/products";

const STORAGE_KEY = "preloved_cart";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  priceLabel?: string;
}

interface CartCtx {
  items: CartItem[];
  add: (item: CartItem) => boolean;
  remove: (id: string) => void;
  clear: () => void;
  isInCart: (id: string) => boolean;
  count: number;
  buyNow: (item: CartItem) => void;
}

const Ctx = createContext<CartCtx | null>(null);

const FALLBACK: CartCtx = {
  items: [],
  add: () => false,
  remove: () => {},
  clear: () => {},
  isInCart: () => false,
  count: 0,
  buyNow: () => {},
};

function loadCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // ignore
  }
  return [];
}

function saveCart(items: CartItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // ignore
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => loadCart());
  const itemsRef = useRef(items);
  itemsRef.current = items;

  // Persist to localStorage whenever items change
  useEffect(() => {
    saveCart(items);
  }, [items]);

  const add = (item: CartItem) => {
    if (itemsRef.current.some((x) => x.id === item.id)) return false;
    setItems((s) => [...s, item]);
    return true;
  };

  const remove = (id: string) => setItems((s) => s.filter((x) => x.id !== id));
  const clear = () => setItems([]);
  const isInCart = (id: string) => itemsRef.current.some((x) => x.id === id);

  const buyNow = (item: CartItem) => {
    setItems([item]);
  };

  return (
    <Ctx.Provider value={{ items, add, remove, clear, isInCart, count: items.length, buyNow }}>
      {children}
    </Ctx.Provider>
  );
}

export function useCart(): CartCtx {
  return useContext(Ctx) ?? FALLBACK;
}