"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { Plus, Heart, ArrowUpDown } from "lucide-react";
import { useInfiniteReviews } from "@/api/queries/useInfiniteReviews";
import { Button, BackHeader } from "@/components/common";
import type { ReviewResponse, ReviewSortOption } from "@/types/api";

// 날짜 포맷팅
function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}`;
}

// 리뷰 아이템 컴포넌트
function ReviewListItem({
  review,
  onLikeToggle,
}: {
  review: ReviewResponse;
  onLikeToggle: (reviewId: number) => void;
}) {
  return (
    <div className="py-4 border-b border-grey-100 last:border-b-0">
      {/* 작성자 정보 */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-full overflow-hidden bg-grey-100">
          {review.author.profileImageUrl ? (
            <Image
              src={review.author.profileImageUrl}
              alt={review.author.nickname}
              width={32}
              height={32}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-grey-400 text-[12px]">
              {review.author.nickname.charAt(0)}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-semibold text-grey-900 truncate">
            {review.author.nickname}
          </p>
        </div>
        <span className="text-[12px] text-grey-400">{formatDate(review.createdAt)}</span>
      </div>

      {/* 내용 */}
      <p className="text-[14px] text-grey-700 leading-[1.6] mb-3 whitespace-pre-wrap">
        {review.content}
      </p>

      {/* 이미지 */}
      {review.imageUrls.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2 mb-3">
          {review.imageUrls.map((imageUrl, index) => (
            <div key={index} className="shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-grey-100">
              <Image
                src={imageUrl}
                alt={`리뷰 이미지 ${index + 1}`}
                width={80}
                height={80}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      )}

      {/* 좋아요 버튼 */}
      <button
        type="button"
        onClick={() => onLikeToggle(review.id)}
        className="flex items-center gap-1 text-[13px] text-grey-500"
      >
        <Heart
          size={16}
          className={review.isLiked ? "fill-main stroke-main" : "stroke-grey-400 fill-none"}
          strokeWidth={1.5}
        />
        <span className={review.isLiked ? "text-main" : ""}>{review.likeCount}</span>
      </button>
    </div>
  );
}

// shopId 파싱 및 검증
function parseShopId(id: string | string[] | undefined): number | null {
  if (typeof id !== "string") return null;
  const parsed = Number(id);
  if (Number.isNaN(parsed) || !Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }
  return parsed;
}

export default function ReviewsListPage() {
  const params = useParams();
  const router = useRouter();
  const shopId = parseShopId(params.id);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const [sortBy, setSortBy] = useState<ReviewSortOption>("LATEST");

  const isValidShopId = shopId !== null;
  const validShopId = shopId ?? 0;

  // React Query 무한 스크롤 훅
  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage, error } =
    useInfiniteReviews(validShopId, sortBy);

  // 모든 페이지의 리뷰를 평탄화
  const reviews = data?.pages.flatMap((page) => page.content) ?? [];
  const totalCount = data?.pages[0]?.totalCount ?? 0;

  // 무한 스크롤 Intersection Observer
  useEffect(() => {
    if (isLoading || isFetchingNextPage || !hasNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [isLoading, isFetchingNextPage, hasNextPage, fetchNextPage]);

  // 정렬 변경
  const handleSortToggle = () => {
    setSortBy((prev) => (prev === "LATEST" ? "LIKE_COUNT" : "LATEST"));
  };

  // 리뷰 작성
  const handleWriteReview = () => {
    router.push(`/shop/${validShopId}/review/write`);
  };

  // 좋아요 토글 (TODO: useMutation으로 구현)
  const handleLikeToggle = async (reviewId: number) => {
    // TODO: 좋아요 API mutation 구현
    console.log("Like toggle:", reviewId);
  };

  // 유효하지 않은 shopId 처리
  if (!isValidShopId) {
    return (
      <div className="min-h-dvh bg-default flex flex-col">
        <BackHeader showBorder />
        <div className="flex-1 flex flex-col items-center justify-center px-5">
          <p className="text-[15px] text-grey-500 mb-4">잘못된 접근입니다</p>
          <Button variant="primary" size="small" onClick={() => router.push("/")}>
            홈으로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-default flex flex-col">
      {/* 헤더 */}
      <BackHeader
        showBorder
        rightElement={
          <button type="button" onClick={handleWriteReview} aria-label="리뷰 작성">
            <Plus size={24} className="text-grey-900" />
          </button>
        }
      />

      {/* 컨텐츠 */}
      <div className="flex-1">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-grey-200 border-t-main" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-64 px-5">
            <p className="text-[15px] text-grey-500 mb-4">리뷰를 불러오는데 실패했습니다</p>
            <Button variant="primary" size="small" onClick={() => router.back()}>
              돌아가기
            </Button>
          </div>
        ) : reviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 px-5">
            <Image
              src="/images/review-empty.png"
              alt="리뷰 없음"
              width={80}
              height={80}
              className="mb-4 opacity-60"
            />
            <p className="text-[15px] text-grey-500 mb-4">아직 작성된 리뷰가 없어요</p>
            <Button variant="primary" size="small" onClick={handleWriteReview}>
              첫 리뷰 작성하기
            </Button>
          </div>
        ) : (
          <>
            {/* 정렬 & 총 개수 */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-grey-100">
              <span className="text-[14px] text-grey-700">
                총 <span className="font-semibold text-grey-900">{totalCount}</span>개
              </span>
              <button
                type="button"
                onClick={handleSortToggle}
                className="flex items-center gap-1 text-[14px] text-grey-700"
              >
                <span>{sortBy === "LATEST" ? "최신순" : "좋아요순"}</span>
                <ArrowUpDown size={14} className="stroke-grey-700" />
              </button>
            </div>

            {/* 리뷰 목록 */}
            <div className="px-5">
              {reviews.map((review) => (
                <ReviewListItem key={review.id} review={review} onLikeToggle={handleLikeToggle} />
              ))}
            </div>

            {/* 무한 스크롤 로딩 */}
            <div ref={loadMoreRef} className="py-4">
              {isFetchingNextPage && (
                <div className="flex items-center justify-center">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-grey-200 border-t-main" />
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
