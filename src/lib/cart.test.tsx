import { describe, it, expect, vi, beforeEach } from "vitest";

// localStorage mock
const store = new Map<string, string>();
const localStorageMock = {
  getItem: vi.fn((key: string) => store.get(key) ?? null),
  setItem: vi.fn((key: string, value: string) => {
    store.set(key, value);
  }),
  removeItem: vi.fn((key: string) => store.delete(key)),
  clear: vi.fn(() => store.clear()),
  get length() {
    return store.size;
  },
  key: vi.fn((idx: number) => Array.from(store.keys())[idx] ?? null),
};
Object.defineProperty(globalThis, "localStorage", { value: localStorageMock, writable: true });

// Import after mocking
import { CartProvider, useCart, type CartItem } from "./cart";
import { renderHook, act } from "@testing-library/react";
import type { ReactNode } from "react";

function wrapper({ children }: { children: ReactNode }) {
  return <CartProvider>{children}</CartProvider>;
}

const testItem: CartItem = {
  id: "prod-1",
  name: "Vintage Tee",
  price: 500,
  size: "L",
};

function renderCartHook() {
  return renderHook(() => useCart(), { wrapper });
}

describe("CartProvider / useCart", () => {
  beforeEach(() => {
    store.clear();
    vi.clearAllMocks();
  });

  it("starts with an empty cart", () => {
    const { result } = renderCartHook();
    expect(result.current.items).toEqual([]);
    expect(result.current.count).toBe(0);
  });

  it("adds an item to the cart", () => {
    const { result } = renderCartHook();
    act(() => {
      result.current.add(testItem);
    });
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].id).toBe("prod-1");
    expect(result.current.count).toBe(1);
  });

  it("does not add duplicate items", () => {
    const { result } = renderCartHook();
    act(() => {
      result.current.add(testItem);
    });
    act(() => {
      const ok = result.current.add(testItem);
      expect(ok).toBe(false);
    });
    expect(result.current.items).toHaveLength(1);
  });

  it("removes an item by id", () => {
    const { result } = renderCartHook();
    act(() => {
      result.current.add(testItem);
    });
    act(() => {
      result.current.remove("prod-1");
    });
    expect(result.current.items).toEqual([]);
  });

  it("clears all items", () => {
    const { result } = renderCartHook();
    act(() => {
      result.current.add(testItem);
      result.current.add({ ...testItem, id: "prod-2", name: "Denim Jacket" });
    });
    expect(result.current.count).toBe(2);
    act(() => {
      result.current.clear();
    });
    expect(result.current.count).toBe(0);
  });

  it("isInCart checks membership correctly", () => {
    const { result } = renderCartHook();
    expect(result.current.isInCart("prod-1")).toBe(false);
    act(() => {
      result.current.add(testItem);
    });
    expect(result.current.isInCart("prod-1")).toBe(true);
    expect(result.current.isInCart("prod-2")).toBe(false);
  });

  it("buyNow replaces cart and persists to localStorage", () => {
    const { result } = renderCartHook();
    act(() => {
      result.current.add(testItem);
    });
    expect(result.current.count).toBe(1);

    const newItem: CartItem = { id: "prod-3", name: "New Piece", price: 700 };
    act(() => {
      result.current.buyNow(newItem);
    });
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].id).toBe("prod-3");

    // Should also persist to localStorage
    expect(localStorage.setItem).toHaveBeenCalledWith(
      "preloved_cart",
      JSON.stringify([newItem]),
    );
  });

  it("hydrates from localStorage on mount", () => {
    store.set("preloved_cart", JSON.stringify([testItem]));
    const { result } = renderCartHook();
    // After hydration effect runs, items should load from storage
    expect(result.current.items).toEqual([testItem]);
  });
});
