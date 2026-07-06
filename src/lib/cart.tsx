import { createContext, useContext, useState, type ReactNode } from "react";

interface CartCtx {
  items: string[];
  add: (id: string) => void;
  count: number;
}

const Ctx = createContext<CartCtx | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<string[]>([]);
  return (
    <Ctx.Provider value={{ items, add: (id) => setItems((s) => [...s, id]), count: items.length }}>
      {children}
    </Ctx.Provider>
  );
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) return { items: [], add: () => {}, count: 0 } as CartCtx;
  return c;
}
