"use client";

import { BottomSheet } from "../ui";
import ShopListItem from "./ShopListItem";

interface Shop {
  id: number;
  name: string;
  distance: string;
  isOpen: boolean;
  imageUrl?: string;
}

interface ShopListBottomSheetProps {
  shops: Shop[];
}

export default function ShopListBottomSheet({ shops }: ShopListBottomSheetProps) {
  return (
    <BottomSheet
      snapPoints={[215, 450, typeof window !== "undefined" ? window.innerHeight - 100 : 700]}
      defaultSnapPoint={0}
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
