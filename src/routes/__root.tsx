import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useNavigate,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { SettingsCtx, useSettings } from "@/lib/settings-context";
import { reportWebVitals } from "@/lib/web-vitals";
import { Search, ArrowRight } from "lucide-react";

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
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate({ to: "/shop", search: { tag: "all", condition: "all", priceRange: "all", sort: "newest", q: query.trim(), page: 1 } });
    }
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-concrete">404</p>
        <h1 className="mt-3 text-[28px] font-bold uppercase tracking-widest text-ink">
          Page not found
        </h1>
        <p className="mt-2 text-[14px] text-concrete">
          This page doesn't exist or may have been moved.
        </p>

        {/* Search */}
        <form onSubmit={handleSearch} className="mt-8 relative max-w-sm mx-auto">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-concrete pointer-events-none" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search the shop…"
            className="w-full h-12 border border-hairline bg-paper pl-10 pr-4 text-[13px] text-ink outline-none focus:border-ink transition-colors placeholder:text-concrete"
            aria-label="Search products"
          />
        </form>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/"
            className="inline-flex h-12 items-center justify-center bg-ink text-paper px-8 text-[11px] font-bold uppercase tracking-widest hover:bg-concrete transition-colors"
          >
            Go home
          </Link>
          <Link
            to="/shop"
            search={{ tag: "all", condition: "all", priceRange: "all", sort: "newest", q: "", page: 1 }}
            className="inline-flex h-12 items-center justify-center gap-1.5 border border-ink text-ink px-8 text-[11px] font-bold uppercase tracking-widest hover:bg-ink hover:text-paper transition-colors"
          >
            Shop All <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="mt-10 pt-8 border-t border-hairline">
          <p className="text-[11px] uppercase tracking-widest text-concrete mb-4">
            Looking for something specific?
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {["TEE", "JEANS", "SHIRT", "JACKET"].map((tag) => (
              <Link
                key={tag}
                to="/shop"
                search={{ tag, condition: "all", priceRange: "all", sort: "newest", q: "", page: 1 }}
                className="px-4 py-2 border border-hairline text-[11px] font-bold uppercase tracking-widest text-concrete hover:border-ink hover:text-ink transition-colors"
              >
                {tag}
              </Link>
            ))}
          </div>
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
    // Register service worker (only if sw.js exists in build output)
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("/sw.js").catch(() => {
          // SW registration is non-critical — sw.js may not exist yet
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

function simpleHash(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return String(Math.abs(h));
}

function RootComponent() {
  const { queryClient, announcement, whatsapp } = Route.useRouteContext();
  const [bannerDismissed, setBannerDismissed] = useState(false);

  // Sync banner dismissed state from sessionStorage when announcement changes
  useEffect(() => {
    if (!announcement) {
      setBannerDismissed(false);
      return;
    }
    const key = `dismissed-announcement-${simpleHash(announcement)}`;
    try {
      if (sessionStorage.getItem(key) === "1") {
        setBannerDismissed(true);
      } else {
        setBannerDismissed(false);
      }
    } catch {
      setBannerDismissed(false);
    }
  }, [announcement]);

  const bannerH = announcement && !bannerDismissed ? "36px" : "0px";

  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <SettingsCtx.Provider value={{ whatsapp }}>
          <div className="flex min-h-screen flex-col bg-white" style={{ "--banner-h": bannerH } as React.CSSProperties}>
            <AnnouncementBanner announcement={announcement} onDismiss={() => setBannerDismissed(true)} />
            <Navigation />
            <main className="flex-1" id="main-content" style={{ paddingTop: `calc(80px + ${bannerH})` }}>
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
