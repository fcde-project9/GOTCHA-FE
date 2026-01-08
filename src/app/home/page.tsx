"use client";

import { Footer } from "@/components/common";
import { KakaoMap } from "@/components/features/map";
import { ShopListBottomSheet } from "@/components/features/shop";
import { mockShops } from "@/data/mockShops";

export default function Home() {
  return (
    <>
      <main className="h-[calc(100vh-70px)] relative">
        <div className="flex h-full flex-col items-center gap-8">
          {/* 카카오맵 */}
          <div className="w-full">
            <KakaoMap width="100%" height="570px" />
          </div>

          {/* 바텀시트 */}
          <ShopListBottomSheet shops={mockShops} />
        </div>
      </main>
      <Footer />
    </>
  );
}
