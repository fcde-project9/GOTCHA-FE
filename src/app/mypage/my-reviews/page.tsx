"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronUp, ThumbsUp } from "lucide-react";
import { useMyReviews, type MyReviewsSort } from "@/api/queries/useMyReviews";
import { BackHeader, Spinner } from "@/components/common";
import { DEFAULT_IMAGES } from "@/constants";
import { formatDate } from "@/utils";
import { isNativeApp } from "@/utils/platform";

export default function MyReviewsPage() {
  const router = useRouter();
  const [sortBy, setSortBy] = useState<MyReviewsSort>("LATEST");
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  const { data: reviewsData, isLoading, error } = useMyReviews(sortBy);

  const reviews = useMemo(() => reviewsData?.content ?? [], [reviewsData]);
  const totalCount = reviewsData?.totalCount ?? reviews.length;

  const handleShopClick = (shopId: number) => {
    if (isNativeApp()) {
      router.push(`/shop/0?shopId=${shopId}`);
    } else {
      router.push(`/shop/${shopId}`);
    }
  };

  const handleSortChange = (next: MyReviewsSort) => {
    setSortBy(next);
    setShowSortDropdown(false);
  };

  if (isLoading) {
    return (
      <main className="h-safe-viewport overflow-hidden relative bg-default flex flex-col">
        <BackHeader title="작성한 리뷰" />
        <div className="flex flex-1 items-center justify-center">
          <Spinner />
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="h-safe-viewport overflow-hidden relative bg-default flex flex-col">
        <BackHeader title="작성한 리뷰" />
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-5">
          <p className="text-center text-[16px] font-normal leading-[1.5] tracking-[-0.16px] text-grey-600">
            작성한 리뷰 목록을 불러올 수 없어요.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="h-safe-viewport overflow-hidden relative bg-default flex flex-col">
      <BackHeader title="작성한 리뷰" />

      {reviews.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-7 px-5 -mt-14">
          <div className="flex flex-col items-center gap-7">
            <Image
              src={DEFAULT_IMAGES.MY_SHOP}
              alt="작성한 리뷰 없음"
              width={76}
              height={110}
              className="object-contain"
            />
            <p className="text-center text-[20px] font-semibold leading-[1.4] tracking-[-0.2px] text-grey-900">
              아직 작성한 리뷰가 없어요.
              <br />첫 리뷰를 남겨보세요!
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="flex-shrink-0 mt-3 mb-2 flex items-center justify-between px-5">
            <div className="flex items-center text-[16px] font-normal leading-[1.5] tracking-[-0.16px] text-grey-900">
              <span>총&nbsp;</span>
              <span>{totalCount}개</span>
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => setShowSortDropdown(!showSortDropdown)}
                className="flex items-center gap-1 text-[16px] font-normal leading-[1.5] tracking-[-0.16px] text-grey-700"
              >
                <span>{sortBy === "LATEST" ? "최신순" : "좋아요순"}</span>
                {showSortDropdown ? (
                  <ChevronUp size={18} className="stroke-grey-700" />
                ) : (
                  <ChevronDown size={18} className="stroke-grey-700" />
                )}
              </button>

              {showSortDropdown && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowSortDropdown(false)} />
                  <div className="absolute right-0 top-6 z-20 bg-white rounded-lg shadow-lg border border-grey-100 py-1 min-w-[100px]">
                    <button
                      type="button"
                      onClick={() => handleSortChange("LATEST")}
                      className={`w-full px-3 py-2 text-left text-[16px] leading-[1.5] tracking-[-0.16px] ${
                        sortBy === "LATEST" ? "text-main font-medium" : "text-grey-700 font-normal"
                      }`}
                    >
                      최신순
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSortChange("LIKE_COUNT")}
                      className={`w-full px-3 py-2 text-left text-[16px] leading-[1.5] tracking-[-0.16px] ${
                        sortBy === "LIKE_COUNT"
                          ? "text-main font-medium"
                          : "text-grey-700 font-normal"
                      }`}
                    >
                      좋아요순
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-5 pb-5">
            <div className="flex flex-col gap-2">
              {reviews.map((review) => (
                <button
                  key={review.id}
                  type="button"
                  onClick={() => handleShopClick(review.shopId)}
                  className="bg-grey-50 rounded-[10px] p-[14px] flex flex-col gap-4 w-full text-left"
                >
                  <div className="flex flex-col gap-2 w-full">
                    <div className="flex items-center justify-between h-6">
                      <span className="text-[13px] font-normal leading-[1.5] tracking-[-0.13px] text-grey-600">
                        {review.shopName}
                      </span>
                    </div>

                    <p className="text-[17px] font-normal leading-[1.5] tracking-[-0.17px] text-grey-900 break-words">
                      {review.content}
                    </p>

                    {review.imageUrls.length > 0 && (
                      <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                        {review.imageUrls.map((imageUrl, index) => (
                          <div
                            key={index}
                            className="relative shrink-0 size-[105px] rounded-[8px] overflow-hidden bg-grey-100"
                          >
                            <Image
                              src={imageUrl}
                              alt={`리뷰 이미지 ${index + 1}`}
                              fill
                              sizes="105px"
                              className="object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-[14px]">
                    <span className="text-[13px] font-normal leading-[1.5] tracking-[-0.13px] text-grey-400">
                      {formatDate(review.createdAt)}
                    </span>
                    <div className="flex items-center gap-[3px]">
                      <ThumbsUp
                        size={18}
                        className={
                          review.isLiked
                            ? "fill-grey-800 stroke-grey-800"
                            : "stroke-grey-500 fill-none"
                        }
                        strokeWidth={1.5}
                      />
                      <span className="text-[12px] font-normal leading-[1.5] tracking-[-0.264px] text-grey-800">
                        {review.likeCount}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </main>
  );
}
