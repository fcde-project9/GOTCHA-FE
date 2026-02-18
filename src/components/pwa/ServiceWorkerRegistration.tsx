"use client";

import { useEffect } from "react";
import { isNativeApp } from "@/utils/platform";

export function ServiceWorkerRegistration() {
  useEffect(() => {
    // 네이티브 앱에서는 서비스워커 등록 건너뛰기 (WKWebView 미지원)
    if (isNativeApp()) return;

    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("SW registered:", registration.scope);
        })
        .catch((error) => {
          console.log("SW registration failed:", error);
        });
    }
  }, []);

  return null;
}
