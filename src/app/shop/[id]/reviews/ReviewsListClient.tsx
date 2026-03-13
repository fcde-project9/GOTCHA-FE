"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { useBlockUser } from "@/api/mutations/useBlockUser";
import { useCreateReport } from "@/api/mutations/useCreateReport";
import { useDeleteReview } from "@/api/mutations/useDeleteReview";
import { useToggleReviewLike } from "@/api/mutations/useToggleReviewLike";
import { useInfiniteReviews } from "@/api/queries/useInfiniteReviews";
import { useUser } from "@/api/queries/useUser";
import type { ReportReason, ReportTargetType } from "@/api/types";
import { Button, BackHeader, ImageViewerModal, Spinner } from "@/components/common";
import { BlockUserConfirmModal } from "@/components/features/review/BlockUserConfirmModal";
import { ReportBottomSheet } from "@/components/features/review/ReportReviewBottomSheet";
import { ReportSuccessModal } from "@/components/features/review/ReportSuccessModal";
import { ReviewDeleteConfirmModal } from "@/components/features/review/ReviewDeleteConfirmModal";
import { ReviewItem } from "@/components/features/review/ReviewItem";
import { ReviewWriteModal } from "@/components/features/review/ReviewWriteModal";
import { useAuth, useToast } from "@/hooks";
import type { ReviewResponse, ReviewSortOption } from "@/types/api";

// shopId 파싱 및 검증
function parseShopId(id: string | string[] | undefined): number | null {
  if (typeof id !== "string") return null;
  const parsed = Number(id);
  if (Number.isNaN(parsed) || !Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }
  return parsed;
}

