"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ServiceWorkerRegistration } from "@/components/pwa/ServiceWorkerRegistration";
import { ToastProvider } from "@/hooks";
import { checkSessionAndRedirect } from "@/utils";

// 세션 체크를 하지 않는 페이지 목록
const PUBLIC_PATHS = ["/login", "/oauth/callback", "/login/nickname", "/terms"];

export default function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // 모든 페이지에서 세션 만료 체크
  useEffect(() => {
    const isPublicPath = PUBLIC_PATHS.some(
      (path) => pathname === path || pathname?.startsWith(`${path}/`)
    );
    if (!isPublicPath) {
      checkSessionAndRedirect();
    }
  }, [pathname]);

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1분
            retry: 1,
            refetchOnWindowFocus: true, // 탭 복귀 시 자동 갱신
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>{children}</ToastProvider>
      <ServiceWorkerRegistration />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
