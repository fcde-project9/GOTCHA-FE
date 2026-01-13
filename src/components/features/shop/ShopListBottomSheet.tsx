"use client";

import { useEffect, useState, useMemo } from "react";
import { Store } from "lucide-react";
import { ShopListView } from "@/utils/shop";
import { BottomSheet } from "../ui";
import ShopListItem from "./ShopListItem";

interface ShopListBottomSheetProps {
  shops: ShopListView[];
  isLoading?: boolean;
  onHeightChange?: (height: number, isDragging: boolean) => void;
}

export default function ShopListBottomSheet({
  shops,
  isLoading,
  onHeightChange,
}: ShopListBottomSheetProps) {
  const hasShops = shops.length > 0;
  const [scrollTrigger, setScrollTrigger] = useState(0);

  // shops의 ID 목록을 문자열로 변환하여 변경 감지
  const shopsKey = useMemo(() => {
    return shops.map((shop) => shop.id).join(",");
  }, [shops]);

  // shops 데이터가 변경될 때마다 스크롤 트리거 증가
  useEffect(() => {
    setScrollTrigger((prev) => prev + 1);
  }, [shopsKey]);

  return (
    <BottomSheet
      // Uses default snap points from BottomSheet (SSR-safe)
      defaultSnapPoint={0}
      onHeightChange={onHeightChange}
      scrollToTop={scrollTrigger}
    >
      <div className="flex flex-col items-center gap-2 px-5 h-full">
        {isLoading ? (
          /* 로딩 상태 UI */
          <div className="flex w-full flex-col items-center justify-center h-full">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-grey-200 border-t-main" />
          </div>
        ) : hasShops ? (
          <>
            {/* 헤더 섹션 */}
            <div className="flex w-full items-center justify-between">
              <div className="flex items-center gap-0">
                <span className="text-[14px] font-normal leading-[1.5] tracking-[-0.14px] text-grey-900">
                  총{" "}
                </span>
                <span className="text-[14px] font-normal leading-[1.5] tracking-[-0.14px] text-grey-900">
                  {shops.length}개
                </span>
              </div>
              <button className="text-right text-[14px] font-normal leading-[1.5] tracking-[-0.14px] text-grey-700">
                거리순
              </button>
            </div>

            {/* 가게 목록 */}
            <div className="flex w-full flex-col">
              {shops.map((shop) => (
                <ShopListItem
                  key={shop.id}
                  shopId={shop.id}
                  name={shop.name}
                  distance={shop.distance}
                  isOpen={shop.isOpen}
                  imageUrl={shop.imageUrl}
                  isFavorite={shop.isFavorite}
                />
              ))}
            </div>
          </>
        ) : (
          /* 빈 상태 UI */
          <div className="flex w-full flex-col items-center justify-center h-full">
            <div className="mb-4 flex items-center justify-center flex-shrink-0 w-20">
              <img src="/images/shop-list-empty.png" alt="shop-list-empty" />
            </div>
            <p className="mb-1 text-[18px] font-semibold leading-[1.5] tracking-[-0.18px] text-grey-900">
              이 지역에 등록된 매장이 없어요
            </p>
            <p className="text-[15px] font-normal leading-[1.5] tracking-[-0.15px] text-grey-500">
              다른 지역을 검색해보세요
            </p>
          </div>
        )}
      </div>
    </BottomSheet>
  );
}
