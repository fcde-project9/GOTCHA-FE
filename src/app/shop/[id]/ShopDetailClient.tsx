"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import {
  Heart,
  Share,
  Copy,
  ChevronRight,
  ChevronDown,
  PencilLine,
  MoreVertical,
  Pencil,
  Trash2,
  Images,
  SquarePen,
  Siren,
  X,
} from "lucide-react";
import { useBlockUser } from "@/api/mutations/useBlockUser";
import { useCreateReport } from "@/api/mutations/useCreateReport";
import { useCreateSuggest } from "@/api/mutations/useCreateSuggest";
import { useDeleteReview } from "@/api/mutations/useDeleteReview";
import { useDeleteShop } from "@/api/mutations/useDeleteShop";
import { useToggleReviewLike } from "@/api/mutations/useToggleReviewLike";
import { useUpdateShop } from "@/api/mutations/useUpdateShop";
import { useInfiniteReviews } from "@/api/queries/useInfiniteReviews";
import { useShopDetail } from "@/api/queries/useShopDetail";
import { useUser } from "@/api/queries/useUser";
import type { ReportReason, ReportTargetType, ShopSuggestReason } from "@/api/types";
import {
  Button,
  BackHeader,
  OutlineButton,
  ImageViewerModal,
  ImagesGalleryOverlay,
} from "@/components/common";
import { BlockUserConfirmModal } from "@/components/features/review/BlockUserConfirmModal";
import { ReportBottomSheet } from "@/components/features/review/ReportReviewBottomSheet";
import { ReportSuccessModal } from "@/components/features/review/ReportSuccessModal";
import { ReviewDeleteConfirmModal } from "@/components/features/review/ReviewDeleteConfirmModal";
import { ReviewItem } from "@/components/features/review/ReviewItem";
import { ReviewWriteModal } from "@/components/features/review/ReviewWriteModal";
import { StatusBadge } from "@/components/features/shop";
import { ShopDeleteConfirmModal } from "@/components/features/shop/ShopDeleteConfirmModal";
import { ShopEditModal } from "@/components/features/shop/ShopEditModal";
import { ShopSuggestModal } from "@/components/features/shop/ShopSuggestModal";
import { useAuth, useFavorite, useToast } from "@/hooks";
import type { ReviewResponse, OpenTime, ReviewSortOption } from "@/types/api";
import { trackShopView, trackShareClick } from "@/utils/analytics";

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
        isActive ? "bg-grey-800 text-white" : "bg-grey-100 text-grey-400"
      }`}
    >
      {day}
    </div>
  );
}

function parseShopId(id: string | string[] | undefined): number | null {
  if (typeof id !== "string") return null;
  const parsed = Number(id);
  if (Number.isNaN(parsed) || !Number.isInteger(parsed) || parsed <= 0) return null;
  return parsed;
}

interface ShopDetailClientProps {
  shopId?: number;
  onClose?: () => void;
}

export default function ShopDetailClient({
  shopId: shopIdProp,
  onClose,
}: ShopDetailClientProps = {}) {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const shopId = shopIdProp ?? parseShopId(params.id);
  const isValidShopId = shopId !== null;
  const validShopId = shopId ?? 0;

  const [sortBy, setSortBy] = useState<ReviewSortOption>("LATEST");
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const sortDropdownRef = useRef<HTMLDivElement>(null);

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

  const { data: shop, isLoading, error, refetch } = useShopDetail(validShopId, sortBy);

  useEffect(() => {
    if (shop) trackShopView(shop.id, shop.name);
  }, [shop?.id, shop?.name]);

  const {
    isFavorite,
    isLoading: isFavoriteLoading,
    toggleFavorite,
  } = useFavorite({
    shopId: validShopId,
    initialIsFavorite: shop?.isFavorite ?? false,
    onUnauthorized: () => showToast("찜하기는 로그인 후 이용 가능해요.", { variant: "warning" }),
  });

  const openTime = shop ? parseOpenTime(shop.openTime) : null;
  const businessDays = getBusinessDays(openTime);

  const [galleryState, setGalleryState] = useState<{
    images: string[];
    initialIndex: number;
  } | null>(null);
  const [allImagesOpen, setAllImagesOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<ReviewResponse | null>(null);
  const [deletingReviewId, setDeletingReviewId] = useState<number | null>(null);
  const [reportTarget, setReportTarget] = useState<{ type: ReportTargetType; id: number } | null>(
    null
  );
  const [isReportSuccessOpen, setIsReportSuccessOpen] = useState(false);
  const [blockTarget, setBlockTarget] = useState<{ userId: number; nickname: string } | null>(null);

  const deleteReviewMutation = useDeleteReview(validShopId, deletingReviewId ?? 0);
  const toggleReviewLikeMutation = useToggleReviewLike();
  const createReportMutation = useCreateReport();
  const createSuggestMutation = useCreateSuggest();
  const blockUserMutation = useBlockUser();
  const deleteShopMutation = useDeleteShop();
  const updateShopMutation = useUpdateShop();

  const { isAdmin } = useUser();
  const { isLoggedIn } = useAuth();

  const [isShopDeleteModalOpen, setIsShopDeleteModalOpen] = useState(false);
  const [isShopEditModalOpen, setIsShopEditModalOpen] = useState(false);
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false);
  const adminMenuRef = useRef<HTMLDivElement>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSuggestModalOpen, setIsSuggestModalOpen] = useState(false);

  const [showAllReviews, setShowAllReviews] = useState(false);
  const [isAllReviewsClosing, setIsAllReviewsClosing] = useState(false);
  const [allReviewsSortBy, setAllReviewsSortBy] = useState<ReviewSortOption>("LATEST");
  const [isAllReviewsSortOpen, setIsAllReviewsSortOpen] = useState(false);
  const allReviewsSortRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (adminMenuRef.current && !adminMenuRef.current.contains(event.target as Node)) {
        setIsAdminMenuOpen(false);
      }
    };
    if (isAdminMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isAdminMenuOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (allReviewsSortRef.current && !allReviewsSortRef.current.contains(event.target as Node)) {
        setIsAllReviewsSortOpen(false);
      }
    };
    if (isAllReviewsSortOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isAllReviewsSortOpen]);

  const {
    data: allReviewsData,
    isLoading: isAllReviewsLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch: refetchAllReviews,
  } = useInfiniteReviews(validShopId, allReviewsSortBy);

  const allReviews = useMemo(
    () => allReviewsData?.pages.flatMap((page) => page.content) ?? [],
    [allReviewsData]
  );
  const allReviewsTotalCount = allReviewsData?.pages[0]?.totalCount ?? 0;

  useEffect(() => {
    if (!showAllReviews || isAllReviewsLoading || isFetchingNextPage || !hasNextPage) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) fetchNextPage();
      },
      { threshold: 0.1 }
    );
    if (loadMoreRef.current) observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [showAllReviews, isAllReviewsLoading, isFetchingNextPage, hasNextPage, fetchNextPage]);

  const handleCopyAddress = async () => {
    if (!shop) return;
    try {
      await navigator.clipboard.writeText(shop.addressName);
      showToast("주소를 복사했어요!");
    } catch {
      showToast("주소 복사에 실패했어요.", { variant: "warning" });
    }
  };

  const handleShare = async () => {
    if (!shop) return;
    trackShareClick(shop.id);
    const url = `${process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin}/shop/${shop.id}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: shop.name,
          text: `${shop.name} - ${shop.addressName}`,
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        showToast("링크가 복사되었어요.");
      }
    } catch {
      // 공유 취소 시 무시
    }
  };

  const handleViewAllReviews = () => setShowAllReviews(true);

  const handleCloseAllReviews = () => {
    setIsAllReviewsClosing(true);
    setTimeout(() => {
      setShowAllReviews(false);
      setIsAllReviewsClosing(false);
    }, 450);
  };

  const handleLikeToggle = (reviewId: number) => {
    const review = shop?.reviews.find((r) => r.id === reviewId);
    if (!review) return;
    toggleReviewLikeMutation.mutate(
      { reviewId, isLiked: review.isLiked, shopId: validShopId },
      {
        onError: (error) =>
          showToast(error.message || "좋아요 처리에 실패했어요.", { variant: "warning" }),
      }
    );
  };

  const handleAllReviewsLikeToggle = (reviewId: number) => {
    const review = allReviews.find((r) => r.id === reviewId);
    if (!review) return;
    toggleReviewLikeMutation.mutate(
      { reviewId, isLiked: review.isLiked, shopId: validShopId },
      {
        onError: (error) =>
          showToast(error.message || "좋아요 처리에 실패했어요.", { variant: "warning" }),
      }
    );
  };

  const handleEditReview = (reviewId: number) => {
    const reviewToEdit = shop?.reviews.find((r) => r.id === reviewId);
    if (reviewToEdit) setEditingReview(reviewToEdit);
  };

  const handleAllReviewsEdit = (reviewId: number) => {
    const reviewToEdit = allReviews.find((r) => r.id === reviewId);
    if (reviewToEdit) setEditingReview(reviewToEdit);
  };

  const handleDeleteReview = (reviewId: number) => setDeletingReviewId(reviewId);
  const handleAllReviewsDelete = (reviewId: number) => setDeletingReviewId(reviewId);

  const handleConfirmDelete = () => {
    if (!deletingReviewId) return;
    deleteReviewMutation.mutate(undefined, {
      onSuccess: () => {
        showToast("리뷰가 삭제되었어요.");
        setDeletingReviewId(null);
        refetch();
        if (showAllReviews) refetchAllReviews();
      },
      onError: (error) =>
        showToast(error.message || "리뷰 삭제에 실패했어요.", { variant: "warning" }),
    });
  };

  const handleReportReview = (reviewId: number) =>
    setReportTarget({ type: "REVIEW", id: reviewId });
  const handleReportUser = (userId: number) => setReportTarget({ type: "USER", id: userId });
  const handleReportShop = () => setReportTarget({ type: "SHOP", id: validShopId });

  const handleSubmitReport = (reason: ReportReason, detail?: string) => {
    if (!reportTarget) return;
    createReportMutation.mutate(
      { targetType: reportTarget.type, targetId: reportTarget.id, reason, detail },
      {
        onSuccess: () => {
          setReportTarget(null);
          setIsReportSuccessOpen(true);
        },
        onError: (error) =>
          showToast(error.message || "신고 접수에 실패했어요.", { variant: "warning" }),
      }
    );
  };

  const handleBlockUser = (userId: number, nickname: string) =>
    setBlockTarget({ userId, nickname });

  const handleConfirmBlock = () => {
    if (!blockTarget) return;
    blockUserMutation.mutate(blockTarget.userId, {
      onSuccess: async () => {
        try {
          await refetch();
          if (showAllReviews) await refetchAllReviews();
        } finally {
          setBlockTarget(null);
          showToast("사용자 차단이 완료되었어요!");
        }
      },
      onError: (error) =>
        showToast(error.message || "사용자 차단에 실패했어요.", { variant: "warning" }),
    });
  };

  const handleSortChange = (newSortBy: ReviewSortOption) => {
    setSortBy(newSortBy);
    setIsSortDropdownOpen(false);
  };

  const handleAllReviewsSortChange = (newSortBy: ReviewSortOption) => {
    setAllReviewsSortBy(newSortBy);
    setIsAllReviewsSortOpen(false);
  };

  const handleBack = useCallback(() => {
    if (onClose) {
      onClose();
      return;
    }
    if (window.history.length > 1) router.back();
    else router.push("/home");
  }, [router, onClose]);

  const handleConfirmShopDelete = () => {
    deleteShopMutation.mutate(validShopId, {
      onSuccess: () => {
        showToast("가게가 삭제되었어요.");
        setIsShopDeleteModalOpen(false);
        if (onClose) onClose();
        else router.push("/home");
      },
      onError: (error) =>
        showToast(error.message || "가게 삭제에 실패했어요.", { variant: "warning" }),
    });
  };

  const handleShopEdit = (data: {
    name: string;
    addressName?: string;
    locationHint?: string;
    openTime?: Record<string, string | null>;
  }) => {
    updateShopMutation.mutate(
      { shopId: validShopId, data },
      {
        onSuccess: () => {
          showToast("가게 정보가 수정되었어요.");
          setIsShopEditModalOpen(false);
        },
        onError: (error) =>
          showToast(error.message || "가게 정보 수정에 실패했어요.", { variant: "warning" }),
      }
    );
  };

  const handleSubmitSuggest = (reasons: ShopSuggestReason[]) => {
    createSuggestMutation.mutate(
      { shopId: validShopId, data: { reasons } },
      {
        onSuccess: () => {
          setIsSuggestModalOpen(false);
          showToast("제안이 접수되었어요. 감사합니다!");
        },
        onError: (error) =>
          showToast(error.message || "제안 접수에 실패했어요.", { variant: "warning" }),
      }
    );
  };

  if (!isValidShopId) {
    return (
      <div className="h-dvh bg-default flex flex-col">
        <BackHeader onBack={handleBack} />
        <div className="flex-1 flex flex-col items-center justify-center px-5">
          <p className="text-[18px] font-semibold leading-[1.5] tracking-[-0.18px] text-grey-900">
            잘못된 접근이에요
          </p>
          <div className="mt-[22px]">
            <Button
              variant="primary"
              size="medium"
              className="px-6 text-[17px]"
              onClick={() => (onClose ? onClose() : router.push("/home"))}
            >
              홈으로 돌아가기
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="h-dvh flex items-center justify-center bg-default">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-grey-200 border-t-main" />
      </div>
    );
  }

  if (error || !shop) {
    return (
      <div className="h-dvh bg-default flex flex-col">
        <BackHeader onBack={handleBack} />
        <div className="flex-1 flex flex-col items-center justify-center px-5">
          <div className="flex flex-col items-center gap-2 text-center">
            <p className="text-[18px] font-semibold leading-[1.5] tracking-[-0.18px] text-grey-900">
              매장을 찾을 수 없어요
            </p>
            <p className="text-[16px] font-normal leading-[1.5] tracking-[-0.16px] text-grey-600">
              잠시 후 다시 시도해 주세요
            </p>
          </div>
          <div className="mt-[22px] flex gap-[9px]">
            <Button
              variant="tertiary"
              size="medium"
              className="px-6 text-[17px]"
              onClick={() => (onClose ? onClose() : router.back())}
            >
              이전 페이지
            </Button>
            <Button
              variant="primary"
              size="medium"
              className="px-6 text-[17px]"
              onClick={() => (onClose ? onClose() : router.push("/home"))}
            >
              홈으로
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const shopImages = [
    ...(shop.mainImageUrl ? [shop.mainImageUrl] : []),
    ...shop.recentReviewImages,
  ];
  const totalImageCount = shop.totalReviewImageCount + (shop.mainImageUrl ? 1 : 0);
  const remainingCount = totalImageCount > 5 ? totalImageCount - 4 : 0;

  const content = (
    <div className="h-dvh bg-default flex flex-col overflow-hidden">
      {/* 헤더 */}
      <div className="flex items-center justify-between pr-4">
        <BackHeader onBack={handleBack} />
        <div className="flex items-center ml-3">
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
          {isAdmin ? (
            <div className="relative" ref={adminMenuRef}>
              <button
                onClick={() => setIsAdminMenuOpen(!isAdminMenuOpen)}
                className="flex items-center justify-center w-8 h-10 rounded-full"
                aria-label="관리자 메뉴"
              >
                <MoreVertical size={24} className="stroke-icon-default" strokeWidth={1.5} />
              </button>
              {isAdminMenuOpen && (
                <div className="absolute right-0 top-10 z-10 bg-white rounded-lg shadow-[0px_0px_10px_0px_rgba(0,0,0,0.2)] overflow-hidden">
                  <button
                    onClick={() => {
                      setIsAdminMenuOpen(false);
                      setIsShopEditModalOpen(true);
                    }}
                    className="flex items-center gap-2 px-3 py-2 w-full hover:bg-grey-50"
                  >
                    <Pencil size={16} className="text-grey-900" />
                    <span className="text-[14px] text-grey-900 whitespace-nowrap">수정하기</span>
                  </button>
                  <div className="border-t border-grey-100" />
                  <button
                    onClick={() => {
                      setIsAdminMenuOpen(false);
                      setIsShopDeleteModalOpen(true);
                    }}
                    className="flex items-center gap-2 px-3 py-2 w-full hover:bg-grey-50"
                  >
                    <Trash2 size={16} className="text-error" />
                    <span className="text-[14px] text-error whitespace-nowrap">삭제하기</span>
                  </button>
                </div>
              )}
            </div>
          ) : isLoggedIn ? (
            <button
              onClick={() => setIsUserMenuOpen(true)}
              className="flex items-center justify-center w-8 h-10 rounded-full"
              aria-label="메뉴"
            >
              <MoreVertical size={24} className="stroke-icon-default" strokeWidth={1.5} />
            </button>
          ) : null}
        </div>
      </div>

      {/* 스크롤 컨텐츠 */}
      <div className="flex-1 overflow-y-auto pb-safe">
        {/* 업체명 */}
        <div className="px-5 pt-2 pb-0">
          <h2 className="text-[20px] font-semibold text-grey-900 leading-[150%] tracking-[-0.2px] overflow-hidden text-ellipsis whitespace-nowrap">
            {shop.name}
          </h2>
        </div>

        {/* 주소/위치힌트/영업일/영업시간 */}
        <div className="px-5">
          <div className="flex flex-col gap-3 py-2">
            <div className="flex items-center gap-2">
              <img src="/images/icons/shop-location.png" alt="" className="shrink-0 w-5 h-5" />
              <div className="flex items-center gap-0.5">
                <p className="text-[16px] text-grey-900 leading-[1.5] tracking-[-0.16px]">
                  {shop.addressName}
                </p>
                <button
                  onClick={handleCopyAddress}
                  className="shrink-0 flex items-center justify-center w-5 h-5 rounded text-[12px] text-grey-600"
                >
                  <Copy size={14} strokeWidth={1.5} />
                </button>
              </div>
            </div>
            {shop.locationHint && (
              <div className="flex items-center gap-2">
                <img src="/images/icons/shop-star.png" alt="" className="shrink-0 w-5 h-5" />
                <p className="text-[16px] text-grey-900 leading-[1.5] tracking-[-0.16px]">
                  {shop.locationHint}
                </p>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-3 pb-4 mt-1">
            <div className="flex items-center gap-2">
              <img src="/images/icons/shop-calendar.png" alt="" className="shrink-0 w-5 h-5" />
              <div className="flex gap-1.5">
                {ALL_DAYS.map((day) => (
                  <DayBadge key={day} day={DAY_MAP[day]} isActive={businessDays.includes(day)} />
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <img src="/images/icons/shop-time.png" alt="" className="shrink-0 w-5 h-5" />
              {shop.todayOpenTime && (
                <span className="text-[16px] text-grey-900">{shop.todayOpenTime}</span>
              )}
              <StatusBadge openStatus={shop.openStatus} />
            </div>
          </div>
        </div>

        {/* 구분선 */}
        <div className="h-2 bg-grey-50" />

        {/* 업체 사진 */}
        <section className="py-4">
          <div className="flex items-center justify-between px-5 mb-3">
            <div className="flex items-center gap-2">
              <h3 className="text-[19px] font-medium text-grey-900 leading-[1.5] tracking-[-0.19px]">
                업체 사진
              </h3>
              {totalImageCount > 0 && (
                <span className="text-[14px] text-main font-medium">{totalImageCount}</span>
              )}
            </div>
            {shopImages.length > 0 && (
              <button
                onClick={() => setAllImagesOpen(true)}
                className="flex items-center text-[14px] text-grey-500"
              >
                전체보기
                <ChevronRight size={16} />
              </button>
            )}
          </div>

          {shopImages.length === 0 ? (
            <div className="px-5">
              <div className="flex items-center justify-center h-32 rounded-xl bg-grey-50">
                <p className="text-[14px] text-grey-400">등록된 사진이 없어요</p>
              </div>
            </div>
          ) : shopImages.length === 1 ? (
            <div className="px-5">
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
            </div>
          ) : shopImages.length === 2 ? (
            <div className="px-5">
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
                <button
                  onClick={() => setGalleryState({ images: shopImages, initialIndex: 1 })}
                  className="flex-1 aspect-square rounded-r-lg overflow-hidden bg-grey-100"
                >
                  <Image
                    src={shopImages[1]}
                    alt="업체 사진 2"
                    width={167}
                    height={167}
                    className="w-full h-full object-cover"
                  />
                </button>
              </div>
            </div>
          ) : (
            <div className="px-5">
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
                      onClick={() => setAllImagesOpen(true)}
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
            </div>
          )}
        </section>

        {/* 구분선 */}
        <div className="h-2 bg-grey-50" />

        {/* 방문 리뷰 */}
        <section className="py-4">
          <div className="px-5 mb-4">
            <h3 className="text-[19px] font-medium text-grey-900 leading-[1.5] tracking-[-0.19px]">
              방문리뷰
            </h3>
          </div>

          <div className="px-5 mb-8">
            <Button
              variant="primary"
              size="medium"
              fullWidth
              onClick={() => setIsReviewModalOpen(true)}
              className="!bg-grey-600 hover:!bg-grey-700 active:!bg-grey-800 gap-1.5"
            >
              <PencilLine size={16} strokeWidth={2} />
              <span className="text-[16px] font-medium text-white leading-[1.5] tracking-[-0.16px]">
                {shop.reviewCount === 0 ? "첫 리뷰를 작성해주세요" : "리뷰를 작성해주세요"}
              </span>
            </Button>
          </div>

          {shop.reviewCount > 0 && (
            <div className="px-5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center text-[16px] text-grey-900 tracking-[-0.16px]">
                  <span>총&nbsp;</span>
                  <span>{shop.reviewCount}</span>
                  <span>개</span>
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
                  {isSortDropdownOpen && (
                    <div className="absolute right-0 top-6 z-10 bg-white rounded-lg rounded-tr-none shadow-[0px_0px_10px_0px_rgba(0,0,0,0.2)] overflow-hidden w-[112px]">
                      <button
                        onClick={() => handleSortChange("LATEST")}
                        className={`flex items-center px-3 py-2 w-full text-[14px] ${sortBy === "LATEST" ? "text-main" : "text-grey-700"} hover:bg-grey-50`}
                      >
                        최신순
                      </button>
                      <div className="border-t border-grey-100" />
                      <button
                        onClick={() => handleSortChange("LIKE_COUNT")}
                        className={`flex items-center px-3 py-2 w-full text-[14px] ${sortBy === "LIKE_COUNT" ? "text-main" : "text-grey-700"} hover:bg-grey-50`}
                      >
                        좋아요순
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-3">
                {shop.reviews
                  .slice(0, shop.reviewCount >= 6 ? 5 : shop.reviewCount)
                  .map((review) => (
                    <ReviewItem
                      key={review.id}
                      review={review}
                      onLikeToggle={handleLikeToggle}
                      onEdit={handleEditReview}
                      onDelete={handleDeleteReview}
                      onReport={handleReportReview}
                      onReportUser={handleReportUser}
                      onBlock={handleBlockUser}
                      onImageClick={(images, index) =>
                        setGalleryState({ images, initialIndex: index })
                      }
                      isAdmin={isAdmin}
                      isLoggedIn={isLoggedIn}
                    />
                  ))}
              </div>

              {shop.reviewCount >= 6 && (
                <OutlineButton
                  onClick={handleViewAllReviews}
                  fullWidth
                  rightIcon={<ChevronRight size={24} className="text-grey-700" strokeWidth={1.5} />}
                  className="mt-4"
                >
                  리뷰 전체보기
                </OutlineButton>
              )}
            </div>
          )}

          {shop.reviewCount === 0 && (
            <div className="px-5 py-8 flex flex-col items-center justify-center">
              <p className="text-[14px] text-grey-400">아직 작성된 리뷰가 없어요.</p>
            </div>
          )}
        </section>

        <div className="h-8" />
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

      {allImagesOpen && (
        <ImagesGalleryOverlay
          images={[
            ...(shop.mainImageUrl ? [shop.mainImageUrl] : []),
            ...shop.reviews.flatMap((review) => review.imageUrls),
          ]}
          onClose={() => setAllImagesOpen(false)}
        />
      )}

      {/* 리뷰 작성 모달 */}
      <ReviewWriteModal
        shopId={validShopId}
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
      />

      {/* 리뷰 수정 모달 */}
      {editingReview && (
        <ReviewWriteModal
          shopId={validShopId}
          isOpen={!!editingReview}
          onClose={() => setEditingReview(null)}
          reviewId={editingReview.id}
          initialData={{ content: editingReview.content, imageUrls: editingReview.imageUrls }}
        />
      )}

      <ReviewDeleteConfirmModal
        isOpen={!!deletingReviewId}
        isLoading={deleteReviewMutation.isPending}
        onClose={() => setDeletingReviewId(null)}
        onConfirm={handleConfirmDelete}
      />

      <ReportBottomSheet
        isOpen={!!reportTarget}
        isLoading={createReportMutation.isPending}
        targetType={reportTarget?.type ?? "REVIEW"}
        onClose={() => setReportTarget(null)}
        onSubmit={handleSubmitReport}
      />

      <ReportSuccessModal
        isOpen={isReportSuccessOpen}
        onClose={() => setIsReportSuccessOpen(false)}
      />

      <BlockUserConfirmModal
        isOpen={!!blockTarget}
        isLoading={blockUserMutation.isPending}
        nickname={blockTarget?.nickname ?? ""}
        onClose={() => setBlockTarget(null)}
        onConfirm={handleConfirmBlock}
      />

      <ShopDeleteConfirmModal
        isOpen={isShopDeleteModalOpen}
        isLoading={deleteShopMutation.isPending}
        shopName={shop.name}
        onClose={() => setIsShopDeleteModalOpen(false)}
        onConfirm={handleConfirmShopDelete}
      />

      <ShopEditModal
        isOpen={isShopEditModalOpen}
        isLoading={updateShopMutation.isPending}
        shopId={validShopId}
        shopData={{
          name: shop.name,
          addressName: shop.addressName,
          locationHint: shop.locationHint,
          openTime: shop.openTime,
          mainImageUrl: shop.mainImageUrl,
        }}
        onClose={() => setIsShopEditModalOpen(false)}
        onSave={handleShopEdit}
      />

      {/* 리뷰 전체보기 오버레이 */}
      {showAllReviews && (
        <div className="fixed inset-0 z-50 flex justify-center bg-black/0">
          <div
            className={`flex flex-col w-full max-w-[480px] bg-white ${isAllReviewsClosing ? "animate-slide-down" : "animate-slide-up"}`}
          >
            <BackHeader title="방문 리뷰 상세" onBack={handleCloseAllReviews} />
            <div className="flex-1 overflow-y-auto">
              {isAllReviewsLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="h-10 w-10 animate-spin rounded-full border-4 border-grey-200 border-t-main" />
                </div>
              ) : allReviews.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 px-5">
                  <p className="text-[15px] text-grey-500 mb-4">아직 작성된 리뷰가 없어요.</p>
                </div>
              ) : (
                <div className="px-5 pt-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center text-[16px] text-grey-900 tracking-[-0.16px]">
                      <span>총&nbsp;</span>
                      <span>{allReviewsTotalCount}개</span>
                    </div>
                    <div className="relative" ref={allReviewsSortRef}>
                      <button
                        onClick={() => setIsAllReviewsSortOpen(!isAllReviewsSortOpen)}
                        className="flex items-center gap-1 text-[16px] text-grey-700"
                      >
                        <span>{allReviewsSortBy === "LATEST" ? "최신순" : "좋아요순"}</span>
                        <ChevronDown
                          size={16}
                          className={`text-grey-700 transition-transform ${isAllReviewsSortOpen ? "rotate-180" : ""}`}
                        />
                      </button>
                      {isAllReviewsSortOpen && (
                        <div className="absolute right-0 top-6 z-10 bg-white rounded-lg rounded-tr-none shadow-[0px_0px_10px_0px_rgba(0,0,0,0.2)] overflow-hidden w-[112px]">
                          <button
                            onClick={() => handleAllReviewsSortChange("LATEST")}
                            className={`flex items-center px-3 py-2 w-full text-[14px] ${allReviewsSortBy === "LATEST" ? "text-main" : "text-grey-700"} hover:bg-grey-50`}
                          >
                            최신순
                          </button>
                          <div className="border-t border-grey-100" />
                          <button
                            onClick={() => handleAllReviewsSortChange("LIKE_COUNT")}
                            className={`flex items-center px-3 py-2 w-full text-[14px] ${allReviewsSortBy === "LIKE_COUNT" ? "text-main" : "text-grey-700"} hover:bg-grey-50`}
                          >
                            좋아요순
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-3">
                    {allReviews.map((review) => (
                      <ReviewItem
                        key={review.id}
                        review={review}
                        onLikeToggle={handleAllReviewsLikeToggle}
                        onEdit={handleAllReviewsEdit}
                        onDelete={handleAllReviewsDelete}
                        onReport={handleReportReview}
                        onReportUser={handleReportUser}
                        onBlock={handleBlockUser}
                        isAdmin={isAdmin}
                        isLoggedIn={isLoggedIn}
                        onImageClick={(images, index) =>
                          setGalleryState({ images, initialIndex: index })
                        }
                      />
                    ))}
                  </div>
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
          </div>
        </div>
      )}

      {/* 유저 액션 바텀시트 */}
      {isUserMenuOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end bg-black/50"
          onClick={() => setIsUserMenuOpen(false)}
        >
          <div
            className="w-full max-w-[480px] mx-auto bg-white rounded-t-2xl pb-safe h-[188px] animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-end px-5 pt-4 pb-2">
              <button onClick={() => setIsUserMenuOpen(false)} aria-label="닫기">
                <X size={20} className="text-grey-900" />
              </button>
            </div>
            <button
              onClick={() => {
                setIsUserMenuOpen(false);
                setIsSuggestModalOpen(true);
              }}
              className="flex items-center gap-[8px] px-5 w-full h-[46px] border-b border-[#F7F7F9]"
            >
              <SquarePen size={20} className="text-grey-900" />
              <span className="text-[16px] text-grey-900">정보 수정 제안하기</span>
            </button>
            <button
              onClick={() => {
                setIsUserMenuOpen(false);
                handleReportShop();
              }}
              className="flex items-center gap-[8px] px-5 w-full h-[46px]"
            >
              <Siren size={20} className="text-error" />
              <span className="text-[16px] text-error">매장 신고하기</span>
            </button>
          </div>
        </div>
      )}

      <ShopSuggestModal
        isOpen={isSuggestModalOpen}
        isLoading={createSuggestMutation.isPending}
        onClose={() => setIsSuggestModalOpen(false)}
        onSubmit={handleSubmitSuggest}
      />
    </div>
  );

  if (onClose) {
    return (
      <div className="fixed inset-0 z-50 flex justify-center bg-default">
        <div className="w-full max-w-[480px]">{content}</div>
      </div>
    );
  }

  return content;
}