export default function ReviewsListClient() {
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

  // 이미지 뷰어 모달 상태
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);

  // 리뷰 수정 상태 (수정할 리뷰 데이터)
  const [editingReview, setEditingReview] = useState<ReviewResponse | null>(null);

  // 리뷰 삭제 상태 (삭제할 리뷰 ID)
  const [deletingReviewId, setDeletingReviewId] = useState<number | null>(null);

  // 신고 상태
  const [reportTarget, setReportTarget] = useState<{ type: ReportTargetType; id: number } | null>(
    null
  );
  const [isReportSuccessOpen, setIsReportSuccessOpen] = useState(false);

  // 차단 상태
  const [blockTarget, setBlockTarget] = useState<{ userId: number; nickname: string } | null>(null);

  // 리뷰 삭제 mutation hook
  const deleteReviewMutation = useDeleteReview(validShopId, deletingReviewId ?? 0);

  // 리뷰 좋아요 토글 mutation hook
  const toggleReviewLikeMutation = useToggleReviewLike();

  // 신고/차단 mutation hooks
  const createReportMutation = useCreateReport();
  const blockUserMutation = useBlockUser();

  // 사용자 정보 조회 (ADMIN 권한 확인용)
  const { isAdmin } = useUser();
  const { isLoggedIn } = useAuth();

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
      { reviewId, isLiked: review.isLiked, shopId: validShopId },
      {
        onError: (error) => {
          showToast(error.message || "좋아요 처리에 실패했어요.", { variant: "warning" });
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
        showToast(error.message || "리뷰 삭제에 실패했어요.", { variant: "warning" });
      },
    });
  };

  // 신고 바텀시트 열기
  const handleReportReview = (reviewId: number) => {
    setReportTarget({ type: "REVIEW", id: reviewId });
  };

  const handleReportUser = (userId: number) => {
    setReportTarget({ type: "USER", id: userId });
  };

  // 신고 제출
  const handleSubmitReport = (reason: ReportReason, detail?: string) => {
    if (!reportTarget) return;

    createReportMutation.mutate(
      { targetType: reportTarget.type, targetId: reportTarget.id, reason, detail },
      {
        onSuccess: () => {
          setReportTarget(null);
          setIsReportSuccessOpen(true);
        },
        onError: (error) => {
          showToast(error.message || "신고 접수에 실패했어요.", { variant: "warning" });
        },
      }
    );
  };

  // 사용자 차단 다이얼로그 열기
  const handleBlockUser = (userId: number, nickname: string) => {
    setBlockTarget({ userId, nickname });
  };

  // 사용자 차단 실행
  const handleConfirmBlock = () => {
    if (!blockTarget) return;

    blockUserMutation.mutate(blockTarget.userId, {
      onSuccess: async () => {
        try {
          await refetch();
        } finally {
          setBlockTarget(null);
          showToast("사용자 차단이 완료되었어요!");
        }
      },
      onError: (error) => {
        showToast(error.message || "사용자 차단에 실패했어요.", { variant: "warning" });
      },
    });
  };

  // 유효하지 않은 shopId 처리
  if (!isValidShopId) {
    return (
      <div className="min-h-dvh bg-default flex flex-col w-full max-w-[480px] mx-auto">
        <BackHeader title="방문 리뷰 상세" />
        <div className="flex-1 flex flex-col items-center justify-center px-5">
          <p className="text-[15px] text-grey-500 mb-4">잘못된 접근이에요</p>
          <Button variant="primary" size="small" onClick={() => router.push("/")}>
            홈으로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-dvh bg-default flex flex-col overflow-hidden max-w-[480px] mx-auto">
      {/* 헤더 */}
      <BackHeader title="방문 리뷰 상세" />

      {/* 컨텐츠 */}
      <div className="flex-1 overflow-y-auto pb-3">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Spinner />
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
              <div className="flex items-center text-[16px] text-grey-900 tracking-[-0.16px]">
                <span>총&nbsp;</span>
                <span>{totalCount}개</span>
              </div>
              <div className="relative" ref={sortDropdownRef}>
                <button
                  onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                  className="flex items-center gap-1 text-[16px] text-grey-700"
                >
                  <span>{sortBy === "LATEST" ? "최신순" : "좋아요순"}</span>
                  <ChevronDown
                    size={16}
                    className={`text-grey-700 transition-transform ${isSortDropdownOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {/* 정렬 드롭다운 */}
                {isSortDropdownOpen && (
                  <div className="absolute right-0 top-6 z-10 bg-white rounded-lg shadow-[0_-3px_10px_0_rgba(163,163,163,0.15)] overflow-hidden min-w-[80px]">
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
            <div className="flex flex-col gap-3">
              {reviews.map((review) => (
                <ReviewItem
                  key={review.id}
                  review={review}
                  onLikeToggle={handleLikeToggle}
                  onEdit={handleEditReview}
                  onDelete={handleDeleteReview}
                  onReport={handleReportReview}
                  onReportUser={handleReportUser}
                  onBlock={handleBlockUser}
                  onImageClick={(images, index) => setSelectedImageUrl(images[index])}
                  isAdmin={isAdmin}
                  isLoggedIn={isLoggedIn}
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

      {/* 이미지 뷰어 모달 */}
      <ImageViewerModal
        imageUrl={selectedImageUrl}
        onClose={() => setSelectedImageUrl(null)}
        alt="리뷰 이미지"
      />

      {/* 신고 바텀시트 */}
      <ReportBottomSheet
        isOpen={!!reportTarget}
        isLoading={createReportMutation.isPending}
        targetType={reportTarget?.type ?? "REVIEW"}
        onClose={() => setReportTarget(null)}
        onSubmit={handleSubmitReport}
      />

      {/* 신고 정상처리 다이얼로그 */}
      <ReportSuccessModal
        isOpen={isReportSuccessOpen}
        onClose={() => setIsReportSuccessOpen(false)}
      />

      {/* 사용자 차단 확인 다이얼로그 */}
      <BlockUserConfirmModal
        isOpen={!!blockTarget}
        isLoading={blockUserMutation.isPending}
        nickname={blockTarget?.nickname ?? ""}
        onClose={() => setBlockTarget(null)}
        onConfirm={handleConfirmBlock}
      />
    </div>
  );
}
