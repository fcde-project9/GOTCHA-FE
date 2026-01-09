"use client";

import Image from "next/image";
import { MapPin, Heart } from "lucide-react";
import StatusBadge from "@/components/features/shop/StatusBadge";

interface FavoriteShop {
  id: number;
  name: string;
  address: string; // 구/동까지 (예: 강남구 역삼동)
  isOpen: boolean;
  imageUrl?: string;
  createdAt: string;
}

interface FavoriteShopItemProps {
  shop: FavoriteShop;
  onRemove: () => void;
}

/**
 * 찜한 업체 아이템 컴포넌트
 */
export function FavoriteShopItem({ shop, onRemove }: FavoriteShopItemProps) {
  const handleShopClick = () => {
    // TODO: API 연동 - 업체 상세 페이지로 이동
    // router.push(`/shop/${shop.id}`);
    console.log("업체 클릭:", shop.id);
  };

  const handleHeartClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // 부모 클릭 이벤트 전파 방지
    onRemove();
  };

  return (
    <div
      onClick={handleShopClick}
      className="flex cursor-pointer gap-2.5 border-b border-line-100 py-4 last:border-b-0"
    >
      {/* 업체 이미지 */}
      <div className="relative h-[85px] w-[85px] shrink-0 overflow-hidden rounded-[5px]">
        {shop.imageUrl ? (
          <Image src={shop.imageUrl} alt={shop.name} fill className="object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-grey-100">
            <span className="text-[24px] text-grey-400">?</span>
          </div>
        )}
      </div>

      {/* 업체 정보 */}
      <div className="flex flex-1 flex-col justify-between gap-1 min-w-0">
        {/* 상단: 영업상태 & 찜 버튼 */}
        <div className="flex items-center justify-between">
          {/* 영업상태 뱃지 */}
          <StatusBadge isOpen={shop.isOpen} />

          {/* 찜 해제 버튼 */}
          <button
            onClick={handleHeartClick}
            className="flex h-6 w-6 items-center justify-center"
            aria-label="찜 해제"
          >
            <Heart size={24} className="fill-error stroke-error" strokeWidth={2} />
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
