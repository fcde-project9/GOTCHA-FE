"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="ko">
      <body>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100dvh",
            padding: 24,
            gap: 16,
            textAlign: "center",
          }}
        >
          <h1 style={{ fontSize: 20, fontWeight: 600 }}>문제가 발생했어요</h1>
          <p style={{ fontSize: 14, color: "#666" }}>
            잠시 후 다시 시도해주세요. 문제가 계속되면 관리자에게 문의해주세요.
          </p>
          <button
            onClick={reset}
            style={{
              padding: "10px 20px",
              borderRadius: 8,
              background: "#111",
              color: "white",
              fontSize: 14,
            }}
          >
            다시 시도
          </button>
        </div>
      </body>
    </html>
  );
}
