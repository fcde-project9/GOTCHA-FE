"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { ChevronDown, ThumbsUp, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { useDeleteReview } from "@/api/mutations/useDeleteReview";
import { useToggleReviewLike } from "@/api/mutations/useToggleReviewLike";
import { useInfiniteReviews } from "@/api/queries/useInfiniteReviews";
import { Button, BackHeader } from "@/components/common";
import { ReviewDeleteConfirmModal } from "@/components/features/review/ReviewDeleteConfirmModal";
import { ReviewWriteModal } from "@/components/features/review/ReviewWriteModal";
import { useToast } from "@/hooks";
import type { ReviewResponse, ReviewSortOption } from "@/types/api";
import { formatDate } from "@/utils";

// 리뷰 아이템 컴포넌트
function ReviewListItem({
  review,
  onLikeToggle,
  onEdit,
  onDelete,
}: {
  review: ReviewResponse;
  onLikeToggle: (reviewId: number) => void;
  onEdit: (reviewId: number) => void;
  onDelete: (reviewId: number) => void;
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // 메뉴 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isMenuOpen]);

  return (
    <div className="bg-grey-50 rounded-[10px] p-[14px] flex flex-col gap-4">
      {/* 닉네임 & 메뉴 */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-[12px] text-grey-600 leading-[1.5]">{review.author.nickname}</span>
          {review.isOwner && (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center justify-center h-6"
                aria-label="메뉴"
              >
                <MoreVertical size={16} className="text-grey-500" />
              </button>
              {/* 드롭다운 메뉴 */}
              {isMenuOpen && (
                <div className="absolute right-0 top-6 z-10 bg-white rounded-lg shadow-[0px_0px_10px_0px_rgba(0,0,0,0.2)] overflow-hidden">
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      onEdit(review.id);
                    }}
                    className="flex items-center gap-2 px-3 py-2 w-full hover:bg-grey-50"
                  >
                    <Pencil size={16} className="text-grey-900" />
                    <span className="text-[14px] text-grey-900 whitespace-nowrap">수정하기</span>
                  </button>
                  <div className="border-t border-grey-100" />
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      onDelete(review.id);
                    }}
                    className="flex items-center gap-2 px-3 py-2 w-full hover:bg-grey-50"
                  >
                    <Trash2 size={16} className="text-error" />
                    <span className="text-[14px] text-error whitespace-nowrap">삭제하기</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 리뷰 내용 */}
        <p className="text-[15px] text-grey-900 leading-[1.5] tracking-[-0.15px]">
          {review.content}
        </p>

        {/* 리뷰 이미지 */}
        {review.imageUrls && review.imageUrls.length > 0 && (
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {review.imageUrls.map((imageUrl, index) => (
              <div
                key={index}
                className="shrink-0 w-[105px] h-[105px] rounded-lg overflow-hidden bg-grey-100"
              >
                <Image
                  src={imageUrl}
                  alt={`리뷰 이미지 ${index + 1}`}
                  width={105}
                  height={105}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 날짜 & 좋아요 */}
      <div className="flex items-center gap-[14px]">
        <span className="text-[12px] text-grey-400 leading-[1.5]">
          {formatDate(review.createdAt)}
        </span>
        <button
          onClick={() => onLikeToggle(review.id)}
          className="flex items-center gap-[3px]"
          aria-label={review.isLiked ? "좋아요 취소" : "좋아요"}
        >
          <ThumbsUp
            size={16}
            className={
              review.isLiked ? "fill-grey-800 stroke-grey-800" : "stroke-grey-500 fill-none"
            }
            strokeWidth={1.5}
          />
          <span className="text-[12px] text-grey-800 tracking-[-0.264px]">{review.likeCount}</span>
        </button>
      </div>
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
  const { showToast } = useToast();
  const shopId = parseShopId(params.id);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const [sortBy, setSortBy] = useState<ReviewSortOption>("LATEST");
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const sortDropdownRef = useRef<HTMLDivElement>(null);

  const isValidShopId = shopId !== null;
  const validShopId = shopId ?? 0;

  // 정렬 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
        setIsSortDropdownOpen(false);
      }
    };

    if (isSortDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isSortDropdownOpen]);

  // React Query 무한 스크롤 훅
  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage, error, refetch } =
    useInfiniteReviews(validShopId, sortBy);

  // 모든 페이지의 리뷰를 평탄화
  const reviews = data?.pages.flatMap((page) => page.content) ?? [];
  const totalCount = data?.pages[0]?.totalCount ?? 0;

  // 리뷰 수정 상태 (수정할 리뷰 데이터)
  const [editingReview, setEditingReview] = useState<ReviewResponse | null>(null);

  // 리뷰 삭제 상태 (삭제할 리뷰 ID)
  const [deletingReviewId, setDeletingReviewId] = useState<number | null>(null);

  // 리뷰 삭제 mutation hook
  const deleteReviewMutation = useDeleteReview(validShopId, deletingReviewId ?? 0);

  // 리뷰 좋아요 토글 mutation hook
  const toggleReviewLikeMutation = useToggleReviewLike();

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
  const handleSortChange = (newSortBy: ReviewSortOption) => {
    setSortBy(newSortBy);
    setIsSortDropdownOpen(false);
  };

  // 좋아요 토글
  const handleLikeToggle = (reviewId: number) => {
    const review = reviews.find((r) => r.id === reviewId);
    if (!review) return;

    toggleReviewLikeMutation.mutate(
      { reviewId, isLiked: review.isLiked },
      {
        onSuccess: () => {
          refetch();
        },
        onError: (error) => {
          showToast(error.message || "좋아요 처리에 실패했어요.");
        },
      }
    );
  };

  // 리뷰 수정 모달 열기
  const handleEditReview = (reviewId: number) => {
    const reviewToEdit = reviews.find((r) => r.id === reviewId);
    if (reviewToEdit) {
      setEditingReview(reviewToEdit);
    }
  };

  // 리뷰 삭제 확인 모달 열기
  const handleDeleteReview = (reviewId: number) => {
    setDeletingReviewId(reviewId);
  };

  // 리뷰 삭제 실행
  const handleConfirmDelete = () => {
    if (!deletingReviewId) return;

    deleteReviewMutation.mutate(undefined, {
      onSuccess: () => {
        showToast("리뷰가 삭제되었어요.");
        setDeletingReviewId(null);
        refetch();
      },
      onError: (error) => {
        showToast(error.message || "리뷰 삭제에 실패했어요.");
      },
    });
  };

  // 유효하지 않은 shopId 처리
  if (!isValidShopId) {
    return (
      <div className="min-h-dvh bg-default flex flex-col">
        <BackHeader title="방문 리뷰 상세" />
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
      <BackHeader title="방문 리뷰 상세" />

      {/* 컨텐츠 */}
      <div className="flex-1">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-grey-200 border-t-main" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-64 px-5">
            <p className="text-[15px] text-grey-500 mb-4">리뷰를 불러오는데 실패했어요.</p>
            <Button variant="primary" size="small" onClick={() => router.back()}>
              돌아가기
            </Button>
          </div>
        ) : reviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 px-5">
            <p className="text-[15px] text-grey-500 mb-4">아직 작성된 리뷰가 없어요.</p>
            <Button variant="primary" size="small" onClick={() => router.back()}>
              돌아가기
            </Button>
          </div>
        ) : (
          <div className="px-5 pt-3">
            {/* 정렬 & 총 개수 */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center text-[14px] text-grey-900 tracking-[-0.14px]">
                <span>총&nbsp;</span>
                <span>{totalCount}개</span>
              </div>
              <div className="relative" ref={sortDropdownRef}>
                <button
                  onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                  className="flex items-center gap-1 text-[14px] text-grey-700"
                >
                  <span>{sortBy === "LATEST" ? "최신순" : "좋아요순"}</span>
                  <ChevronDown
                    size={16}
                    className={`text-grey-700 transition-transform ${isSortDropdownOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {/* 정렬 드롭다운 */}
                {isSortDropdownOpen && (
                  <div className="absolute right-0 top-6 z-10 bg-white rounded-lg shadow-[0px_0px_10px_0px_rgba(0,0,0,0.2)] overflow-hidden min-w-[80px]">
                    <button
                      onClick={() => handleSortChange("LATEST")}
                      className={`flex items-center px-3 py-2 w-full text-[14px] ${
                        sortBy === "LATEST" ? "text-main font-medium" : "text-grey-700"
                      } hover:bg-grey-50`}
                    >
                      최신순
                    </button>
                    <div className="border-t border-grey-100" />
                    <button
                      onClick={() => handleSortChange("LIKE_COUNT")}
                      className={`flex items-center px-3 py-2 w-full text-[14px] ${
                        sortBy === "LIKE_COUNT" ? "text-main font-medium" : "text-grey-700"
                      } hover:bg-grey-50`}
                    >
                      좋아요순
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* 리뷰 목록 */}
            <div className="flex flex-col gap-2">
              {reviews.map((review) => (
                <ReviewListItem
                  key={review.id}
                  review={review}
                  onLikeToggle={handleLikeToggle}
                  onEdit={handleEditReview}
                  onDelete={handleDeleteReview}
                />
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
          </div>
        )}
      </div>

      {/* 리뷰 수정 모달 */}
      {editingReview && (
        <ReviewWriteModal
          shopId={validShopId}
          isOpen={!!editingReview}
          onClose={() => setEditingReview(null)}
          onSuccess={() => refetch()}
          reviewId={editingReview.id}
          initialData={{
            content: editingReview.content,
            imageUrls: editingReview.imageUrls,
          }}
        />
      )}

      {/* 리뷰 삭제 확인 모달 */}
      <ReviewDeleteConfirmModal
        isOpen={!!deletingReviewId}
        isLoading={deleteReviewMutation.isPending}
        onClose={() => setDeletingReviewId(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
