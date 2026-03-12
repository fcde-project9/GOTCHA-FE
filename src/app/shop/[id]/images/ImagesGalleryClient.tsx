"use client";

import { useParams, useRouter } from "next/navigation";
import { useShopDetail } from "@/api/queries/useShopDetail";
import { ImagesGalleryOverlay } from "@/components/common";
import { DEFAULT_IMAGES } from "@/constants/images";

function parseShopId(id: string | string[] | undefined): number | null {
  if (typeof id !== "string") return null;
  const parsed = Number(id);
  if (Number.isNaN(parsed) || !Number.isInteger(parsed) || parsed <= 0) return null;
  return parsed;
}

export default function ImagesGalleryClient() {
  const params = useParams();
  const router = useRouter();
  const shopId = parseShopId(params.id);
  const validShopId = shopId ?? 0;

  const { data: shop, isLoading, isError } = useShopDetail(validShopId);

  if (!shopId) {
    return (
      <div className="flex flex-col items-center justify-center h-64 px-5">
        <p className="text-[15px] text-grey-500">잘못된 업체 정보입니다.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-grey-200 border-t-main" />
      </div>
    );
  }

  if (isError || !shop) {
    return (
      <div className="flex flex-col items-center justify-center h-64 px-5">
        <p className="text-[15px] text-grey-500">업체 정보를 불러오는데 실패했어요.</p>
      </div>
    );
  }

  const images = [
    ...(shop.mainImageUrl && shop.mainImageUrl !== DEFAULT_IMAGES.SHOP_DEFAULT
      ? [shop.mainImageUrl]
      : []),
    ...shop.reviews.flatMap((review) => review.imageUrls),
  ];

  if (images.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 px-5">
        <p className="text-[15px] text-grey-500">등록된 사진이 없어요.</p>
      </div>
    );
  }

  return <ImagesGalleryOverlay images={images} onClose={() => router.back()} />;
}
