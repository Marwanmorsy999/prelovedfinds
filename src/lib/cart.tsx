import { createContext, useContext, useState, useRef, useEffect, type ReactNode } from "react";
import type { Product } from "@/lib/products";

const STORAGE_KEY = "preloved_cart";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  priceLabel?: string;
  imageUrl?: string;
  size?: string;
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
  // Always start empty. Reading localStorage inside the useState initializer
  // ran during the client's first (hydrating) render, which produced a
  // different tree than the server-rendered HTML (which has no access to
  // localStorage) — a classic React hydration mismatch. Hydrating the real
  // cart in an effect below means the first client render matches the
  // server exactly, then updates once mounted.
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const itemsRef = useRef(items);
  itemsRef.current = items;

  useEffect(() => {
    setItems(loadCart());
    setHydrated(true);
  }, []);

  // Persist to localStorage whenever items change, but only after the
  // initial hydration above — otherwise this would immediately overwrite
  // a real saved cart with the empty initial state.
  useEffect(() => {
    if (!hydrated) return;
    saveCart(items);
  }, [items, hydrated]);

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

// eslint-disable-next-line react-refresh/only-export-components
export function useCart(): CartCtx {
  return useContext(Ctx) ?? FALLBACK;
}
