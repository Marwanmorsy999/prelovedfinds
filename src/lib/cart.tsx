import { createContext, useContext, useState, useRef, type ReactNode } from "react";

export interface CartItem {
  id: string;
  title: string;
  price: number;
  currency: string;
}

interface CartCtx {
  items: CartItem[];
  add: (item: CartItem) => boolean;
  remove: (id: string) => void;
  clear: () => void;
  isInCart: (id: string) => boolean;
  count: number;
}

const Ctx = createContext<CartCtx | null>(null);

const FALLBACK: CartCtx = {
  items: [],
  add: () => false,
  remove: () => {},
  clear: () => {},
  isInCart: () => false,
  count: 0,
};

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const itemsRef = useRef(items);
  itemsRef.current = items;

  const add = (item: CartItem) => {
    if (itemsRef.current.some((x) => x.id === item.id)) return false;
    setItems((s) => [...s, item]);
    return true;
  };

  const remove = (id: string) => setItems((s) => s.filter((x) => x.id !== id));
  const clear = () => setItems([]);
  const isInCart = (id: string) => itemsRef.current.some((x) => x.id === id);

  return (
    <Ctx.Provider value={{ items, add, remove, clear, isInCart, count: items.length }}>
      {children}
    </Ctx.Provider>
  );
}

export function useCart(): CartCtx {
  return useContext(Ctx) ?? FALLBACK;
}
