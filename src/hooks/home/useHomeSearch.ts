"use client";

import { useState, useCallback, useEffect } from "react";
import { useKakaoPlaces, PlaceSearchResult } from "@/hooks";
import { useMapStore } from "@/stores";
import { trackMapSearch } from "@/utils/analytics";

interface UseHomeSearchReturn {
  /** 검색 모드 여부 */
  isSearching: boolean;
  /** 검색어 */
  searchQuery: string;
  /** 검색 결과 목록 */
  results: PlaceSearchResult[];
  /** 검색 대기 중 (디바운스 또는 API 로딩) */
  isPending: boolean;
  /** 검색 모드 시작 */
  handleSearchClick: () => void;
  /** 검색 취소 (검색 모드 종료) */
  handleSearchCancel: () => void;
  /** 검색어 지우기 */
  handleClearSearch: () => void;
  /** 검색어 변경 */
  setSearchQuery: (query: string) => void;
  /** 검색 결과 선택 핸들러 (위치 좌표 반환) */
  handleResultClick: (result: PlaceSearchResult) => {
    latitude: number;
    longitude: number;
    placeName: string;
  };
}

/**
 * 홈 페이지 검색 상태 관리 Hook
 * - 검색 모드 토글
 * - 검색어 및 결과 관리
 * - 카카오 장소 검색 연동
 */
export function useHomeSearch(): UseHomeSearchReturn {
  const { results, isLoading, loaded, searchPlaces, clearResults } = useKakaoPlaces();
  const { searchQuery: storedSearchQuery, setSearchQuery: setStoredSearchQuery } = useMapStore();

  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQueryState] = useState("");
  const [isAutoSearchEnabled, setIsAutoSearchEnabled] = useState(true);
  const [isDebouncing, setIsDebouncing] = useState(false);

  // 스토어에서 검색어 복원
  useEffect(() => {
    if (storedSearchQuery) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- 스토어 hydration 후 검색어 복원
      setSearchQueryState(storedSearchQuery);
    }
  }, [storedSearchQuery]);

  // 검색어 변경 시 스토어에 저장 (자동 검색 활성화)
  const setSearchQuery = useCallback(
    (query: string) => {
      setIsAutoSearchEnabled(true); // 사용자 입력 시 자동 검색 활성화
      setSearchQueryState(query);
      setStoredSearchQuery(query);
      // 검색어가 있으면 디바운싱 상태를 동기적으로 설정 (렌더링 갭 방지)
      if (query.trim()) {
        setIsDebouncing(true);
      }
    },
    [setStoredSearchQuery]
  );

  // 검색어 변경 시 자동 검색 (자동 검색 활성화 + API 로드 완료된 경우만)
  useEffect(() => {
    if (!isAutoSearchEnabled || !loaded) return;

    if (searchQuery.trim()) {
      setIsDebouncing(true);
      const debounce = setTimeout(() => {
        setIsDebouncing(false);
        searchPlaces(searchQuery);
      }, 300);

      // cleanup에서는 타이머만 정리 (setIsDebouncing(false) 호출 시 앱 WebView에서 렌더 갭 발생)
      return () => clearTimeout(debounce);
    } else {
      setIsDebouncing(false);
      clearResults();
    }
  }, [searchQuery, searchPlaces, clearResults, isAutoSearchEnabled, loaded]);

  // 검색 모드 시작
  const handleSearchClick = useCallback(() => {
    setIsSearching(true);
    setIsAutoSearchEnabled(true);
  }, []);

  // 검색 취소 (검색 모드 종료)
  const handleSearchCancel = useCallback(() => {
    setIsSearching(false);
    setSearchQuery("");
    clearResults();
  }, [setSearchQuery, clearResults]);

  // 검색어 지우기
  const handleClearSearch = useCallback(() => {
    setSearchQuery("");
    clearResults();
  }, [setSearchQuery, clearResults]);

  // 검색 결과 선택 핸들러
  const handleResultClick = useCallback(
    (result: PlaceSearchResult) => {
      // GA 이벤트: 지역/지하철 검색
      trackMapSearch(result.place_name, results.length);

      // 자동 검색 비활성화 (결과 선택 시 재검색 방지)
      setIsAutoSearchEnabled(false);

      // 검색어를 선택한 장소명으로 업데이트
      setSearchQueryState(result.place_name);
      setStoredSearchQuery(result.place_name);

      // 검색 모드 종료
      setIsSearching(false);

      // 선택한 위치 좌표 반환
      return {
        latitude: parseFloat(result.y),
        longitude: parseFloat(result.x),
        placeName: result.place_name,
      };
    },
    [results.length, setStoredSearchQuery]
  );

  return {
    isSearching,
    searchQuery,
    results,
    isPending: isDebouncing || isLoading,
    handleSearchClick,
    handleSearchCancel,
    handleClearSearch,
    setSearchQuery,
    handleResultClick,
  };
}
