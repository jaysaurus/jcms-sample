"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, Ref, useCallback, useLayoutEffect, useRef, useState } from "react";
import { exposeTanstackQueryClient } from "@/libs/tanstackWindowClient";
import { L_EditableMenuBar } from "@/components/layout/L_EditableMenuBar/L_EditableMenuBar";
import { useAuthorise } from "@/hooks/authoriseHooks";
import { PrimeReactProvider } from "primereact/api";
import { LocalToastProvider } from "@/components/_base/LocalToast";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
      gcTime: Infinity,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: 1,
    },
  },
});

exposeTanstackQueryClient(queryClient);

export function Providers({ children }: { children: ReactNode }) {
  useAuthorise();

  const ref = useRef<HTMLDivElement>(null)

  const [mainMarginTop, setMainMarginTop] = useState(0)

  useLayoutEffect(() => {
    if (!ref.current) return
    const observer = new ResizeObserver(() => {
      setMainMarginTop((ref.current?.getBoundingClientRect()?.height || 0))
    })
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <PrimeReactProvider>
      <QueryClientProvider client={queryClient}>
        <LocalToastProvider>
          <header>
            <L_EditableMenuBar ref={ref} />
          </header>

          <main
            style={{ marginTop: mainMarginTop + 'px' }}
            className="mb-10"
          >
            {children}
          </main>

          <footer style={{ padding: 16, borderTop: "1px solid #ddd", opacity: 0.8 }}>
            © {new Date().getFullYear()}
          </footer>
        </LocalToastProvider>
      </QueryClientProvider>
    </PrimeReactProvider>
  );
}