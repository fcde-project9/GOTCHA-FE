"use client";

import { useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { Heart, Share, Copy, ChevronRight, PencilLine, X, Expand } from "lucide-react";
import { useShopDetail } from "@/api/queries/useShopDetail";
import { Button, BackHeader } from "@/components/common";
import KakaoMap from "@/components/features/map/KakaoMap";
import { ReviewWriteModal } from "@/components/features/review/ReviewWriteModal";
import { StatusBadge } from "@/components/features/shop";
import { useFavorite, useToast } from "@/hooks";
import type { ReviewResponse, OpenTime } from "@/types/api";

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
function ReviewItem({ review }: { review: ReviewResponse }) {
  // createdAt 포맷팅
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}`;
  };

  return (
    <div className="flex gap-3 py-4 border-b border-grey-100 last:border-b-0">
      {review.imageUrls && review.imageUrls.length > 0 && (
        <div className="shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-grey-100">
          <Image
            src={review.imageUrls[0]}
            alt="리뷰 이미지"
            width={64}
            height={64}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[14px] font-semibold text-grey-900">{review.author.nickname}</span>
          <span className="text-[12px] text-grey-500">{formatDate(review.createdAt)}</span>
        </div>
        <p className="text-[14px] text-grey-700 leading-[1.5] line-clamp-2">{review.content}</p>
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

  // React Query로 shop 상세 조회
  const { data: shop, isLoading, error, refetch } = useShopDetail(validShopId);

  // 찜하기 훅 (shop 데이터 로드 후 초기값 동기화)
  const {
    isFavorite,
    isLoading: isFavoriteLoading,
    toggleFavorite,
  } = useFavorite({
    shopId: validShopId,
    initialIsFavorite: shop?.isFavorite ?? false,
    onUnauthorized: () => {
      showToast("찜하기는 로그인 후 이용 가능합니다");
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

  // 주소 복사
  const handleCopyAddress = async () => {
    if (!shop) return;
    try {
      await navigator.clipboard.writeText(shop.addressName);
      showToast("주소를 복사했어요!");
    } catch {
      showToast("주소 복사에 실패했습니다");
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
        showToast("링크가 복사되었습니다");
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
          {error instanceof Error ? error.message : "업체를 찾을 수 없습니다."}
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

        {/* 구분선 */}
        <div className="h-2 bg-grey-50" />

        {/* 주소 정보 */}
        <section className="px-5 pt-4 pb-2">
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
              <span className="text-[14px] text-grey-900">{shop.todayOpenTime || "-"}</span>
              <StatusBadge isOpen={shop.isOpen} />
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

            return (
              <>
                <div className="flex items-center justify-between px-5 mb-3">
                  <div className="flex items-center gap-2">
                    <h3 className="text-[18px] font-medium text-grey-900 leading-[1.5] tracking-[-0.18px]">
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
                      <p className="text-[14px] text-grey-400">등록된 사진이 없습니다</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2 overflow-x-auto px-5 pb-2 scrollbar-hide">
                    {shopImages.slice(0, 5).map((imageUrl, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImageUrl(imageUrl)}
                        className="shrink-0 w-24 h-24 rounded-lg overflow-hidden bg-grey-100"
                      >
                        <Image
                          src={imageUrl}
                          alt={`업체 사진 ${index + 1}`}
                          width={96}
                          height={96}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                    {shopImages.length > 5 && (
                      <button
                        onClick={handleViewAllImages}
                        className="shrink-0 w-24 h-24 rounded-lg bg-grey-100 flex flex-col items-center justify-center"
                      >
                        <span className="text-[16px] font-semibold text-grey-600">
                          +{shopImages.length - 5}
                        </span>
                        <span className="text-[12px] text-grey-500">더보기</span>
                      </button>
                    )}
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
          <div className="flex items-center justify-between px-5 mb-3">
            <div className="flex items-center gap-2">
              <h3 className="text-[18px] font-medium text-grey-900 leading-[1.5] tracking-[-0.18px]">
                방문리뷰
              </h3>
              <span className="text-[14px] text-main font-medium">
                {shop.reviews.length > 0 ? shop.reviews.length : ""}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {shop.reviews.length > 0 && (
                <>
                  <button
                    onClick={handleWriteReview}
                    className="flex items-center gap-1 text-[14px] text-main font-medium"
                  >
                    <PencilLine size={14} strokeWidth={2} />
                    작성
                  </button>
                  <span className="text-grey-300">|</span>
                  <button
                    onClick={handleViewAllReviews}
                    className="flex items-center text-[14px] text-grey-500"
                  >
                    전체보기
                    <ChevronRight size={16} />
                  </button>
                </>
              )}
            </div>
          </div>

          {shop.reviews.length === 0 ? (
            // 리뷰 없음 상태
            <div className="px-5">
              <Button
                variant="primary"
                size="medium"
                fullWidth
                onClick={handleWriteReview}
                className="!bg-grey-700 hover:!bg-grey-800 active:!bg-grey-900 gap-1.5"
              >
                <PencilLine size={16} strokeWidth={2} />
                <span className="text-[16px] font-medium text-white leading-[1.5] tracking-[-0.16px]">
                  첫 리뷰를 작성해주세요
                </span>
              </Button>
            </div>
          ) : (
            // 리뷰 목록
            <div className="px-5">
              {shop.reviews.slice(0, 3).map((review) => (
                <ReviewItem key={review.id} review={review} />
              ))}
              {shop.reviews.length > 3 && (
                <button
                  onClick={handleViewAllReviews}
                  className="w-full py-3 text-center text-[14px] text-grey-600 border border-grey-200 rounded-lg mt-3"
                >
                  리뷰 {shop.reviews.length}개 전체보기
                </button>
              )}
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
    </div>
  );
}
