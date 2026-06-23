import { QueryClient } from "@tanstack/react-query";

declare global {
  interface Window {
    __TANSTACK_QUERY_CLIENT__?: QueryClient;
  }
}

export function exposeTanstackQueryClient(queryClient: QueryClient) {
  if (typeof window !== "undefined") {
    window.__TANSTACK_QUERY_CLIENT__ = queryClient;
  }
}