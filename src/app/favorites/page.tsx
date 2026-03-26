"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { CircleX, RefreshCcw } from "lucide-react";
import { useFavorites } from "@/api/queries/useFavorites";
import ShopDetailClient from "@/app/shop/[id]/ShopDetailClient";
import { Footer, Button, SimpleHeader, Spinner } from "@/components/common";
import { FavoriteShopItem } from "@/components/features/favorites";
import { DEFAULT_IMAGES } from "@/constants";
import { useAuth } from "@/hooks";

export default function FavoritesPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [selectedShopId, setSelectedShopId] = useState<number | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // 오버레이 열릴 때 history entry 추가 → 뒤로가기로 닫힘 처리
  useEffect(() => {
    if (selectedShopId === null) return;
    history.pushState({ shopDetail: true }, "");
    const handlePopState = () => setSelectedShopId(null);
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [selectedShopId]);

  // 전역 로그인 상태
  const { isLoggedIn, isLoading: isAuthLoading } = useAuth();

  // React Query로 찜 목록 조회 (무한 스크롤)
  const { data, isLoading, error, refetch, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useFavorites();

  // 전체 찜 목록 (모든 페이지 평탄화)
  const allFavorites = useMemo(
    () => data?.pages.flatMap((page) => page?.content ?? []) ?? [],
    [data]
  );

  // 검색 필터링
  const trimmedSearch = searchQuery.trim();
  const filteredFavorites = useMemo(() => {
    if (!trimmedSearch) return allFavorites;
    return allFavorites.filter((shop) =>
      shop.name.toLowerCase().includes(trimmedSearch.toLowerCase())
    );
  }, [allFavorites, trimmedSearch]);

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
  }, [isLoading, isFetchingNextPage, hasNextPage, fetchNextPage, trimmedSearch]);

  // 새로고침
  const handleRefresh = () => {
    refetch();
  };

  // 검색어 초기화
  const handleClearSearch = () => {
    setSearchQuery("");
  };

  // 로딩/에러 상태 결정 (인증 로딩 또는 데이터 로딩)
  const showLoading = isAuthLoading || isLoading;
  const showError = error && !isLoading && !isAuthLoading;

  return (
    <>
      <main className="h-[calc(100dvh-env(safe-area-inset-top,0px)-var(--footer-height))] overflow-hidden relative bg-default flex flex-col">
        {/* 헤더 */}
        <SimpleHeader title="찜한업체" />

        {/* 검색창 - 찜한 업체가 있을 때만 표시 */}
        {allFavorites.length > 0 && (
          <div className="flex-shrink-0">
            <div className="flex h-11 items-center justify-between rounded-lg bg-grey-50 px-3 py-2.5 mx-5 mb-3">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                placeholder="찜한업체 검색"
                className="flex-1 bg-transparent text-[17px] font-normal leading-[1.5] tracking-[-0.17px] text-grey-900 placeholder:text-grey-500 focus:outline-none"
              />
              {searchQuery ? (
                <button type="button" onClick={handleClearSearch} aria-label="검색어 지우기">
                  <CircleX size={26} className="fill-grey-500 stroke-grey-50" strokeWidth={2} />
                </button>
              ) : (
                <Image
                  src="/images/icons/search.svg"
                  alt=""
                  width={26}
                  height={26}
                  className="shrink-0 pointer-events-none select-none"
                />
              )}
            </div>
          </div>
        )}

        {/* 컨텐츠 영역 */}
        {showLoading ? (
          <div className="flex flex-1 items-center justify-center px-5">
            <Spinner />
          </div>
        ) : showError ? (
          // Error State
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-5">
            <p className="text-center text-[16px] font-normal leading-[1.5] tracking-[-0.16px] text-grey-600">
              {error instanceof Error ? error.message : "찜한 업체 목록을 불러올 수 없어요."}
            </p>
            <button
              type="button"
              onClick={handleRefresh}
              className="rounded-lg bg-grey-900 w-[174px] h-[46px] flex items-center justify-center gap-1 text-white"
            >
              <span className="text-[16px] text-white font-normal leading-[1.5] tracking-[-0.16px]">
                다시 시도
              </span>
              <RefreshCcw size={16} className="stroke-white" strokeWidth={2} />
            </button>
          </div>
        ) : trimmedSearch && filteredFavorites.length === 0 && hasNextPage ? (
          // 검색 중 + 아직 더 가져올 페이지 있음 → sentinel 유지하며 계속 로드
          <div className="flex-1 overflow-y-auto px-5 pb-3">
            <div ref={loadMoreRef} className="flex justify-center py-4">
              {isFetchingNextPage && <Spinner />}
            </div>
          </div>
        ) : trimmedSearch && filteredFavorites.length === 0 ? (
          // 모든 페이지 로드 완료 후에도 검색 결과 없음
          <div className="flex flex-1 flex-col items-center justify-center px-5">
            <p className="text-center text-[16px] font-normal leading-[1.5] tracking-[-0.16px] text-grey-600">
              검색 결과가 없어요
            </p>
          </div>
        ) : filteredFavorites.length === 0 ? (
          // Empty State
          <div className="flex flex-1 flex-col items-center justify-center gap-7 px-5 -mt-12">
            <div>
              <Image
                src={DEFAULT_IMAGES.SHOP}
                alt="찜한 업체 없음"
                width={80}
                height={80}
                className="object-contain"
              />
            </div>
            {isLoggedIn ? (
              <p className="text-center text-[20px] font-semibold leading-[1.4] tracking-[-0.2px] text-grey-900">
                관심있는 매장을 찜 해보세요!
              </p>
            ) : (
              <div className="flex flex-col items-center gap-6">
                <div className="flex flex-col items-center gap-2">
                  <p className="text-center text-[20px] font-semibold leading-[1.4] tracking-[-0.2px] text-grey-900">
                    로그인이 필요해요
                  </p>
                  <p className="text-center text-[16px] font-normal leading-[1.5] tracking-[-0.16px] text-grey-600">
                    로그인하고 관심있는 매장을 찜 해보세요
                  </p>
                </div>
                <Button variant="primary" size="medium" onClick={() => router.push("/login")}>
                  로그인하러 가기
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div
            className={`flex-1 px-5 pb-3 ${isSearchFocused ? "overflow-hidden" : "overflow-y-auto"}`}
          >
            {/* 총 개수 */}
            <div className="mt-2 mb-2 flex items-center justify-between">
              <div className="flex items-center text-[16px] font-normal leading-[1.5] tracking-[-0.16px] text-grey-900">
                <span>총&nbsp;</span>
                <span>{filteredFavorites.length}개</span>
              </div>
            </div>

            {/* 찜한 업체 리스트 */}
            <div className="flex flex-col">
              {filteredFavorites.map((shop) => (
                <FavoriteShopItem key={shop.id} shop={shop} onShopClick={setSelectedShopId} />
              ))}
            </div>

            {/* 무한 스크롤 트리거 */}
            {hasNextPage && (
              <div ref={loadMoreRef} className="flex justify-center py-4">
                {isFetchingNextPage && <Spinner />}
              </div>
            )}
          </div>
        )}
      </main>
      {selectedShopId !== null && (
        <ShopDetailClient shopId={selectedShopId} onClose={() => history.back()} />
      )}
      <Footer />
    </>
  );
}
