"use client";

import { useState } from "react";
import {
  ErrorBoundary,
  DefaultErrorFallback,
  InlineErrorFallback,
  QueryErrorBoundary,
  QueryPageErrorFallback,
  QuerySectionErrorFallback,
} from "@/components/common";

// 에러를 발생시키는 컴포넌트
function BuggyComponent() {
  throw new Error("테스트 에러가 발생했습니다!");
}

// 버튼 클릭 시 에러 발생
function BuggyButton() {
  const [shouldError, setShouldError] = useState(false);

  if (shouldError) {
    throw new Error("버튼 클릭으로 발생한 에러입니다!");
  }

  return (
    <button
      onClick={() => setShouldError(true)}
      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
    >
      에러 발생시키기
    </button>
  );
}

export default function TestErrorPage() {
  const [showBoundaryTest, setShowBoundaryTest] = useState(false);

  return (
    <div className="min-h-screen bg-grey-100 p-6">
      <h1 className="text-2xl font-bold mb-6">Error Boundary 테스트 페이지</h1>

      {/* 1. DefaultErrorFallback 직접 렌더링 */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-4">1. DefaultErrorFallback (직접 렌더링)</h2>
        <div className="bg-white rounded-lg shadow">
          <DefaultErrorFallback
            error={new Error("예시 에러 메시지입니다.")}
            onRetry={() => alert("다시 시도 클릭!")}
            title="문제가 발생했어요"
            description="잠시 후 다시 시도해주세요."
          />
        </div>
      </section>

      {/* 2. InlineErrorFallback */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-4">2. InlineErrorFallback (인라인)</h2>
        <div className="bg-white rounded-lg shadow p-4">
          <InlineErrorFallback
            error={new Error("데이터를 불러오는데 실패했어요.")}
            onRetry={() => alert("재시도 클릭!")}
          />
        </div>
      </section>

      {/* 3. QueryPageErrorFallback */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-4">3. QueryPageErrorFallback (페이지 전체)</h2>
        <div className="bg-white rounded-lg shadow">
          <QueryPageErrorFallback
            title="페이지를 불러올 수 없어요"
            description="네트워크 연결을 확인하고 다시 시도해주세요."
          />
        </div>
      </section>

      {/* 4. QuerySectionErrorFallback */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-4">4. QuerySectionErrorFallback (섹션)</h2>
        <div className="bg-white rounded-lg shadow p-4">
          <QuerySectionErrorFallback
            title="리뷰를 불러올 수 없어요"
            description="잠시 후 다시 시도해주세요."
          />
        </div>
      </section>

      {/* 5. Error Boundary 실제 테스트 */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-4">5. Error Boundary 실제 테스트</h2>
        <div className="bg-white rounded-lg shadow p-4">
          <button
            onClick={() => setShowBoundaryTest(!showBoundaryTest)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 mb-4"
          >
            {showBoundaryTest ? "테스트 숨기기" : "Error Boundary 테스트 보기"}
          </button>

          {showBoundaryTest && (
            <ErrorBoundary
              fallback={(error, reset) => (
                <div className="mt-4">
                  <DefaultErrorFallback
                    error={error}
                    onRetry={reset}
                    title="에러가 잡혔어요!"
                    description="Error Boundary가 정상 작동합니다."
                  />
                </div>
              )}
            >
              <div className="mt-4 p-4 bg-grey-50 rounded-lg">
                <p className="mb-4 text-grey-600">
                  버튼을 클릭하면 에러가 발생하고 Error Boundary가 잡습니다.
                </p>
                <BuggyButton />
              </div>
            </ErrorBoundary>
          )}
        </div>
      </section>
    </div>
  );
}
