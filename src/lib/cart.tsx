import { createContext, useContext, useState, useRef, type ReactNode } from "react";

interface CartCtx {
  items: string[];
  add: (id: string) => boolean;
  remove: (id: string) => void;
  clear: () => void;
  isInCart: (id: string) => boolean;
  count: number;
}

const Ctx = createContext<CartCtx | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<string[]>([]);
  const itemsRef = useRef(items);
  itemsRef.current = items;

  const add = (id: string) => {
    if (itemsRef.current.includes(id)) return false;
    setItems((s) => [...s, id]);
    return true;
  };

  const remove = (id: string) => setItems((s) => s.filter((x) => x !== id));
  const clear = () => setItems([]);
  const isInCart = (id: string) => itemsRef.current.includes(id);

  return (
    <Ctx.Provider value={{ items, add, remove, clear, isInCart, count: items.length }}>
      {children}
    </Ctx.Provider>
  );
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c)
    return {
      items: [],
      add: () => false,
      remove: () => {},
      clear: () => {},
      isInCart: () => false,
      count: 0,
    } as CartCtx;
  return c;
}
