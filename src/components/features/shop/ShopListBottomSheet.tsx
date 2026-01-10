"use client";

import { Store } from "lucide-react";
import { ShopListView } from "@/utils/shop";
import { BottomSheet } from "../ui";
import ShopListItem from "./ShopListItem";

interface ShopListBottomSheetProps {
  shops: ShopListView[];
  onHeightChange?: (height: number, isDragging: boolean) => void;
}

export default function ShopListBottomSheet({ shops, onHeightChange }: ShopListBottomSheetProps) {
  const hasShops = shops.length > 0;

  return (
    <BottomSheet
      // Uses default snap points from BottomSheet (SSR-safe)
      defaultSnapPoint={0}
      onHeightChange={onHeightChange}
    >
      <div className="flex flex-col items-center gap-2 px-5">
        {hasShops ? (
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
                  name={shop.name}
                  distance={shop.distance}
                  isOpen={shop.isOpen}
                  imageUrl={shop.imageUrl}
                />
              ))}
            </div>
          </>
        ) : (
          /* 빈 상태 UI */
          <div className="flex w-full flex-col items-center justify-center py-12">
            <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-grey-100">
              <Store size={32} className="stroke-grey-400" strokeWidth={1.5} />
            </div>
            <p className="mb-1 text-[16px] font-semibold leading-[1.5] tracking-[-0.16px] text-grey-900">
              이 지역에 등록된 매장이 없어요
            </p>
            <p className="text-[14px] font-normal leading-[1.5] tracking-[-0.14px] text-grey-500">
              다른 지역을 검색해보세요
            </p>
          </div>
        )}
      </div>
    </BottomSheet>
  );
}
