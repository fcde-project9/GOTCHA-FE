"use client";

import { useState } from "react";
import Link from "next/link";
import { ErrorPage } from "@/components/error/ErrorPage";
import { MaintenancePage } from "@/components/error/MaintenancePage";
import { NetworkErrorPage } from "@/components/error/NetworkErrorPage";
import { ServiceUnavailablePage } from "@/components/error/ServiceUnavailablePage";
import { SessionExpiredPage } from "@/components/error/SessionExpiredPage";

type ErrorType = "unknown" | "service-unavailable" | "session-expired" | "maintenance" | "offline";

const ERROR_LIST: { type: ErrorType; label: string; description: string }[] = [
  { type: "unknown", label: "알 수 없는 오류", description: "예상치 못한 클라이언트/서버 에러" },
  { type: "service-unavailable", label: "서비스 일시적 이용불가", description: "5xx 서버 에러" },
  { type: "session-expired", label: "세션 만료", description: "401 토큰 만료" },
  { type: "maintenance", label: "시스템 점검", description: "503 점검 모드" },
  { type: "offline", label: "오프라인", description: "네트워크 연결 실패" },
];

export default function ErrorPagesTest() {
  const [activeError, setActiveError] = useState<ErrorType | null>(null);

  return (
    <>
      {/* 에러 페이지 풀스크린 오버레이 */}
      {activeError && (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            onClick={() => setActiveError(null)}
            className="fixed right-4 top-4 z-[60] rounded-full bg-black/70 px-4 py-2 text-sm font-semibold text-white"
          >
            닫기 (X)
          </button>
          {activeError === "unknown" && <ErrorPage />}
          {activeError === "service-unavailable" && <ServiceUnavailablePage />}
          {activeError === "session-expired" && <SessionExpiredPage />}
          {activeError === "maintenance" && (
            <MaintenancePage schedule="2026년 03월 25일 19:50~23:00" />
          )}
          {activeError === "offline" && <NetworkErrorPage />}
        </div>
      )}

      {/* 테스트 목록 */}
      <div className="min-h-screen bg-grey-100 p-6">
        <div className="mb-6 flex items-center gap-3">
          <Link href="/test-error" className="text-sm text-blue-500 hover:underline">
            &larr; test-error
          </Link>
          <h1 className="text-2xl font-bold">에러 페이지 테스트</h1>
        </div>

        <p className="mb-6 text-sm text-grey-500">
          각 버튼을 클릭하면 해당 에러 페이지가 풀스크린으로 표시됩니다. 우측 상단 닫기 버튼으로
          돌아올 수 있습니다.
        </p>

        <div className="flex flex-col gap-3">
          {ERROR_LIST.map(({ type, label, description }) => (
            <button
              key={type}
              type="button"
              onClick={() => setActiveError(type)}
              className="flex items-center justify-between rounded-lg bg-white p-4 shadow transition-colors hover:bg-grey-50"
            >
              <div className="text-left">
                <p className="text-[16px] font-semibold text-grey-900">{label}</p>
                <p className="text-[13px] text-grey-500">{description}</p>
              </div>
              <span className="text-grey-400">&rarr;</span>
            </button>
          ))}

          {/* 404는 Next.js notFound()로 별도 테스트 */}
          <Link
            href="/test-error/nonexistent-page-for-404"
            className="flex items-center justify-between rounded-lg bg-white p-4 shadow transition-colors hover:bg-grey-50"
          >
            <div className="text-left">
              <p className="text-[16px] font-semibold text-grey-900">404 에러</p>
              <p className="text-[13px] text-grey-500">
                존재하지 않는 페이지 접근 (별도 페이지 이동)
              </p>
            </div>
            <span className="text-grey-400">&rarr;</span>
          </Link>
        </div>
      </div>
    </>
  );
}
