"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Search, ArrowUpDown, CircleX } from "lucide-react";
import { Footer } from "@/components/common";
import { FavoriteShopItem } from "@/components/features/favorites";
import { mockShops } from "@/data/mockShops";

// TODO: API 연동 - 찜한 업체 타입 정의
interface FavoriteShop {
  id: number;
  name: string;
  address: string; // 구/동까지 (예: 강남구 역삼동)
  isOpen: boolean;
  imageUrl?: string;
  createdAt: string; // 찜 등록일
}

type SortOption = "latest" | "oldest";

// Mock 주소 데이터 (실제로는 API에서 받아올 데이터)
const mockAddresses = [
  "강남구 역삼동",
  "마포구 신촌동",
  "마포구 서교동",
  "중구 명동",
  "송파구 잠실동",
];

export default function FavoritesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>("latest");
  const [favorites, setFavorites] = useState<FavoriteShop[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: API 연동 - 찜한 업체 목록 가져오기
    // const fetchFavorites = async () => {
    //   try {
    //     const response = await fetch('/api/favorites');
    //     const data = await response.json();
    //     setFavorites(data);
    //   } catch (error) {
    //     console.error('찜한 업체 목록 불러오기 실패:', error);
    //   } finally {
    //     setIsLoading(false);
    //   }
    // };
    // fetchFavorites();

    // 임시: mockShops 데이터를 FavoriteShop 형식으로 변환
    const mockFavorites: FavoriteShop[] = mockShops.map((shop, index) => ({
      id: shop.id,
      name: shop.name,
      address: mockAddresses[index] || "서울시 강남구",
      isOpen: shop.isOpen,
      imageUrl: shop.imageUrl,
      createdAt: new Date(Date.now() - index * 24 * 60 * 60 * 1000).toISOString(), // 하루씩 차이나게
    }));

    setFavorites(mockFavorites);
    setIsLoading(false);
  }, []);

  // 검색 필터링
  const filteredFavorites = favorites.filter((shop) =>
    shop.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 정렬
  const sortedFavorites = [...filteredFavorites].sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return sortOption === "latest" ? dateB - dateA : dateA - dateB;
  });

  // TODO: API 연동 - 찜 해제
  const handleRemoveFavorite = async (shopId: number) => {
    // try {
    //   await fetch(`/api/favorites/${shopId}`, { method: 'DELETE' });
    //   setFavorites(favorites.filter(shop => shop.id !== shopId));
    // } catch (error) {
    //   console.error('찜 해제 실패:', error);
    // }

    // 임시: 로컬 상태에서만 제거
    setFavorites(favorites.filter((shop) => shop.id !== shopId));
  };

  // 정렬 옵션 토글
  const handleSortToggle = () => {
    setSortOption((prev) => (prev === "latest" ? "oldest" : "latest"));
  };

  // TODO: API 연동 - 새로고침 (Pull to Refresh)
  const _handleRefresh = async () => {
    // setIsLoading(true);
    // try {
    //   const response = await fetch('/api/favorites');
    //   const data = await response.json();
    //   setFavorites(data);
    // } catch (error) {
    //   console.error('새로고침 실패:', error);
    // } finally {
    //   setIsLoading(false);
    // }
  };

  // 검색어 초기화
  const handleClearSearch = () => {
    setSearchQuery("");
  };

  return (
    <>
      <main className="h-[calc(100vh-70px)] relative bg-default">
        <div className="flex h-full flex-col">
          {/* 헤더 */}
          <header className="flex h-12 items-center bg-default px-5 py-2">
            <h1 className="text-[18px] font-semibold leading-[1.5] tracking-[-0.18px] text-grey-900">
              찜한 업체
            </h1>
          </header>

          {/* 검색창 */}
          <div className="px-5 pt-3">
            <div className="flex h-11 items-center justify-between rounded-lg bg-grey-50 px-3 py-2.5">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="찜한 업체 검색"
                className="flex-1 bg-transparent text-[15px] font-normal leading-[1.5] tracking-[-0.15px] text-grey-900 placeholder:text-grey-500 focus:outline-none"
              />
              {searchQuery ? (
                <button onClick={handleClearSearch} aria-label="검색어 지우기">
                  <CircleX size={24} className="fill-grey-500 stroke-white" strokeWidth={2} />
                </button>
              ) : (
                <Search size={24} className="stroke-grey-500" strokeWidth={2} />
              )}
            </div>
          </div>

          {/* 컨텐츠 영역 */}
          {isLoading ? (
            <div className="flex flex-1 items-center justify-center px-5">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-grey-200 border-t-main"></div>
            </div>
          ) : sortedFavorites.length === 0 ? (
            // Empty State
            <div className="flex flex-1 flex-col items-center justify-center gap-7 px-5">
              <div className="relative h-24 w-24">
                <Image
                  src="/images/shop.png"
                  alt="찜한 업체 없음"
                  width={96}
                  height={96}
                  className="object-contain"
                />
              </div>
              <p className="text-center text-[20px] font-semibold leading-[1.4] tracking-[-0.2px] text-grey-900">
                관심있는 매장을 찜 해보세요!
              </p>
            </div>
          ) : (
            <>
              {/* 총 개수 & 정렬 - 고정 */}
              <div className="mt-4 mb-3 flex items-center justify-between px-5">
                <div className="flex items-center text-[14px] font-normal leading-[1.5] tracking-[-0.14px] text-grey-900">
                  <span>총&nbsp;</span>
                  <span>{sortedFavorites.length}개</span>
                </div>
                <button
                  onClick={handleSortToggle}
                  className="flex items-center gap-1 text-[14px] font-normal leading-[1.5] tracking-[-0.14px] text-grey-700"
                >
                  <span>{sortOption === "latest" ? "최신순" : "오래된순"}</span>
                  <ArrowUpDown size={16} className="stroke-grey-700" strokeWidth={2} />
                </button>
              </div>

              {/* 찜한 업체 리스트 - 스크롤 가능 */}
              <div className="flex-1 overflow-y-auto px-5">
                <div className="flex flex-col">
                  {sortedFavorites.map((shop) => (
                    <FavoriteShopItem
                      key={shop.id}
                      shop={shop}
                      onRemove={() => handleRemoveFavorite(shop.id)}
                    />
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
