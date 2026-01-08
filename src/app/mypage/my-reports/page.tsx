"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import Footer from "@/components/common/Footer";

// TODO: 실제 API 타입으로 교체
interface ReportedShop {
  id: string;
  name: string;
  image: string;
  status: "open" | "closed";
  distance: number;
  reportDate: string;
}

export default function MyReportsPage() {
  const router = useRouter();

  // TODO: 백엔드 API 연동 - 내가 제보한 업체 목록 조회
  const [reports, _setReports] = useState<ReportedShop[]>([]);
  const [sortOrder, _setSortOrder] = useState<"latest" | "distance">("latest");

  const handleBack = () => {
    router.push("/mypage");
  };

  return (
    <div className="bg-default min-h-screen w-full max-w-[480px] mx-auto relative pb-[70px]">
      {/* Header */}
      <header className="bg-white h-12 flex items-center pl-3 pr-5 py-2 gap-3">
        <button
          onClick={handleBack}
          className="w-6 h-6 flex items-center justify-center"
          aria-label="뒤로가기"
        >
          <ChevronLeft size={24} className="stroke-grey-900" strokeWidth={2} />
        </button>
        <h1 className="flex-1 text-[18px] font-semibold leading-[1.5] tracking-[-0.18px] text-grey-900 h-6 flex items-center">
          내가 제보한 업체
        </h1>
      </header>

      {/* Main Content */}
      <main className="flex flex-col px-5 pt-5 pb-5">
        {reports.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center pt-20">
            <div className="w-[120px] h-[120px] rounded-full bg-grey-200 flex items-center justify-center mb-8">
              <span className="text-[14px] font-medium text-grey-500">이미지</span>
            </div>
            <p className="text-[16px] font-medium leading-[1.5] tracking-[-0.16px] text-grey-900 text-center whitespace-pre-wrap">
              {`아직 발견되지 않은\n새로운 업체를 등록해보세요!`}
            </p>
          </div>
        ) : (
          /* List State */
          <div className="flex flex-col gap-4">
            {/* Header Info */}
            <div className="flex items-center justify-between">
              <p className="text-[14px] font-medium leading-[1.5] tracking-[-0.14px] text-grey-900">
                총 {reports.length}개
              </p>
              <button
                onClick={() => _setSortOrder(sortOrder === "latest" ? "distance" : "latest")}
                className="flex items-center gap-1"
              >
                <span className="text-[14px] font-medium leading-[1.5] tracking-[-0.14px] text-grey-500">
                  {sortOrder === "latest" ? "최신순" : "거리순"}
                </span>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path
                    d="M3 4.5L6 7.5L9 4.5"
                    stroke="#8A8A8B"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>

            {/* Shop List */}
            <div className="flex flex-col gap-3">
              {reports.map((shop) => (
                <div
                  key={shop.id}
                  className="flex gap-3 p-3 bg-white rounded-2xl border border-line-100"
                >
                  {/* Shop Image */}
                  <div className="w-[80px] h-[80px] rounded-xl bg-grey-200 flex-shrink-0 overflow-hidden relative">
                    <Image src={shop.image} alt={shop.name} fill className="object-cover" />
                  </div>

                  {/* Shop Info */}
                  <div className="flex-1 flex flex-col gap-1">
                    <div className="flex items-center gap-1">
                      <span
                        className={`text-[11px] font-medium leading-[1.5] tracking-[-0.11px] ${
                          shop.status === "open" ? "text-system-success" : "text-main-500"
                        }`}
                      >
                        {shop.status === "open" ? "영업중" : "영업종료"}
                      </span>
                      <span className="text-[11px] font-normal leading-[1.5] tracking-[-0.11px] text-grey-400">
                        {shop.reportDate}
                      </span>
                    </div>
                    <h3 className="text-[16px] font-semibold leading-[1.5] tracking-[-0.16px] text-grey-900 truncate">
                      {shop.name}
                    </h3>
                    <div className="flex items-center gap-1">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path
                          d="M6 1L7.5 4.5L11 5L8.5 7.5L9 11L6 9L3 11L3.5 7.5L1 5L4.5 4.5L6 1Z"
                          fill="#626264"
                        />
                      </svg>
                      <span className="text-[12px] font-normal leading-[1.5] tracking-[-0.12px] text-grey-600">
                        현재 위치에서 {shop.distance}m
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer Navigation */}
      <Footer />
    </div>
  );
}
