"use client";

export default function OfflinePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
      <div className="text-6xl mb-4">📡</div>
      <h1 className="text-xl font-bold text-gray-900 mb-2">오프라인 상태입니다</h1>
      <p className="text-gray-500 mb-6">인터넷 연결을 확인해주세요</p>
      <button
        onClick={() => window.location.reload()}
        className="px-6 py-3 bg-main text-white rounded-xl font-medium"
      >
        다시 시도
      </button>
    </div>
  );
}
