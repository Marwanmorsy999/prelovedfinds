import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { SettingsCtx, useSettings } from "@/lib/settings-context";
import { reportWebVitals } from "@/lib/web-vitals";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { AnnouncementBanner } from "@/components/AnnouncementBanner";
import { CartProvider } from "@/lib/cart";
import { Toaster } from "@/components/ui/sonner";
import { getIsAuthed } from "@/lib/auth";
import { getSettingFn } from "@/lib/functions/settings";

// Change to your production domain once deployed
const SITE_URL = "https://prelovedfinds.com";
const OG_IMAGE = `${SITE_URL}/og.jpg`;

function NotFoundComponent() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-grey">404</p>
        <h1 className="mt-3 text-2xl font-semibold text-ink">Page not found</h1>
        <p className="mt-2 text-sm text-grey">The page you're looking for doesn't exist.</p>
        <div className="mt-6">
          <Link
            to="/"
            className="border border-ink bg-ink px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-background hover:opacity-80"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold text-ink">This page didn't load</h1>
        <p className="mt-2 text-sm text-grey">Something went wrong on our end.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="border border-ink bg-ink px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-background hover:opacity-80"
          >
            Try again
          </button>
          <Link
            to="/"
            className="border border-ink px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-ink hover:bg-ink hover:text-background"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
  admin: boolean;
  announcement: string;
  whatsapp: string;
}>()({
  beforeLoad: async () => {
    const admin = await getIsAuthed();
    const [announcement, whatsapp] = await Promise.all([
      getSettingFn({ data: { key: "announcement" } }),
      getSettingFn({ data: { key: "whatsapp" } }),
    ]);
    return { admin, announcement, whatsapp };
  },
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Preloved Finds" },
      {
        name: "description",
        content: "Curated vintage and pre-owned streetwear. One-of-one pieces.",
      },
      { name: "author", content: "Preloved Finds" },
      // Open Graph
      { property: "og:site_name", content: "Preloved Finds" },
      { property: "og:title", content: "Preloved Finds" },
      {
        property: "og:description",
        content: "Curated vintage and pre-owned streetwear. One-of-one pieces.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: SITE_URL },
      { property: "og:image", content: OG_IMAGE },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      // Twitter
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Preloved Finds" },
      {
        name: "twitter:description",
        content: "Curated vintage and pre-owned streetwear. One-of-one pieces.",
      },
      { name: "twitter:image", content: OG_IMAGE },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "canonical", href: SITE_URL },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "preload",
        as: "style",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap",
        media: "print",
        onload: "this.media='all'",
      },
      { rel: "preload", href: appCss, as: "style" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Register service worker
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("/sw.js").catch(() => {
          // SW registration is non-critical
        });
      });
    }

    // Report web vitals
    reportWebVitals();
  }, []);

  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-0 focus:left-0 focus:z-[9999] focus:m-2 focus:px-4 focus:py-2 focus:bg-ink focus:text-paper focus:text-[13px] focus:font-semibold focus:uppercase focus:tracking-widest focus:outline-none"
        >
          Skip to content
        </a>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient, announcement, whatsapp } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <SettingsCtx.Provider value={{ whatsapp }}>
          <div className="flex min-h-screen flex-col bg-white">
            <AnnouncementBanner announcement={announcement} />
            <Navigation />
            <main className="flex-1 pt-[80px]" id="main-content">
              <Outlet />
            </main>
            <Footer whatsapp={whatsapp} />
          </div>
          <Toaster />
        </SettingsCtx.Provider>
      </CartProvider>
    </QueryClientProvider>
  );
}
