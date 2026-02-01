"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Heart,
  Share,
  Copy,
  ChevronRight,
  ChevronDown,
  PencilLine,
  Images,
  ThumbsUp,
  MoreVertical,
  Pencil,
  Trash2,
} from "lucide-react";
import { useDeleteReview } from "@/api/mutations/useDeleteReview";
import { useToggleReviewLike } from "@/api/mutations/useToggleReviewLike";
import { useShopDetail } from "@/api/queries/useShopDetail";
import { BackHeader, Button, OutlineButton, ImageViewerModal } from "@/components/common";
import { ReviewDeleteConfirmModal } from "@/components/features/review/ReviewDeleteConfirmModal";
import { ReviewWriteModal } from "@/components/features/review/ReviewWriteModal";
// BottomSheet 미사용 - 직접 드래그 처리
import { useFavorite, useToast } from "@/hooks";
import type { OpenTime, ReviewResponse, ReviewSortOption } from "@/types/api";
import { formatDate } from "@/utils";
import StatusBadge from "./StatusBadge";

interface ShopPreviewBottomSheetProps {
  shopId: number | null;
  onClose: () => void;
}

// 요일 매핑
const DAY_MAP: Record<keyof OpenTime, string> = {
  Mon: "월",
  Tue: "화",
  Wed: "수",
  Thu: "목",
  Fri: "금",
  Sat: "토",
  Sun: "일",
};
const ALL_DAYS: (keyof OpenTime)[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function parseOpenTime(openTimeStr: string): OpenTime | null {
  try {
    return JSON.parse(openTimeStr) as OpenTime;
  } catch {
    return null;
  }
}

function getBusinessDays(openTime: OpenTime | null): (keyof OpenTime)[] {
  if (!openTime) return [];
  return ALL_DAYS.filter(
    (day) => openTime[day] !== null && openTime[day] !== "" && openTime[day] !== "휴무"
  );
}

function DayBadge({ day, isActive }: { day: string; isActive: boolean }) {
  return (
    <div
      className={`flex items-center justify-center w-[22px] h-[22px] rounded-full text-[12px] font-normal tracking-[-0.12px] leading-[150%] ${
        isActive ? "bg-grey-500 text-white" : "bg-grey-100 text-grey-400"
      }`}
    >
      {day}
    </div>
  );
}

function ReviewItem({
  review,
  onLikeToggle,
  onEdit,
  onDelete,
  onImageClick,
}: {
  review: ReviewResponse;
  onLikeToggle: (reviewId: number) => void;
  onEdit: (reviewId: number) => void;
  onDelete: (reviewId: number) => void;
  onImageClick?: (images: string[], index: number) => void;
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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
              {isMenuOpen && (
                <div className="absolute right-[calc(50%_+_2px)] top-[20px] z-10 bg-white rounded-lg rounded-tr-none shadow-[0px_0px_10px_0px_rgba(0,0,0,0.2)] overflow-hidden">
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
        <p className="text-[15px] text-grey-900 leading-[1.5] tracking-[-0.15px]">
          {review.content}
        </p>
        {review.imageUrls && review.imageUrls.length > 0 && (
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {review.imageUrls.map((imageUrl, index) => (
              <button
                key={index}
                onClick={() => onImageClick?.(review.imageUrls, index)}
                className="shrink-0 w-[105px] h-[105px] rounded-lg overflow-hidden bg-grey-100"
              >
                <Image
                  src={imageUrl}
                  alt={`리뷰 이미지 ${index + 1}`}
                  width={105}
                  height={105}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>
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

export default function ShopPreviewBottomSheet({ shopId, onClose }: ShopPreviewBottomSheetProps) {
  const router = useRouter();
  const { showToast } = useToast();

  const [sortBy, setSortBy] = useState<ReviewSortOption>("LATEST");
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const sortDropdownRef = useRef<HTMLDivElement>(null);

  const { data: shop, isLoading: isShopLoading, refetch } = useShopDetail(shopId ?? 0, sortBy);

  const {
    isFavorite,
    isLoading: isFavoriteLoading,
    toggleFavorite,
  } = useFavorite({
    shopId: shopId ?? 0,
    initialIsFavorite: shop?.isFavorite ?? false,
    onUnauthorized: () => {
      showToast("찜하기는 로그인 후 이용 가능해요.");
    },
  });

  const [galleryState, setGalleryState] = useState<{
    images: string[];
    initialIndex: number;
  } | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<ReviewResponse | null>(null);
  const [deletingReviewId, setDeletingReviewId] = useState<number | null>(null);

  const deleteReviewMutation = useDeleteReview(shopId ?? 0, deletingReviewId ?? 0);
  const toggleReviewLikeMutation = useToggleReviewLike();

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

  // 드래그 상태
  const DEFAULT_HEIGHT = 348;
  const [sheetHeight, setSheetHeight] = useState(DEFAULT_HEIGHT);
  const [isDragging, setIsDragging] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCollapsing, setIsCollapsing] = useState(false);
  const [hasExpandedOnce, setHasExpandedOnce] = useState(false);
  const dragStartY = useRef(0);
  const dragStartHeight = useRef(DEFAULT_HEIGHT);
  const lastDragY = useRef(0);

  // shopId 변경 시 미리보기 상태로 리셋
  useEffect(() => {
    setIsExpanded(false);
    setIsCollapsing(false);
    setSheetHeight(348);
    setHasExpandedOnce(false);
  }, [shopId]);

  // 확장 → 미리보기 축소 (숨겼다가 미리보기로 다시 올라옴)
  const collapseToPreview = useCallback(() => {
    setIsCollapsing(true);
    setSheetHeight(0);
    setTimeout(() => {
      setIsExpanded(false);
      setIsCollapsing(false);
      setHasExpandedOnce(false); // animate-slide-up 다시 적용
      setSheetHeight(DEFAULT_HEIGHT);
    }, 550);
  }, []);

  const handleDragStart = useCallback(
    (clientY: number) => {
      setIsDragging(true);
      dragStartY.current = clientY;
      dragStartHeight.current = sheetHeight;
    },
    [sheetHeight]
  );

  const handleDragMove = useCallback(
    (clientY: number) => {
      if (!isDragging) return;
      lastDragY.current = clientY;
      if (!isExpanded) {
        const delta = dragStartY.current - clientY;
        const newHeight = Math.max(0, dragStartHeight.current + delta);
        setSheetHeight(newHeight);
      }
    },
    [isDragging, isExpanded]
  );

  const handleDragEnd = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);

    if (isExpanded) {
      // 풀스크린에서 아래로 드래그 → 미리보기로 축소
      const draggedDown = lastDragY.current - dragStartY.current;
      if (draggedDown > 50) {
        collapseToPreview();
      }
    } else {
      const delta = dragStartHeight.current - sheetHeight;
      const threshold = 50;

      if (delta > threshold) {
        setSheetHeight(0);
        setTimeout(() => onClose(), 550);
      } else if (delta < -threshold) {
        {
          setHasExpandedOnce(true);
          setIsExpanded(true);
        }
      } else {
        setSheetHeight(DEFAULT_HEIGHT);
      }
    }
  }, [isDragging, isExpanded, sheetHeight, onClose, collapseToPreview]);

  useEffect(() => {
    if (!isDragging) return;
    const onMouseMove = (e: MouseEvent) => handleDragMove(e.clientY);
    const onMouseUp = () => handleDragEnd();
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [isDragging, handleDragMove, handleDragEnd]);

  if (!shopId) return null;

  if (isShopLoading || !shop) {
    return (
      <div className="absolute bottom-0 left-0 right-0 z-20 bg-white rounded-t-[24px] shadow-[0_0_10px_rgba(0,0,0,0.2)] animate-slide-up">
        <div className="flex items-center justify-center py-[10px]">
          <div className="w-[60px] h-[4px] bg-[#cfcfcf] rounded-[2px]" />
        </div>
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-grey-200 border-t-main" />
        </div>
      </div>
    );
  }

  const openTime = parseOpenTime(shop.openTime);
  const businessDays = getBusinessDays(openTime);

  const shopImages = [
    ...(shop.mainImageUrl ? [shop.mainImageUrl] : []),
    ...shop.recentReviewImages,
  ];
  const totalImageCount = shop.totalReviewImageCount + (shop.mainImageUrl ? 1 : 0);
  const remainingCount = totalImageCount > 5 ? totalImageCount - 4 : 0;

  const handleViewAllImages = () => router.push(`/shop/${shop.id}/images`);
  const handleViewAllReviews = () => router.push(`/shop/${shop.id}/reviews`);

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(shop.addressName);
      showToast("주소를 복사했어요!");
    } catch {
      showToast("주소 복사에 실패했어요.");
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/shop/${shop.id}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: shop.name, url });
      } catch {
        /* 취소 */
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        showToast("링크가 복사되었어요.");
      } catch {
        showToast("링크 복사에 실패했어요.");
      }
    }
  };

  const handleLikeToggle = (reviewId: number) => {
    const review = shop.reviews.find((r) => r.id === reviewId);
    if (!review) return;
    toggleReviewLikeMutation.mutate(
      { reviewId, isLiked: review.isLiked },
      {
        onSuccess: () => refetch(),
        onError: (error) => showToast(error.message || "좋아요 처리에 실패했어요."),
      }
    );
  };

  const handleEditReview = (reviewId: number) => {
    const reviewToEdit = shop.reviews.find((r) => r.id === reviewId);
    if (reviewToEdit) setEditingReview(reviewToEdit);
  };

  const handleDeleteReview = (reviewId: number) => setDeletingReviewId(reviewId);

  const handleConfirmDelete = () => {
    if (!deletingReviewId) return;
    deleteReviewMutation.mutate(undefined, {
      onSuccess: () => {
        showToast("리뷰가 삭제되었어요.");
        setDeletingReviewId(null);
        refetch();
      },
      onError: (error) => showToast(error.message || "리뷰 삭제에 실패했어요."),
    });
  };

  const handleSortChange = (newSortBy: ReviewSortOption) => {
    setSortBy(newSortBy);
    setIsSortDropdownOpen(false);
  };

  return (
    <>
      {/* 바텀시트 */}
      <div
        className={`absolute bottom-0 left-0 right-0 z-40 bg-white overflow-hidden shadow-[0_-4px_10px_rgba(0,0,0,0.2)] ${isExpanded && !isCollapsing ? "" : "rounded-t-[24px]"} ${!hasExpandedOnce ? "animate-slide-up" : ""}`}
        style={{
          height: isCollapsing ? `${sheetHeight}px` : isExpanded ? "100%" : `${sheetHeight}px`,
          transition: isDragging ? "none" : "height 0.55s cubic-bezier(0.32, 0.72, 0, 1)",
        }}
      >
        {/* Grabber (미리보기에서만 표시) */}
        {!isExpanded && !isCollapsing && (
          <div
            className="flex items-center justify-center h-[34px] cursor-grab active:cursor-grabbing"
            onTouchStart={(e) => handleDragStart(e.touches[0].clientY)}
            onTouchMove={(e) => handleDragMove(e.touches[0].clientY)}
            onTouchEnd={handleDragEnd}
            onMouseDown={(e) => handleDragStart(e.clientY)}
          >
            <div className="w-[80px] h-[4px] bg-[#cfcfcf] rounded-[2px]" />
          </div>
        )}

        {/* 확장 시 헤더 (위에서 아래로 슬라이드) */}
        {(isExpanded || isCollapsing) && (
          <div
            className="flex items-center justify-between pr-5 animate-slide-down-header cursor-grab active:cursor-grabbing"
            onTouchStart={(e) => handleDragStart(e.touches[0].clientY)}
            onTouchMove={(e) => handleDragMove(e.touches[0].clientY)}
            onTouchEnd={handleDragEnd}
            onMouseDown={(e) => handleDragStart(e.clientY)}
          >
            <BackHeader onBack={collapseToPreview} />
            <div className="flex items-center gap-1 ml-3">
              <button
                onClick={toggleFavorite}
                disabled={isFavoriteLoading}
                className="flex items-center justify-center w-10 h-10 rounded-full disabled:opacity-50"
                aria-label={isFavorite ? "찜 취소" : "찜하기"}
              >
                <Heart
                  size={24}
                  className={isFavorite ? "fill-main stroke-main" : "stroke-icon-default fill-none"}
                  strokeWidth={1.5}
                />
              </button>
              <button
                onClick={handleShare}
                className="flex items-center justify-center w-10 h-10 rounded-full"
                aria-label="공유하기"
              >
                <Share size={24} className="stroke-icon-default" strokeWidth={1.5} />
              </button>
            </div>
          </div>
        )}

        <div
          className={`${isExpanded ? "overflow-y-auto h-full" : "overflow-hidden h-[calc(100%-34px)]"}`}
        >
          <div className="flex flex-col px-5">
            {/* 업체명 + 찜/공유 (확장 시 찜/공유는 헤더에만 표시) */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => {
                  setHasExpandedOnce(true);
                  setIsExpanded(true);
                }}
                className="flex-1 min-w-0 text-left"
              >
                <h2 className="text-[22px] font-semibold text-grey-900 leading-[150%] tracking-[-0.22px] font-pretendard overflow-hidden text-ellipsis whitespace-nowrap">
                  {shop.name}
                </h2>
              </button>
              {!isExpanded && (
                <div className="flex items-center gap-3 shrink-0 ml-3">
                  <button
                    onClick={toggleFavorite}
                    disabled={isFavoriteLoading}
                    className="w-6 h-6 flex items-center justify-center disabled:opacity-50"
                    aria-label={isFavorite ? "찜 취소" : "찜하기"}
                  >
                    <Heart
                      size={20}
                      className={isFavorite ? "fill-main stroke-main" : "stroke-grey-700 fill-none"}
                      strokeWidth={1.5}
                    />
                  </button>
                  <button
                    onClick={handleShare}
                    className="w-6 h-6 flex items-center justify-center"
                    aria-label="공유하기"
                  >
                    <Share size={20} className="stroke-grey-700" strokeWidth={1.5} />
                  </button>
                </div>
              )}
            </div>

            {isExpanded ? (
              /* 확장: 상세페이지와 동일한 레이아웃 */
              <>
                <div className="flex flex-col gap-2 py-2">
                  <div className="flex items-center gap-2">
                    <span className="shrink-0 w-16 text-[14px] text-grey-400">주소</span>
                    <p className="text-[14px] text-grey-900 leading-[1.5] tracking-[-0.14px]">
                      {shop.addressName}
                    </p>
                    <button
                      onClick={handleCopyAddress}
                      className="shrink-0 flex items-center gap-1 py-1 rounded text-[12px] text-grey-600"
                    >
                      <Copy size={12} strokeWidth={1.5} />
                    </button>
                  </div>
                  {shop.locationHint && (
                    <div className="flex items-center gap-2">
                      <span className="shrink-0 w-16 text-[14px] text-grey-400">위치 힌트</span>
                      <p className="text-[14px] text-grey-900 leading-[1.5] tracking-[-0.14px]">
                        {shop.locationHint}
                      </p>
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-3 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="shrink-0 w-16 text-[14px] text-grey-400">영업일</span>
                    <div className="flex gap-1.5">
                      {ALL_DAYS.map((day) => (
                        <DayBadge
                          key={day}
                          day={DAY_MAP[day]}
                          isActive={businessDays.includes(day)}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="shrink-0 w-16 text-[14px] text-grey-400">영업시간</span>
                    {shop.todayOpenTime && (
                      <span className="text-[14px] text-grey-900">{shop.todayOpenTime}</span>
                    )}
                    <StatusBadge openStatus={shop.openStatus} />
                  </div>
                </div>
              </>
            ) : (
              /* 미리보기: 간격 좁게 한 블록 */
              <div className="flex flex-col gap-1 mt-1">
                <div className="flex items-center gap-2">
                  <span className="shrink-0 w-16 text-[14px] text-grey-400">주소</span>
                  <p className="text-[14px] text-grey-900 leading-[1.5] tracking-[-0.14px]">
                    {shop.addressName}
                  </p>
                  <button
                    onClick={handleCopyAddress}
                    className="shrink-0 flex items-center gap-1 py-1 rounded text-[12px] text-grey-600"
                  >
                    <Copy size={12} strokeWidth={1.5} />
                  </button>
                </div>
                {shop.locationHint && (
                  <div className="flex items-center gap-2">
                    <span className="shrink-0 w-16 text-[14px] text-grey-400">위치 힌트</span>
                    <p className="text-[14px] text-grey-900 leading-[1.5] tracking-[-0.14px]">
                      {shop.locationHint}
                    </p>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="shrink-0 w-16 text-[14px] text-grey-400">영업일</span>
                  <div className="flex gap-1.5">
                    {ALL_DAYS.map((day) => (
                      <DayBadge
                        key={day}
                        day={DAY_MAP[day]}
                        isActive={businessDays.includes(day)}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="shrink-0 w-16 text-[14px] text-grey-400">영업시간</span>
                  {shop.todayOpenTime && (
                    <span className="text-[14px] text-grey-900">{shop.todayOpenTime}</span>
                  )}
                  <StatusBadge openStatus={shop.openStatus} />
                </div>
              </div>
            )}

            {/* 대표 이미지 (미리보기) */}
            {!isExpanded && shopImages.length > 0 && (
              <div className="mt-2">
                <button
                  onClick={() => setGalleryState({ images: shopImages, initialIndex: 0 })}
                  className="w-full h-[173px] rounded-lg overflow-hidden bg-grey-100"
                >
                  <Image
                    src={shopImages[0]}
                    alt={shop.name}
                    width={335}
                    height={167}
                    className="w-full h-full object-cover"
                  />
                </button>
              </div>
            )}

            {/* 구분선 + 업체 사진 (확장 시에만 표시) */}
            {isExpanded && (
              <>
                <div className="h-2 -mx-5 bg-grey-50" />

                <div className="py-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <h3 className="text-[20px] font-semibold text-grey-900 leading-[1.4] tracking-[-0.2px]">
                        업체 사진
                      </h3>
                      {totalImageCount > 0 && (
                        <span className="text-[14px] text-main font-medium">{totalImageCount}</span>
                      )}
                    </div>
                    {shopImages.length > 0 && (
                      <button
                        onClick={handleViewAllImages}
                        className="flex items-center text-[14px] text-grey-500"
                      >
                        전체보기
                        <ChevronRight size={16} />
                      </button>
                    )}
                  </div>

                  {shopImages.length === 0 ? (
                    <div className="flex items-center justify-center h-32 rounded-xl bg-grey-50">
                      <p className="text-[14px] text-grey-400">등록된 사진이 없어요</p>
                    </div>
                  ) : shopImages.length === 1 ? (
                    <button
                      onClick={() => setGalleryState({ images: shopImages, initialIndex: 0 })}
                      className="w-full aspect-[335/167] rounded-lg overflow-hidden bg-grey-100"
                    >
                      <Image
                        src={shopImages[0]}
                        alt="업체 사진"
                        width={335}
                        height={167}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ) : (
                    /* 확장: 그리드 레이아웃 */
                    <div className="flex gap-px">
                      <button
                        onClick={() => setGalleryState({ images: shopImages, initialIndex: 0 })}
                        className="flex-1 aspect-square rounded-l-lg overflow-hidden bg-grey-100"
                      >
                        <Image
                          src={shopImages[0]}
                          alt="업체 사진 1"
                          width={167}
                          height={167}
                          className="w-full h-full object-cover"
                        />
                      </button>
                      <div className="flex-1 flex flex-wrap gap-px content-end">
                        {shopImages[1] && (
                          <button
                            onClick={() => setGalleryState({ images: shopImages, initialIndex: 1 })}
                            className="w-[calc(50%-0.5px)] aspect-square overflow-hidden bg-grey-100"
                          >
                            <Image
                              src={shopImages[1]}
                              alt="업체 사진 2"
                              width={83}
                              height={83}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        )}
                        {shopImages[2] && (
                          <button
                            onClick={() => setGalleryState({ images: shopImages, initialIndex: 2 })}
                            className="w-[calc(50%-0.5px)] aspect-square rounded-tr-lg overflow-hidden bg-grey-100"
                          >
                            <Image
                              src={shopImages[2]}
                              alt="업체 사진 3"
                              width={83}
                              height={83}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        )}
                        {shopImages[3] && (
                          <button
                            onClick={() => setGalleryState({ images: shopImages, initialIndex: 3 })}
                            className="w-[calc(50%-0.5px)] aspect-square overflow-hidden bg-grey-100"
                          >
                            <Image
                              src={shopImages[3]}
                              alt="업체 사진 4"
                              width={83}
                              height={83}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        )}
                        {shopImages[4] ? (
                          <button
                            onClick={handleViewAllImages}
                            className="relative w-[calc(50%-0.5px)] aspect-square rounded-br-lg overflow-hidden bg-grey-100"
                          >
                            <Image
                              src={shopImages[4]}
                              alt="업체 사진 5"
                              width={83}
                              height={83}
                              className="w-full h-full object-cover"
                            />
                            {remainingCount > 0 && (
                              <div className="absolute inset-0 bg-black/55 flex flex-col items-center justify-center rounded-br-lg">
                                <Images size={24} className="text-white" strokeWidth={1.5} />
                                <div className="flex items-center justify-center">
                                  <span className="text-[12px] text-white leading-[1.5] tracking-[-0.12px]">
                                    {remainingCount}
                                  </span>
                                  <ChevronRight size={10} className="text-white" />
                                </div>
                              </div>
                            )}
                          </button>
                        ) : (
                          <div className="w-[calc(50%-0.5px)] aspect-square rounded-br-lg bg-grey-100" />
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* 구분선 */}
                <div className="h-2 -mx-5 bg-grey-50" />
              </>
            )}

            {/* 방문 리뷰 (확장 시에만 표시) */}
            {isExpanded && (
              <>
                <div className="py-4">
                  <h3 className="text-[20px] font-semibold text-grey-900 leading-[1.4] tracking-[-0.2px] mb-4">
                    방문리뷰
                  </h3>

                  <Button
                    variant="primary"
                    size="medium"
                    fullWidth
                    onClick={() => setIsReviewModalOpen(true)}
                    className="!bg-grey-700 hover:!bg-grey-800 active:!bg-grey-900 gap-1.5 mb-4"
                  >
                    <PencilLine size={16} strokeWidth={2} />
                    <span className="text-[16px] font-medium text-white leading-[1.5] tracking-[-0.16px]">
                      {shop.reviewCount === 0 ? "첫 리뷰를 작성해주세요" : "리뷰를 작성해주세요"}
                    </span>
                  </Button>

                  {shop.reviewCount > 0 && (
                    <>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center text-[14px] text-grey-900 tracking-[-0.14px]">
                          <span>총&nbsp;</span>
                          <span>{shop.reviewCount}</span>
                          <span>개</span>
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
                          {isSortDropdownOpen && (
                            <div className="absolute right-0 top-6 z-10 bg-white rounded-lg shadow-[0px_0px_10px_0px_rgba(0,0,0,0.2)] overflow-hidden min-w-[80px]">
                              <button
                                onClick={() => handleSortChange("LATEST")}
                                className={`flex items-center px-3 py-2 w-full text-[14px] ${sortBy === "LATEST" ? "text-main font-medium" : "text-grey-700"} hover:bg-grey-50`}
                              >
                                최신순
                              </button>
                              <div className="border-t border-grey-100" />
                              <button
                                onClick={() => handleSortChange("LIKE_COUNT")}
                                className={`flex items-center px-3 py-2 w-full text-[14px] ${sortBy === "LIKE_COUNT" ? "text-main font-medium" : "text-grey-700"} hover:bg-grey-50`}
                              >
                                좋아요순
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        {shop.reviews.slice(0, 3).map((review) => (
                          <ReviewItem
                            key={review.id}
                            review={review}
                            onLikeToggle={handleLikeToggle}
                            onEdit={handleEditReview}
                            onDelete={handleDeleteReview}
                            onImageClick={(images, index) =>
                              setGalleryState({ images, initialIndex: index })
                            }
                          />
                        ))}
                      </div>

                      <OutlineButton
                        onClick={handleViewAllReviews}
                        fullWidth
                        rightIcon={
                          <ChevronRight size={24} className="text-grey-700" strokeWidth={1.5} />
                        }
                        className="mt-4"
                      >
                        리뷰 전체보기
                      </OutlineButton>
                    </>
                  )}

                  {shop.reviewCount === 0 && (
                    <div className="py-8 flex flex-col items-center justify-center">
                      <p className="text-[14px] text-grey-400">아직 작성된 리뷰가 없어요.</p>
                    </div>
                  )}
                </div>

                <div className="h-8" />
              </>
            )}
          </div>
        </div>
      </div>

      {/* 이미지 뷰어 모달 */}
      {galleryState && (
        <ImageViewerModal
          images={galleryState.images}
          initialIndex={galleryState.initialIndex}
          onClose={() => setGalleryState(null)}
          alt="이미지"
        />
      )}

      {/* 리뷰 작성 모달 */}
      <ReviewWriteModal
        shopId={shopId}
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        onSuccess={() => refetch()}
      />

      {/* 리뷰 수정 모달 */}
      {editingReview && (
        <ReviewWriteModal
          shopId={shopId}
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
    </>
  );
}
