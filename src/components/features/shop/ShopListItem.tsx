"use client";

import { useState } from "react";
import { Heart, Navigation } from "lucide-react";
import StatusBadge from "./StatusBadge";

interface ShopListItemProps {
  name: string;
  distance: string;
  isOpen: boolean;
  imageUrl?: string;
}

export default function ShopListItem({ name, distance, isOpen, imageUrl }: ShopListItemProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <div className="relative w-full">
      <div className="flex gap-[10px] items-center w-full py-4">
        {/* 이미지 */}
        <div className="relative rounded-[5px] shrink-0 size-[85px] bg-gray-200">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={name}
              className="absolute inset-0 w-full h-full object-cover rounded-[5px]"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-xs">
              No Image
            </div>
          )}
        </div>

        {/* 정보 */}
        <div className="flex flex-col gap-[4px] h-[85px] flex-1 min-w-0">
          {/* 상단: 영업상태 & 좋아요 */}
          <div className="flex items-center justify-between w-full">
            <StatusBadge isOpen={isOpen} />

            {/* 하트 아이콘 */}
            <button
              onClick={() => setIsFavorite(!isFavorite)}
              className="w-6 h-6 flex items-center justify-center focus:outline-none"
            >
              <Heart
                size={24}
                className={isFavorite ? "stroke-main fill-main" : "stroke-grey-700 fill-none"}
                strokeWidth={1.5}
              />
            </button>
          </div>

          {/* 가게 이름 */}
          <p className="text-[18px] font-semibold text-grey-900 tracking-[-0.18px] overflow-hidden text-ellipsis whitespace-nowrap font-pretendard leading-[150%]">
            {name}
          </p>

          {/* 거리 정보 */}
          <div className="flex gap-[4px] items-center">
            <Navigation
              size={16}
              className="fill-grey-700 stroke-grey-700 shrink-0"
              strokeWidth={1.25}
            />
            <span className="text-[14px] font-normal text-grey-700 tracking-[-0.14px] font-pretendard leading-[150%]">
              현재 위치에서
            </span>
            <span className="text-[14px] font-medium text-grey-800 tracking-[-0.14px] font-pretendard leading-[150%]">
              {distance}
            </span>
          </div>
        </div>
      </div>

      {/* 하단 구분선 */}
      <div className="absolute left-0 bottom-0 w-full h-[1px] bg-grey-100" />
    </div>
  );
}
