"use client";

import { useMemo } from "react";
import Image from "next/image";
import { Spinner } from "@/components/common";
import { DEFAULT_IMAGES } from "@/constants";
import { ShopListView } from "@/utils/shop";
import { BottomSheet } from "../ui";
import ShopListItem from "./ShopListItem";

interface ShopListBottomSheetProps {
  shops: ShopListView[];
  isLoading?: boolean;
  onHeightChange?: (height: number, isDragging: boolean) => void;
  animateIn?: boolean;
  animateOut?: boolean;
  onShopSelect?: (shopId: number) => void;
}

export default function ShopListBottomSheet({
  shops,
  isLoading,
  onHeightChange,
  animateIn = false,
  animateOut = false,
  onShopSelect,
}: ShopListBottomSheetProps) {
  const hasShops = shops.length > 0;

  // shops의 ID 목록을 문자열로 변환하여 변경 감지
  const shopsKey = useMemo(() => {
    return shops.map((shop) => shop.id).join(",");
  }, [shops]);

  return (
    <BottomSheet
      // Uses default snap points from BottomSheet (SSR-safe)
      // 0: collapsed (Grabber만), 1: default (헤더+2개), 2: expanded (전체)
      defaultSnapPoint={1}
      onHeightChange={onHeightChange}
      animateIn={animateIn}
      animateOut={animateOut}
      scrollToTop={shopsKey}
    >
      <div className="flex flex-col items-center gap-2 px-5 h-full">
        {isLoading ? (
          /* 로딩 상태 UI */
          <div className="flex w-full flex-col items-center justify-center h-full">
            <Spinner />
          </div>
        ) : hasShops ? (
          <>
            {/* 헤더 섹션 */}
            <div className="flex w-full items-center justify-between">
              <div className="flex items-center gap-0">
                <span className="text-[15px] font-normal leading-[1.5] tracking-[-0.15px] text-grey-900">
                  총&nbsp;
                </span>
                <span className="text-[15px] font-normal leading-[1.5] tracking-[-0.15px] text-grey-900">
                  {shops.length}개
                </span>
              </div>
              <button className="text-right text-[15px] font-normal leading-[1.5] tracking-[-0.15px] text-grey-900">
                거리순
              </button>
            </div>

            {/* 가게 목록 */}
            <div className="flex w-full flex-col pb-safe">
              {shops.map((shop, index) => (
                <ShopListItem
                  key={shop.id}
                  shopId={shop.id}
                  name={shop.name}
                  distance={shop.distance}
                  openStatus={shop.openStatus}
                  imageUrl={shop.imageUrl}
                  isFavorite={shop.isFavorite}
                  onSelect={onShopSelect}
                  isLast={index === shops.length - 1}
                />
              ))}
            </div>
          </>
        ) : (
          /* 빈 상태 UI */
          <div className="flex w-full flex-col items-center justify-center h-full">
            <div className="mb-4 flex items-center justify-center flex-shrink-0 w-20">
              <Image
                src={DEFAULT_IMAGES.SHOP_LIST_EMPTY}
                alt="shop-list-empty"
                width={80}
                height={80}
              />
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
