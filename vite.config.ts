// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  vite: {
    resolve: { tsconfigPaths: true },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id: string) {
            // Vendor chunks
            if (id.includes("node_modules/react-dom") || id.includes("node_modules/react/")) {
              return "vendor-react";
            }
            if (id.includes("node_modules/@tanstack/react-router")) {
              return "vendor-router";
            }
            if (id.includes("node_modules/@tanstack/react-query")) {
              return "vendor-query";
            }
            if (id.includes("node_modules/@radix-ui/")) {
              return "vendor-radix";
            }
            if (id.includes("node_modules/lucide-react")) {
              return "vendor-icons";
            }
            if (id.includes("node_modules/recharts")) {
              return "vendor-charts";
            }
            // Admin route chunk
            if (id.includes("src/routes/admin")) {
              return "route-admin";
            }
            // Shared UI components chunk
            if (id.includes("src/components/ui/")) {
              return "shared-ui";
            }
          },
        },
      },
    },
  },
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  // Outside Lovable's own build pipeline, the preset/output overrides below
  // actually apply (inside Lovable they're force-pinned to Cloudflare).
  // "cloudflare-module" builds a Cloudflare Workers module entry
  // (deployed via `wrangler deploy`). For a plain Node.js server instead
  // (VPS/Docker/Railway/Render) change back to "node-server".
  nitro: {
    preset: "cloudflare-module",
    cloudflare: {
      nodeCompat: true,
    },
  },
});
