"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Heart, Navigation } from "lucide-react";
import { DEFAULT_IMAGES } from "@/constants";
import { useFavorite, useToast } from "@/hooks";
import StatusBadge from "./StatusBadge";

interface ShopListItemProps {
  shopId: number;
  name: string;
  distance: string;
  openStatus: string; // "영업 중", "영업 종료", "휴무", ""
  imageUrl?: string;
  isFavorite?: boolean;
  onSelect?: (shopId: number) => void;
}

export default function ShopListItem({
  shopId,
  name,
  distance,
  openStatus,
  imageUrl,
  isFavorite: initialIsFavorite = false,
  onSelect,
}: ShopListItemProps) {
  const router = useRouter();
  const { showToast } = useToast();

  const { isFavorite, isLoading, toggleFavorite } = useFavorite({
    shopId,
    initialIsFavorite,
    onUnauthorized: () => {
      showToast("찜하기는 로그인 후 이용 가능해요.");
    },
  });

  const handleItemClick = () => {
    if (onSelect) {
      onSelect(shopId);
    } else {
      router.push(`/shop/${shopId}`);
    }
  };

  return (
    <div className="relative w-full">
      <div className="flex gap-[10px] items-center w-full py-4">
        {/* 이미지 */}
        <button
          onClick={handleItemClick}
          className="relative rounded-[5px] shrink-0 size-[85px] overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-main"
        >
          <Image
            src={imageUrl || DEFAULT_IMAGES.NO_IMAGE}
            alt={name}
            fill
            className="object-cover"
          />
        </button>

        {/* 정보 */}
        <div className="flex flex-col gap-[4px] h-[85px] flex-1 min-w-0">
          {/* 상단: 영업상태 & 좋아요 */}
          <div className="flex items-center justify-between w-full">
            <StatusBadge openStatus={openStatus} />

            {/* 하트 아이콘 */}
            <button
              onClick={toggleFavorite}
              disabled={isLoading}
              className="ml-auto w-6 h-6 flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-main rounded-sm disabled:opacity-50"
              aria-label={isFavorite ? `${name} 찜 취소` : `${name} 찜하기`}
              aria-pressed={isFavorite}
              type="button"
            >
              <Heart
                size={24}
                className={isFavorite ? "stroke-main fill-main" : "stroke-grey-700 fill-none"}
                strokeWidth={1.5}
                aria-hidden="true"
              />
            </button>
          </div>

          {/* 가게 이름 */}
          <button
            onClick={handleItemClick}
            className="text-left focus:outline-none focus-visible:underline"
          >
            <p className="text-[18px] font-semibold text-grey-900 tracking-[-0.18px] overflow-hidden text-ellipsis whitespace-nowrap font-pretendard leading-[150%]">
              {name}
            </p>
          </button>

          {/* 거리 정보 */}
          {distance && (
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
          )}
        </div>
      </div>

      {/* 하단 구분선 */}
      <div className="absolute left-0 bottom-0 w-full h-[1px] bg-grey-100" />
    </div>
  );
}
