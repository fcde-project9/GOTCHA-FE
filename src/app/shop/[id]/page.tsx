"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import {
  Heart,
  Share,
  Copy,
  ChevronRight,
  ChevronDown,
  PencilLine,
  X,
  Expand,
  ThumbsUp,
  MoreVertical,
  Pencil,
  Trash2,
  Images,
} from "lucide-react";
import { useDeleteReview } from "@/api/mutations/useDeleteReview";
import { useToggleReviewLike } from "@/api/mutations/useToggleReviewLike";
import { useShopDetail } from "@/api/queries/useShopDetail";
import { Button, BackHeader, OutlineButton } from "@/components/common";
import KakaoMap from "@/components/features/map/KakaoMap";
import { ReviewDeleteConfirmModal } from "@/components/features/review/ReviewDeleteConfirmModal";
import { ReviewWriteModal } from "@/components/features/review/ReviewWriteModal";
import { StatusBadge } from "@/components/features/shop";
import { useFavorite, useToast } from "@/hooks";
import type { ReviewResponse, OpenTime, ReviewSortOption } from "@/types/api";

// 요일 매핑 (API 응답 키 -> 한글)
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

// openTime JSON 문자열 파싱
function parseOpenTime(openTimeStr: string): OpenTime | null {
  try {
    return JSON.parse(openTimeStr) as OpenTime;
  } catch {
    return null;
  }
}

// 영업일 배열 추출 (null이 아닌 요일들)
function getBusinessDays(openTime: OpenTime | null): (keyof OpenTime)[] {
  if (!openTime) return [];
  return ALL_DAYS.filter((day) => openTime[day] !== null);
}

// 요일 배지 컴포넌트
function DayBadge({ day, isActive }: { day: string; isActive: boolean }) {
  return (
    <div
      className={`flex items-center justify-center w-7 h-7 rounded-full text-[12px] font-medium ${
        isActive ? "bg-grey-500 text-white" : "bg-grey-100 text-grey-400"
      }`}
    >
      {day}
    </div>
  );
}

