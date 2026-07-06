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

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { CartProvider } from "@/lib/cart";
import { Toaster } from "@/components/ui/sonner";
import { getIsAuthed } from "@/lib/auth";

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
          <a
            href="/"
            className="border border-ink px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-ink hover:bg-ink hover:text-background"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient; admin: boolean }>()(
  {
    beforeLoad: async () => {
      const admin = await getIsAuthed();
      return { admin };
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
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap",
        },
      ],
    }),
    shellComponent: RootShell,
    component: RootComponent,
    notFoundComponent: NotFoundComponent,
    errorComponent: ErrorComponent,
  },
);

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <div className="flex min-h-screen flex-col bg-white">
          <Navigation />
          <main className="flex-1 pt-[104px]" id="main-content">
            <Outlet />
          </main>
          <Footer />
        </div>
        <Toaster />
      </CartProvider>
    </QueryClientProvider>
  );
}
