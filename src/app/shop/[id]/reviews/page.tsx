"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { Plus, Heart, ArrowUpDown } from "lucide-react";
import { Button, BackHeader } from "@/components/common";
import { ReviewResponse, ReviewSortOption } from "@/types/api";

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
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [sortBy, setSortBy] = useState<ReviewSortOption>("LATEST");
  const [page, setPage] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  const isValidShopId = shopId !== null;
  const validShopId = shopId ?? 0; // hooks에서 사용할 안전한 값

  // 리뷰 목록 불러오기
  const fetchReviews = useCallback(
    async (pageNum: number, isRefresh: boolean = false) => {
      if (isRefresh) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      try {
        // TODO: 실제 API 호출로 교체
        // const response = await axios.get(`/api/shops/${shopId}/reviews`, {
        //   params: { sortBy, page: pageNum, size: 10 }
        // });
        // if (response.data.success) {
        //   const data = response.data.data;
        //   if (isRefresh) {
        //     setReviews(data.content);
        //   } else {
        //     setReviews(prev => [...prev, ...data.content]);
        //   }
        //   setHasNext(data.hasNext);
        //   setTotalCount(data.totalCount);
        //   setPage(data.page);
        // }

        await new Promise((resolve) => setTimeout(resolve, 500));

        // Mock 데이터 (빈 배열)
        if (isRefresh) {
          setReviews([]);
        }
        setHasNext(false);
        setTotalCount(0);
        setPage(pageNum);
      } catch {
        console.error("리뷰 목록 불러오기 실패");
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [validShopId, sortBy]
  );

  // 초기 로딩 및 정렬 변경 시
  useEffect(() => {
    if (!isValidShopId) return;
    setPage(0);
    fetchReviews(0, true);
  }, [fetchReviews, isValidShopId]);

  // 무한 스크롤
  useEffect(() => {
    if (isLoading || isLoadingMore || !hasNext) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNext && !isLoadingMore) {
          fetchReviews(page + 1, false);
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [isLoading, isLoadingMore, hasNext, page, fetchReviews]);

  // 정렬 변경
  const handleSortToggle = () => {
    setSortBy((prev) => (prev === "LATEST" ? "LIKE_COUNT" : "LATEST"));
  };

  // 리뷰 작성
  const handleWriteReview = () => {
    router.push(`/shop/${validShopId}/review/write`);
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

  // 좋아요 토글
  const handleLikeToggle = async (reviewId: number) => {
    // TODO: 좋아요 API 호출
    // await axios.post(`/api/reviews/${reviewId}/like`);

    // Optimistic update
    setReviews((prev) =>
      prev.map((review) =>
        review.id === reviewId
          ? {
              ...review,
              isLiked: !review.isLiked,
              likeCount: review.isLiked ? review.likeCount - 1 : review.likeCount + 1,
            }
          : review
      )
    );
  };

  return (
    <div className="min-h-dvh bg-default flex flex-col">
      {/* 헤더 */}
      <BackHeader
        showBorder
        rightElement={
          <button onClick={handleWriteReview} aria-label="리뷰 작성">
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
              {isLoadingMore && (
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
