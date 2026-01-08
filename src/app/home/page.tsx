"use client";

import { Search, LocateFixed } from "lucide-react";
import { Footer } from "@/components/common";
import { KakaoMap } from "@/components/features/map";
import { ShopListBottomSheet } from "@/components/features/shop";
import { mockShops } from "@/data/mockShops";

export default function Home() {
  const handleSearchClick = () => {
    // TODO: 검색 페이지로 이동 또는 검색 모달 열기
  };

  const handleCurrentLocation = () => {
    // TODO: 현재 위치로 지도 이동
  };

  return (
    <>
      <main className="h-[calc(100vh-70px)] relative">
        <div className="flex h-full flex-col items-center relative">
          {/* 카카오맵 */}
          <div className="w-full h-full relative">
            <KakaoMap width="100%" height="100%" />

            {/* 검색창 */}
            <div className="absolute left-0 right-0 top-8 z-10 mx-auto w-full max-w-[480px] px-5">
              <button
                onClick={handleSearchClick}
                className="flex h-11 w-full items-center gap-2 rounded-lg bg-white px-2.5 py-2.5 shadow-[0px_0px_5px_0px_rgba(0,0,0,0.2)]"
              >
                <Search size={24} className="stroke-grey-800" strokeWidth={2} />
                <span className="text-[15px] font-normal leading-[1.5] tracking-[-0.15px] text-grey-600">
                  위치로 업체 검색
                </span>
              </button>
            </div>

            {/* 현재 위치 버튼 */}
            <div className="absolute bottom-[231px] right-0 z-10 mx-auto w-full max-w-[480px] px-5">
              <div className="flex justify-end">
                <button
                  onClick={handleCurrentLocation}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white p-2 shadow-[0px_0px_5px_0px_rgba(0,0,0,0.2)]"
                  aria-label="현재 위치"
                >
                  <LocateFixed size={16} className="stroke-grey-900" strokeWidth={2} />
                </button>
              </div>
            </div>
          </div>

          {/* 바텀시트 */}
          <ShopListBottomSheet shops={mockShops} />
        </div>
      </main>
      <Footer />
    </>
  );
}
