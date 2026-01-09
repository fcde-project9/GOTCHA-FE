"use client";

import { ShopListView } from "@/utils/shop";
import { BottomSheet } from "../ui";
import ShopListItem from "./ShopListItem";

interface ShopListBottomSheetProps {
  shops: ShopListView[];
  onHeightChange?: (height: number, isDragging: boolean) => void;
}

export default function ShopListBottomSheet({ shops, onHeightChange }: ShopListBottomSheetProps) {
  return (
    <BottomSheet
      // Uses default snap points from BottomSheet (SSR-safe)
      defaultSnapPoint={0}
      onHeightChange={onHeightChange}
    >
      <div className="flex flex-col items-center gap-2 px-5">
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
      </div>
    </BottomSheet>
  );
}