// 리뷰 아이템 컴포넌트
function ReviewItem({
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

  // createdAt 포맷팅
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}`;
  };

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

export default function ShopDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const shopId = parseShopId(params.id);

  const isValidShopId = shopId !== null;
  const validShopId = shopId ?? 0;

  // 리뷰 정렬 옵션
  const [sortBy, setSortBy] = useState<ReviewSortOption>("LATEST");
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const sortDropdownRef = useRef<HTMLDivElement>(null);

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

  // React Query로 shop 상세 조회
  const { data: shop, isLoading, error, refetch } = useShopDetail(validShopId, sortBy);

  // 찜하기 훅 (shop 데이터 로드 후 초기값 동기화)
  const {
    isFavorite,
    isLoading: isFavoriteLoading,
    toggleFavorite,
  } = useFavorite({
    shopId: validShopId,
    initialIsFavorite: shop?.isFavorite ?? false,
    onUnauthorized: () => {
      showToast("찜하기는 로그인 후 이용 가능해요.");
    },
  });

  // openTime 파싱
  const openTime = shop ? parseOpenTime(shop.openTime) : null;
  const businessDays = getBusinessDays(openTime);

  // 지도 확대 모달 상태
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);

  // 이미지 뷰어 모달 상태
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);

  // 리뷰 작성 모달 상태
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  // 리뷰 수정 상태 (수정할 리뷰 데이터)
  const [editingReview, setEditingReview] = useState<ReviewResponse | null>(null);

  // 리뷰 삭제 상태 (삭제할 리뷰 ID)
  const [deletingReviewId, setDeletingReviewId] = useState<number | null>(null);

  // 리뷰 삭제 mutation hook
  const deleteReviewMutation = useDeleteReview(validShopId, deletingReviewId ?? 0);

  // 리뷰 좋아요 토글 mutation hook
  const toggleReviewLikeMutation = useToggleReviewLike();

  // 주소 복사
  const handleCopyAddress = async () => {
    if (!shop) return;
    try {
      await navigator.clipboard.writeText(shop.addressName);
      showToast("주소를 복사했어요!");
    } catch {
      showToast("주소 복사에 실패했어요.");
    }
  };

  // 공유하기
  const handleShare = async () => {
    if (!shop) return;
    try {
      if (navigator.share) {
        await navigator.share({
          title: shop.name,
          text: `${shop.name} - ${shop.addressName}`,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        showToast("링크가 복사되었어요.");
      }
    } catch {
      // 공유 취소 시 무시
    }
  };

  // 리뷰 작성 모달 열기
  const handleWriteReview = () => {
    setIsReviewModalOpen(true);
  };

  // 전체 리뷰 보기
  const handleViewAllReviews = () => {
    router.push(`/shop/${validShopId}/reviews`);
  };

  // 리뷰 좋아요 토글
  const handleLikeToggle = (reviewId: number) => {
    const review = shop?.reviews.find((r) => r.id === reviewId);
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
    const reviewToEdit = shop?.reviews.find((r) => r.id === reviewId);
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

  // 정렬 변경
  const handleSortChange = (newSortBy: ReviewSortOption) => {
    setSortBy(newSortBy);
    setIsSortDropdownOpen(false);
  };

  // 전체 사진 보기
  const handleViewAllImages = () => {
    router.push(`/shop/${validShopId}/images`);
  };

  // 유효하지 않은 shopId 처리
  if (!isValidShopId) {
    return (
      <div className="h-dvh bg-default flex flex-col">
        <BackHeader title="업체 상세정보" />
        <div className="flex-1 flex flex-col items-center justify-center px-5">
          <p className="text-[15px] text-grey-500 mb-4">잘못된 접근입니다</p>
          <Button variant="primary" size="small" onClick={() => router.push("/")}>
            홈으로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="h-dvh flex items-center justify-center bg-default">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-grey-200 border-t-main" />
      </div>
    );
  }

  // 에러 상태
  if (error || !shop) {
    return (
      <div className="h-dvh flex flex-col items-center justify-center gap-4 bg-default px-5">
        <p className="text-[16px] text-grey-600">
          {error instanceof Error ? error.message : "업체를 찾을 수 없어요."}
        </p>
        <Button variant="primary" size="medium" onClick={() => router.back()}>
          돌아가기
        </Button>
      </div>
    );
  }

  return (
    <div className="h-dvh bg-default flex flex-col overflow-hidden">
      {/* 헤더 */}
      <div className="flex items-center justify-between pr-5">
        <BackHeader title={shop.name} />
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

      {/* 스크롤 컨텐츠 */}
      <div className="flex-1 overflow-y-auto pb-safe">
        {/* 업체명 & 액션 버튼 */}
        <section className="px-5 py-2">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0 max-w-[248px]">
              <h2 className="text-xl font-medium text-grey-900 leading-[1.4] tracking-[-0.2px ]">
                {shop.name}
              </h2>
            </div>
          </div>
        </section>

        {/* 주소 정보 */}
        <section className="px-5 py-2">
          <div className="flex items-start gap-3">
            <div className="flex flex-col min-w-0 gap-2">
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
          </div>
        </section>

        {/* 영업일 & 영업시간 */}
        <section className="px-5 pb-4">
          <div className="flex flex-col gap-3">
            {/* 영업 요일 */}
            <div className="flex items-center gap-2">
              <span className="shrink-0 w-16 text-[14px] text-grey-400">영업일</span>
              <div className="flex gap-1.5">
                {ALL_DAYS.map((day) => (
                  <DayBadge key={day} day={DAY_MAP[day]} isActive={businessDays.includes(day)} />
                ))}
              </div>
            </div>
            {/* 영업 시간 */}
            <div className="flex items-center gap-2">
              <span className="shrink-0 w-16 text-[14px] text-grey-400">영업시간</span>
              <span className="text-[14px] text-grey-900">
                {shop.todayOpenTime || "영업시간 정보 없음"}
              </span>
              <StatusBadge isOpen={shop.isOpen} isDayOff={!shop.todayOpenTime} />
            </div>
          </div>
        </section>

        {/* 지도 */}
        <section className="px-5 pb-4">
          <div className="rounded-xl overflow-hidden border border-grey-100">
            <div className="relative">
              <KakaoMap
                height="168px"
                latitude={shop.latitude}
                longitude={shop.longitude}
                level={4}
                draggable={false}
                zoomable={false}
                markers={[
                  {
                    id: shop.id,
                    name: shop.name,
                    latitude: shop.latitude,
                    longitude: shop.longitude,
                    mainImageUrl: shop.mainImageUrl,
                    openTime: openTime || {
                      Mon: null,
                      Tue: null,
                      Wed: null,
                      Thu: null,
                      Fri: null,
                      Sat: null,
                      Sun: null,
                    },
                    isOpen: shop.isOpen,
                    distance: "",
                    isFavorite: isFavorite,
                  },
                ]}
              />
              {/* 지도 확대 버튼 */}
              <button
                onClick={() => setIsMapModalOpen(true)}
                className="absolute z-10 bottom-3 right-3 flex items-center justify-center w-9 h-9 bg-white rounded-lg"
                aria-label="지도 크게 보기"
              >
                <Expand size={24} className="stroke-icon-default" strokeWidth={1.5} />
              </button>
            </div>
          </div>
        </section>

        {/* 구분선 */}
        <div className="h-2 bg-grey-50" />

        {/* 업체 사진 (대표 이미지 + 리뷰 이미지) */}
        <section className="py-4">
          {(() => {
            // mainImageUrl을 첫 번째에 추가
            const shopImages = [
              ...(shop.mainImageUrl ? [shop.mainImageUrl] : []),
              ...shop.recentReviewImages,
            ];
            const totalImageCount = shop.totalReviewImageCount + (shop.mainImageUrl ? 1 : 0);
            // 5개 이상일 때 더보기 오버레이에 표시할 남은 개수
            const remainingCount = totalImageCount > 5 ? totalImageCount - 4 : 0;

            return (
              <>
                <div className="flex items-center justify-between px-5 mb-3">
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
                  <div className="px-5">
                    <div className="flex items-center justify-center h-32 rounded-xl bg-grey-50">
                      <p className="text-[14px] text-grey-400">등록된 사진이 없어요</p>
                    </div>
                  </div>
                ) : shopImages.length === 1 ? (
                  /* 사진 1개: 전체 너비 이미지 */
                  <div className="px-5">
                    <button
                      onClick={() => setSelectedImageUrl(shopImages[0])}
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
                ) : (
                  /* 사진 여러 개: 왼쪽 큰 이미지 + 오른쪽 2x2 그리드 */
                  <div className="px-5">
                    <div className="flex gap-px">
                      {/* 왼쪽 큰 이미지 */}
                      <button
                        onClick={() => setSelectedImageUrl(shopImages[0])}
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

                      {/* 오른쪽 2x2 그리드 */}
                      <div className="flex-1 flex flex-wrap gap-px content-end">
                        {/* 상단 왼쪽 (인덱스 1) */}
                        {shopImages[1] && (
                          <button
                            onClick={() => setSelectedImageUrl(shopImages[1])}
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

                        {/* 상단 오른쪽 (인덱스 2) */}
                        {shopImages[2] && (
                          <button
                            onClick={() => setSelectedImageUrl(shopImages[2])}
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

                        {/* 하단 왼쪽 (인덱스 3) */}
                        {shopImages[3] && (
                          <button
                            onClick={() => setSelectedImageUrl(shopImages[3])}
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

                        {/* 하단 오른쪽 (인덱스 4) - 더보기 오버레이 포함 */}
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
                            {/* 더보기 오버레이 */}
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
                          /* 4번째 이미지가 없는 경우 (2~4개만 있을 때) 빈 공간 */
                          <div className="w-[calc(50%-0.5px)] aspect-square rounded-br-lg bg-grey-100" />
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </>
            );
          })()}
        </section>

        {/* 구분선 */}
        <div className="h-2 bg-grey-50" />

        {/* 방문 리뷰 */}
        <section className="py-4">
          {/* 섹션 타이틀 */}
          <div className="px-5 mb-4">
            <h3 className="text-[20px] font-semibold text-grey-900 leading-[1.4] tracking-[-0.2px]">
              방문리뷰
            </h3>
          </div>

          {/* 리뷰 작성 버튼 */}
          <div className="px-5 mb-4">
            <Button
              variant="primary"
              size="medium"
              fullWidth
              onClick={handleWriteReview}
              className="!bg-grey-700 hover:!bg-grey-800 active:!bg-grey-900 gap-1.5"
            >
              <PencilLine size={16} strokeWidth={2} />
              <span className="text-[16px] font-medium text-white leading-[1.5] tracking-[-0.16px]">
                {shop.reviewCount === 0 ? "첫 리뷰를 작성해주세요" : "리뷰를 작성해주세요"}
              </span>
            </Button>
          </div>

          {shop.reviewCount > 0 && (
            <div className="px-5">
              {/* 총 개수 & 정렬 */}
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
                {shop.reviews.slice(0, 3).map((review) => (
                  <ReviewItem
                    key={review.id}
                    review={review}
                    onLikeToggle={handleLikeToggle}
                    onEdit={handleEditReview}
                    onDelete={handleDeleteReview}
                  />
                ))}
              </div>

              {/* 리뷰 전체보기 버튼 */}
              <OutlineButton
                onClick={handleViewAllReviews}
                fullWidth
                rightIcon={<ChevronRight size={24} className="text-grey-700" strokeWidth={1.5} />}
                className="mt-4"
              >
                리뷰 전체보기
              </OutlineButton>
            </div>
          )}

          {shop.reviewCount === 0 && (
            <div className="px-5 py-8 flex flex-col items-center justify-center">
              <p className="text-[14px] text-grey-400">아직 작성된 리뷰가 없어요.</p>
            </div>
          )}
        </section>

        {/* 하단 여백 */}
        <div className="h-8" />
      </div>

      {/* 지도 확대 모달 */}
      {isMapModalOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-white">
          {/* 모달 헤더 */}
          <div className="flex items-center justify-end px-2 py-1 border-b border-grey-100">
            <button
              onClick={() => setIsMapModalOpen(false)}
              className="flex items-center justify-center w-10 h-10"
              aria-label="닫기"
            >
              <X size={24} className="stroke-grey-700" strokeWidth={2} />
            </button>
          </div>

          {/* 지도 영역 */}
          <div className="flex-1">
            <KakaoMap
              height="100%"
              latitude={shop.latitude}
              longitude={shop.longitude}
              level={3}
              markers={[
                {
                  id: shop.id,
                  name: shop.name,
                  latitude: shop.latitude,
                  longitude: shop.longitude,
                  mainImageUrl: shop.mainImageUrl,
                  openTime: openTime || {
                    Mon: null,
                    Tue: null,
                    Wed: null,
                    Thu: null,
                    Fri: null,
                    Sat: null,
                    Sun: null,
                  },
                  isOpen: shop.isOpen,
                  distance: "",
                  isFavorite: isFavorite,
                },
              ]}
            />
          </div>

          {/* 주소 정보 */}
          <div className="px-5 py-4 border-t border-grey-100 bg-white">
            <h2 className="text-[18px] font-semibold text-grey-900">{shop.name}</h2>
            <p className="text-[14px] text-grey-700">{shop.addressName}</p>
          </div>
        </div>
      )}

      {/* 이미지 뷰어 모달 */}
      {selectedImageUrl && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/70"
          onClick={() => setSelectedImageUrl(null)}
        >
          {/* 이미지 */}
          <div
            className="relative w-[327px] max-h-[70vh] rounded-3xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={selectedImageUrl}
              alt="업체 사진"
              width={327}
              height={435}
              className="w-full h-auto object-contain"
            />
          </div>

          {/* 닫기 버튼 */}
          <button
            onClick={() => setSelectedImageUrl(null)}
            className="mt-7 flex items-center justify-center w-11 h-11 rounded-full bg-grey-500"
            aria-label="닫기"
          >
            <X size={24} className="stroke-white" strokeWidth={2} />
          </button>
        </div>
      )}

      {/* 리뷰 작성 모달 */}
      <ReviewWriteModal
        shopId={validShopId}
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        onSuccess={() => refetch()}
      />

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
