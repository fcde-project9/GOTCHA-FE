"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Search, ArrowUpDown, CircleX } from "lucide-react";
import { useFavorites } from "@/api/queries/useFavorites";
import { Footer, Button } from "@/components/common";
import { FavoriteShopItem } from "@/components/features/favorites";
import { FavoriteShopResponse } from "@/types/api";

// 찜한 업체 UI 표시용 타입
interface FavoriteShop {
  id: number;
  name: string;
  address: string;
  isOpen: boolean;
  imageUrl?: string;
  createdAt: string; // 찜 등록일
}

type SortOption = "latest" | "oldest";

/**
 * API 응답을 UI 표시용 타입으로 변환
 */
function favoriteResponseToShop(response: FavoriteShopResponse): FavoriteShop {
  return {
    id: response.id,
    name: response.name,
    address: response.address,
    isOpen: response.isOpen,
    imageUrl: response.mainImageUrl,
    createdAt: response.favoritedAt,
  };
}

export default function FavoritesPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>("latest");

  // React Query로 찜 목록 조회
  const { data: favoritesData, isLoading, error, refetch } = useFavorites();

  // 로그인 여부 판단 (null이면 비로그인, 배열이면 로그인)
  const isLoggedIn = favoritesData !== null && favoritesData !== undefined;

  // API 응답을 UI용 타입으로 변환
  const favorites: FavoriteShop[] = useMemo(() => {
    if (!favoritesData) return [];
    return (favoritesData as unknown as FavoriteShopResponse[]).map(favoriteResponseToShop);
  }, [favoritesData]);

  // 검색 필터링
  const filteredFavorites = useMemo(
    () => favorites.filter((shop) => shop.name.toLowerCase().includes(searchQuery.toLowerCase())),
    [favorites, searchQuery]
  );

  // 정렬
  const sortedFavorites = useMemo(() => {
    return [...filteredFavorites].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOption === "latest" ? dateB - dateA : dateA - dateB;
    });
  }, [filteredFavorites, sortOption]);

  // 정렬 옵션 토글
  const handleSortToggle = () => {
    setSortOption((prev) => (prev === "latest" ? "oldest" : "latest"));
  };

  // 새로고침
  const handleRefresh = () => {
    refetch();
  };

  // 검색어 초기화
  const handleClearSearch = () => {
    setSearchQuery("");
  };

  // 로딩/에러 상태 결정
  const showLoading = isLoading;
  const showError = error && !isLoading;

  return (
    <>
      <main className="h-[calc(100dvh-70px)] overflow-hidden relative bg-default flex flex-col">
        {/* 헤더 */}
        <header className="flex-shrink-0 flex h-12 items-center bg-default px-5 py-2">
          <h1 className="text-[18px] font-semibold leading-[1.5] tracking-[-0.18px] text-grey-900">
            찜한 업체
          </h1>
        </header>

        {/* 검색창 - 찜한 업체가 있을 때만 표시 */}
        {favorites.length > 0 && (
          <div className="flex-shrink-0 px-5 pt-3">
            <div className="flex h-11 items-center justify-between rounded-lg bg-grey-50 px-3 py-2.5">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="찜한 업체 검색"
                className="flex-1 bg-transparent text-[15px] font-normal leading-[1.5] tracking-[-0.15px] text-grey-900 placeholder:text-grey-500 focus:outline-none"
              />
              {searchQuery ? (
                <button type="button" onClick={handleClearSearch} aria-label="검색어 지우기">
                  <CircleX size={24} className="fill-grey-500 stroke-grey-50" strokeWidth={2} />
                </button>
              ) : (
                <Search size={24} className="stroke-grey-500" strokeWidth={2} />
              )}
            </div>
          </div>
        )}

        {/* 컨텐츠 영역 */}
        {showLoading ? (
          <div className="flex flex-1 items-center justify-center px-5">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-grey-200 border-t-main"></div>
          </div>
        ) : showError ? (
          // Error State
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-5">
            <p className="text-center text-[16px] font-normal leading-[1.5] tracking-[-0.16px] text-grey-600">
              {error instanceof Error ? error.message : "찜한 업체 목록을 불러올 수 없습니다."}
            </p>
            <button
              type="button"
              onClick={handleRefresh}
              className="rounded-lg bg-main px-6 py-3 text-[15px] font-semibold text-white"
            >
              다시 시도
            </button>
          </div>
        ) : sortedFavorites.length === 0 ? (
          // Empty State
          <div className="flex flex-1 flex-col items-center justify-center gap-7 px-5">
            <div>
              <Image
                src="/images/shop.png"
                alt="찜한 업체 없음"
                width={80}
                height={80}
                className="object-contain"
              />
            </div>
            {isLoggedIn ? (
              <p className="text-center text-[20px] font-semibold leading-[1.4] tracking-[-0.2px] text-grey-900 pb-16">
                관심있는 매장을 찜 해보세요!
              </p>
            ) : (
              <div className="flex flex-col items-center gap-6 pb-8">
                <div className="flex flex-col items-center gap-2">
                  <p className="text-center text-[20px] font-semibold leading-[1.4] tracking-[-0.2px] text-grey-900">
                    로그인이 필요해요
                  </p>
                  <p className="text-center text-[14px] font-normal leading-[1.5] tracking-[-0.14px] text-grey-600">
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
          <>
            {/* 총 개수 & 정렬 - 고정 */}
            <div className="flex-shrink-0 mt-4 mb-3 flex items-center justify-between px-5">
              <div className="flex items-center text-[14px] font-normal leading-[1.5] tracking-[-0.14px] text-grey-900">
                <span>총&nbsp;</span>
                <span>{sortedFavorites.length}개</span>
              </div>
              <button
                type="button"
                onClick={handleSortToggle}
                className="flex items-center gap-1 text-[14px] font-normal leading-[1.5] tracking-[-0.14px] text-grey-700"
              >
                <span>{sortOption === "latest" ? "최신순" : "오래된순"}</span>
                <ArrowUpDown size={16} className="stroke-grey-700" strokeWidth={2} />
              </button>
            </div>

            {/* 찜한 업체 리스트 - 스크롤 영역 */}
            <div className="flex-1 overflow-y-auto px-5 pb-4">
              <div className="flex flex-col">
                {sortedFavorites.map((shop) => (
                  <FavoriteShopItem key={shop.id} shop={shop} />
                ))}
              </div>
            </div>
          </>
        )}
      </main>
      <Footer />
    </>
  );
}
