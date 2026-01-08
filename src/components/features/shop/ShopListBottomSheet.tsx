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
      <div className="flex flex-col items-center gap-2 shrink-0 px-5">
        {/* 헤더 섹션 */}
        <div className="flex items-center justify-between w-full pb-4">
          <span className="text-[14px] font-normal text-grey-900 font-pretendard leading-[150%] tracking-[-0.14px]">
            총 {shops.length}개
          </span>
          <button className="text-[14px] font-normal text-grey-700 font-pretendard leading-[150%] tracking-[-0.14px]">거리순</button>
        </div>

        {/* 가게 목록 */}
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
    </BottomSheet>
  );
}
