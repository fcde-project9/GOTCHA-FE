"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { MapPin, Heart } from "lucide-react";
import StatusBadge from "@/components/features/shop/StatusBadge";
import { DEFAULT_IMAGES } from "@/constants";
import { useFavorite, useToast } from "@/hooks";
import type { FavoriteShopResponse } from "@/types/api";

interface FavoriteShopItemProps {
  shop: FavoriteShopResponse;
}

/**
 * 찜한 업체 아이템 컴포넌트
 */
export function FavoriteShopItem({ shop }: FavoriteShopItemProps) {
  const router = useRouter();
  const { showToast } = useToast();

  const { isFavorite, isLoading, toggleFavorite } = useFavorite({
    shopId: shop.id,
    initialIsFavorite: true, // 찜 목록에 있으므로 초기값 true
    onUnauthorized: () => {
      showToast("찜하기는 로그인 후 이용 가능해요.");
    },
  });

  const handleHeartClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // 부모 클릭 이벤트 전파 방지
    toggleFavorite();
  };

  const handleItemClick = () => {
    router.push(`/shop/${shop.id}`);
  };

  return (
    <div
      onClick={handleItemClick}
      className="flex cursor-pointer gap-2.5 border-b border-line-100 py-4 last:border-b-0"
    >
      {/* 업체 이미지 */}
      <div className="relative h-[85px] w-[85px] shrink-0 overflow-hidden rounded-[5px]">
        <Image
          src={shop.mainImageUrl || DEFAULT_IMAGES.NO_IMAGE}
          alt={shop.name}
          fill
          sizes="85px"
          className="object-cover"
        />
      </div>

      {/* 업체 정보 */}
      <div className="flex flex-1 flex-col justify-between gap-1 min-w-0">
        {/* 상단: 영업상태 & 찜 버튼 */}
        <div className="flex items-center justify-between">
          {/* 영업상태 뱃지 */}
          <StatusBadge openStatus={shop.openStatus} />

          {/* 찜 토글 버튼 */}
          <button
            onClick={handleHeartClick}
            disabled={isLoading}
            className="ml-auto flex h-6 w-6 items-center justify-center disabled:opacity-50"
            aria-label={isFavorite ? "찜 해제" : "찜하기"}
          >
            <Heart
              size={24}
              className={isFavorite ? "fill-main stroke-main" : "fill-none stroke-grey-400"}
              strokeWidth={1.5}
            />
          </button>
        </div>

        {/* 업체명 */}
        <p className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-[18px] font-semibold leading-[1.5] tracking-[-0.18px] text-grey-900">
          {shop.name}
        </p>

        {/* 주소 */}
        <div className="flex items-center gap-1 min-w-0">
          <MapPin size={16} className="shrink-0 stroke-grey-600" strokeWidth={2} />
          <p className="flex-1 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-[14px] font-normal leading-[1.5] tracking-[-0.14px] text-grey-600">
            {shop.address}
          </p>
        </div>
      </div>
    </div>
  );
}
