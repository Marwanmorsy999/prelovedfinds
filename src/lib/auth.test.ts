import { describe, it, expect, vi, beforeAll } from "vitest";

// Mock the server-core module that auth uses via createIsomorphicFn
vi.mock("@tanstack/start-server-core", () => ({
  getCookie: vi.fn(() => undefined),
  setCookie: vi.fn(),
  deleteCookie: vi.fn(),
  getRequestHeader: vi.fn(() => undefined),
  getRequestIP: vi.fn(() => undefined),
}));

// Minimal env stub — auth reads ADMIN_PASSWORD and SESSION_SECRET from env.
// Use vi.fn() so individual tests can override it with mockReturnValueOnce.
vi.mock("@/lib/env", () => ({
  getEnv: vi.fn(() => ({
    ADMIN_PASSWORD: "test-admin-pass",
    SESSION_SECRET: "test-secret-at-least-16-chars!!",
  })),
}));

// Mock the isomorphic function that tries to read from h3 context
vi.mock("@tanstack/react-start", () => ({
  createIsomorphicFn: () => {
    const fn: any = () => undefined;
    fn.server = () => fn;
    fn.client = () => fn;
    return fn;
  },
}));

// crypto.subtle is not available in jsdom, so we polyfill the parts auth needs
beforeAll(() => {
  if (typeof globalThis.crypto === "undefined") {
    Object.defineProperty(globalThis, "crypto", {
      value: {
        randomUUID: () => "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
          const r = (Math.random() * 16) | 0;
          return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
        }),
        subtle: {
          importKey: vi.fn().mockResolvedValue({ type: "secret" }),
          sign: vi.fn().mockResolvedValue(new Uint8Array(32).buffer),
        },
      },
      writable: true,
    });
  }
});

describe("verifyPassword", () => {
  it("returns true for matching passwords", async () => {
    const { verifyPassword } = await import("@/lib/auth");
    await expect(verifyPassword("test-admin-pass")).resolves.toBe(true);
  });

  it("returns false for wrong passwords", async () => {
    const { verifyPassword } = await import("@/lib/auth");
    await expect(verifyPassword("wrong-password")).resolves.toBe(false);
  });

  it("returns false when env password is empty", async () => {
    const env = await import("@/lib/env");
    vi.mocked(env.getEnv).mockReturnValueOnce({
      ADMIN_PASSWORD: "",
      SESSION_SECRET: "test",
    });
    const { verifyPassword } = await import("@/lib/auth");
    await expect(verifyPassword("anything")).resolves.toBe(false);
  });
});

describe("signSessionToken", () => {
  it("returns a token with three dot-separated parts", async () => {
    const { signSessionToken } = await import("@/lib/auth");
    const token = await signSessionToken();
    const parts = token.split(".");
    expect(parts).toHaveLength(3);
    expect(parts[0]).toBe("v1");
  });
});

describe("requireAdmin", () => {
  it("throws UNAUTHORIZED when not authed", async () => {
    const { requireAdmin } = await import("@/lib/auth");
    await expect(requireAdmin()).rejects.toThrow("UNAUTHORIZED");
  });
});
