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
        .then(() => {
          // SW 등록 성공 — 정상 동작이므로 별도 로깅 불필요
        })
        .catch((error) => {
          console.error("SW registration failed:", error);
        });
    }
  }, []);

  return null;
}
