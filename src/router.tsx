import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes — data considered fresh
        gcTime: 1000 * 60 * 30, // 30 minutes — keep in cache after unmount
        refetchOnWindowFocus: false, // avoid unnecessary refetches
        retry: 1, // only retry once on failure
      },
    },
  });

  const router = createRouter({
    routeTree,
    context: { queryClient, admin: false, announcement: "", whatsapp: "" },
    scrollRestoration: true,
    defaultPreload: "intent",
    defaultPreloadStaleTime: 1000 * 60 * 1, // 1 minute
    defaultPreloadDelay: 50, // 50ms hover delay before preloading
  });

  return router;
};
