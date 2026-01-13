import { useState, useCallback } from "react";
import { useKakaoLoader } from "./useKakaoLoader";

export interface PlaceSearchResult {
  id: string;
  place_name: string;
  address_name: string;
  road_address_name: string;
  x: string; // longitude
  y: string; // latitude
  category_name: string;
  category_group_code: string;
  category_group_name: string;
  phone: string;
  place_url: string;
  distance: string;
}

interface UseKakaoPlacesReturn {
  results: PlaceSearchResult[];
  isLoading: boolean;
  error: string | null;
  searchPlaces: (keyword: string) => void;
  clearResults: () => void;
}

/**
 * 장소의 관련도 점수를 계산 (높을수록 우선순위 높음)
 */
function calculateRelevanceScore(place: PlaceSearchResult, keyword: string): number {
  const placeName = place.place_name || "";
  const categoryGroup = place.category_group_code;
  const normalizedKeyword = keyword.trim().toLowerCase();
  const normalizedPlaceName = placeName.toLowerCase();

  let score = 0;

  // 1. 정확히 일치하는 경우 최고 점수
  if (normalizedPlaceName === normalizedKeyword) score += 1100; // 지역명 자체가 최우선
  if (normalizedPlaceName === normalizedKeyword + "역") score += 1000;
  if (normalizedPlaceName === normalizedKeyword + "구") score += 950;
  if (normalizedPlaceName === normalizedKeyword + "동") score += 900;
  if (normalizedPlaceName === normalizedKeyword + "시") score += 850;

  // 2. 시작 위치 보너스 (검색어로 시작하는 경우)
  if (normalizedPlaceName.startsWith(normalizedKeyword)) {
    score += 500;

    // 짧은 검색어일 때는 시작 위치 보너스를 더 높게
    if (keyword.length <= 2) {
      score += 200;
    }
  }

  // 3. 카테고리별 우선순위
  if (categoryGroup === "SW8") {
    score += 400; // 지하철역 최우선
  } else if (placeName.includes("역")) {
    score += 350; // 역 포함
  } else if (placeName.includes("구")) {
    score += 300; // 구 단위
  } else if (placeName.includes("동")) {
    score += 250; // 동 단위
  } else if (placeName.includes("시")) {
    score += 200; // 시 단위
  } else if (placeName.includes("읍") || placeName.includes("면")) {
    score += 150; // 읍/면 단위
  }

  // 4. 검색어 길이에 따른 가중치 조정
  if (keyword.length <= 2) {
    // 짧은 검색어: 장소명이 짧을수록 높은 점수 (간결한 지명 우선)
    const lengthPenalty = Math.max(0, placeName.length - keyword.length - 2) * 10;
    score -= lengthPenalty;
  } else {
    // 긴 검색어: 검색어와 유사한 길이 선호
    const lengthRatio = keyword.length / placeName.length;
    score += lengthRatio * 150;
  }

  // 5. 포함 위치 보너스 (검색어가 중간/끝에 있는 경우)
  const keywordIndex = normalizedPlaceName.indexOf(normalizedKeyword);
  if (keywordIndex > 0) {
    // 중간이나 끝에 있으면 약간 감점
    score -= keywordIndex * 20;
  }

  return score;
}

/**
 * 서울 지역인지 확인
 */
function isSeoulArea(place: PlaceSearchResult): boolean {
  const addressName = place.address_name || "";
  const roadAddressName = place.road_address_name || "";

  // 주소에 "서울"이 포함되어 있는지 확인
  return addressName.startsWith("서울") || roadAddressName.startsWith("서울");
}

/**
 * 장소가 유효한 지역/역인지 판단
 */
function isValidRegion(place: PlaceSearchResult, keyword: string): boolean {
  const categoryGroup = place.category_group_code;
  const categoryName = place.category_name || "";
  const placeName = place.place_name || "";
  const addressName = place.address_name || "";
  const normalizedKeyword = keyword.trim().toLowerCase();
  const normalizedPlaceName = placeName.toLowerCase();

  // place_name에 검색어가 포함되어 있지 않으면 제외
  if (!normalizedPlaceName.includes(normalizedKeyword)) {
    return false;
  }

  // 서울 지역만 허용
  if (!isSeoulArea(place)) {
    return false;
  }

  // 지하철역은 무조건 허용 (서울 지역 확인 후)
  if (categoryGroup === "SW8") {
    return true;
  }

  // 음식점, 카페, 매장 등은 먼저 제외
  const isShop =
    categoryName.includes("음식점") ||
    categoryName.includes("카페") ||
    categoryName.includes("상점") ||
    categoryName.includes("편의점") ||
    categoryName.includes("마트") ||
    categoryName.includes("병원") ||
    categoryName.includes("약국") ||
    categoryName.includes("학교") ||
    categoryName.includes("학원") ||
    categoryGroup === "FD6" || // 음식점
    categoryGroup === "CE7" || // 카페
    categoryGroup === "CS2" || // 편의점
    categoryGroup === "PM9" || // 약국
    categoryGroup === "HP8" || // 병원
    categoryGroup === "MT1" || // 마트
    categoryGroup === "AC5"; // 학원

  if (isShop) {
    return false;
  }

  // 자연지형 제외 (산, 하천 등) - 단, 역/구/동이 포함되면 허용
  // 공원은 제외하지 않음 (지역 랜드마크로 유용)
  const isNaturalFeature =
    categoryName.includes("산,계곡") ||
    categoryName.includes("하천") ||
    (placeName.includes("강") &&
      !placeName.includes("역") &&
      !placeName.includes("구") &&
      !placeName.includes("동") &&
      !placeName.includes("시") &&
      !addressName.includes("강남"));

  if (isNaturalFeature) {
    return false;
  }

  // 지역명 판단 - 행정구역과 역 위주로 (먼저 확인)
  const hasRegionSuffix =
    placeName.includes("역") ||
    placeName.includes("동") ||
    placeName.includes("구") ||
    placeName.includes("시") ||
    placeName.includes("읍") ||
    placeName.includes("면") ||
    placeName.includes("리") ||
    placeName.includes("로");

  const isAdministrativeArea =
    categoryName.includes("행정구역") ||
    categoryName.includes("지명") ||
    categoryName.includes("지하철") ||
    categoryName.includes("교통");

  // 지역명이 확실하면 바로 허용
  if (hasRegionSuffix || isAdministrativeArea) {
    return true;
  }

  // 주소 기반으로 서울 내 지역인지 확인 (접미사 없는 지역명 허용)
  const hasSeoulAddress =
    addressName.includes("서울") && (addressName.includes("구") || addressName.includes("동"));

  // 검색어가 2글자 이상이고, 서울 주소가 있으면 지역명으로 간주
  if (keyword.length >= 2 && hasSeoulAddress) {
    const isLikelyRegionName =
      categoryName.includes("지역") ||
      categoryName.includes("지명") ||
      categoryName === "" ||
      (!categoryName.includes("음식점") &&
        !categoryName.includes("카페") &&
        !categoryName.includes("상점"));

    if (isLikelyRegionName) {
      return true;
    }
  }

  // 관광명소, 카지노, 투어센터 등 제외
  const isExcludedPlace =
    placeName.includes("카지노") ||
    placeName.includes("투어센터") ||
    placeName.includes("안내소") ||
    placeName.includes("광장") ||
    placeName.includes("소녀상") ||
    placeName.includes("동상") ||
    placeName.includes("둘레길") ||
    placeName.includes("공원") ||
    placeName.includes("거리") ||
    categoryName.includes("카지노") ||
    categoryName.includes("도보여행") ||
    categoryName.includes("테마거리") ||
    categoryName.includes("문화유적") ||
    categoryName.includes("관광안내소");

  if (isExcludedPlace) {
    return false;
  }

  // 주소에 행정구역이 포함되어 있으면 지역으로 간주
  const hasAddressInfo =
    addressName.includes("구") || addressName.includes("동") || addressName.includes("시");

  if (hasAddressInfo) {
    return true;
  }

  return false;
}

/**
 * Kakao Places API를 사용하여 장소 검색을 수행하는 커스텀 훅
 *
 * @returns 검색 결과, 로딩 상태, 에러, 검색 함수
 *
 * @example
 * ```tsx
 * const { results, isLoading, error, searchPlaces } = useKakaoPlaces();
 *
 * searchPlaces("강남역");
 * ```
 */
export function useKakaoPlaces(): UseKakaoPlacesReturn {
  const { loaded } = useKakaoLoader();
  const [results, setResults] = useState<PlaceSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchPlaces = useCallback(
    (keyword: string) => {
      if (!loaded || !window.kakao || !window.kakao.maps || !window.kakao.maps.services) {
        console.error("Kakao Maps API 로드 상태:", {
          loaded,
          kakao: !!window.kakao,
          maps: !!window.kakao?.maps,
          services: !!window.kakao?.maps?.services,
        });
        setError("Kakao Maps API가 로드되지 않았어요.");
        return;
      }

      if (!keyword || keyword.trim() === "") {
        setResults([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      const ps = new window.kakao.maps.services.Places();
      const allResults: PlaceSearchResult[] = [];

      // 검색 키워드 전략: 길이에 따라 다르게 처리
      let searchKeywords: string[] = [];

      if (keyword.length === 1) {
        // 1글자 검색어: 매우 다양한 조합으로 확장
        searchKeywords = [keyword + "역", keyword + "구", keyword + "동", keyword + "로", keyword];
      } else if (keyword.length === 2) {
        // 2글자 검색어: 다양한 조합으로 확장
        searchKeywords = [keyword + "역", keyword + "구", keyword + "동", keyword];
      } else {
        // 긴 검색어 (3글자 이상): 원본 + 역/구/동만
        searchKeywords = [keyword, keyword + "역", keyword + "구", keyword + "동"];
      }

      let completedSearches = 0;
      const maxPages = keyword.length === 1 ? 5 : keyword.length === 2 ? 4 : 3; // 짧을수록 더 많은 페이지

      // 각 키워드로 검색
      const searchWithKeyword = (searchKeyword: string) => {
        const searchPage = (page: number) => {
          ps.keywordSearch(
            searchKeyword,
            (data: PlaceSearchResult[], status: string, pagination: { hasNextPage: boolean }) => {
              if (status === window.kakao.maps.services.Status.OK) {
                allResults.push(...data);

                // 더 조회할 페이지가 있고, 아직 maxPages에 도달하지 않았으면 계속 조회
                if (pagination.hasNextPage && page < maxPages) {
                  searchPage(page + 1);
                } else {
                  // 이 키워드의 모든 페이지 조회 완료
                  completedSearches++;
                  if (completedSearches === searchKeywords.length) {
                    // 모든 키워드 검색 완료 - 필터링 및 정렬
                    processResults(allResults, keyword);
                  }
                }
              } else if (status === window.kakao.maps.services.Status.ZERO_RESULT) {
                // 이 키워드는 결과 없음
                completedSearches++;
                if (completedSearches === searchKeywords.length) {
                  if (allResults.length === 0) {
                    setIsLoading(false);
                    setResults([]);
                    setError("검색 결과가 없어요.");
                  } else {
                    processResults(allResults, keyword);
                  }
                }
              } else {
                // 에러 발생
                completedSearches++;
                if (completedSearches === searchKeywords.length) {
                  if (allResults.length === 0) {
                    setIsLoading(false);
                    setResults([]);
                    setError("검색 중 오류가 발생했어요.");
                  } else {
                    processResults(allResults, keyword);
                  }
                }
              }
            },
            {
              page: page,
              size: 15,
            }
          );
        };

        searchPage(1);
      };

      // 결과 처리 함수
      const processResults = (data: PlaceSearchResult[], keyword: string) => {
        // 1. 유효한 지역/역만 필터링
        const validPlaces = data.filter((place) => isValidRegion(place, keyword));

        // 2. 관련도 점수 계산 및 정렬
        const scoredPlaces = validPlaces.map((place) => ({
          ...place,
          relevanceScore: calculateRelevanceScore(place, keyword),
        }));

        scoredPlaces.sort((a, b) => b.relevanceScore - a.relevanceScore);

        // 3. 중복 제거
        const uniquePlaces = scoredPlaces.filter(
          (place, index, self) => index === self.findIndex((p) => p.place_name === place.place_name)
        );

        // 4. 지역명 자체 추가 (예: 주소에 "강남구" 있으면 "강남"도 추가)
        const syntheticPlaces: Array<PlaceSearchResult & { relevanceScore: number }> = [];

        if (keyword.length >= 2 && !uniquePlaces.find((p) => p.place_name === keyword)) {
          // 주소에 "keyword+구" 또는 "keyword+동"이 포함된 장소 찾기
          const basePlace = uniquePlaces.find((p) => {
            const addr = p.address_name || "";
            return (
              addr.includes("서울") &&
              (addr.includes(keyword + "구") || addr.includes(keyword + "동"))
            );
          });

          if (basePlace) {
            // 주소에서 좌표 추출
            syntheticPlaces.push({
              id: `synthetic_${keyword}`,
              place_name: keyword,
              address_name: basePlace.address_name,
              road_address_name: basePlace.road_address_name || "",
              category_name: "지역 > 지명",
              category_group_code: "",
              category_group_name: "",
              x: basePlace.x,
              y: basePlace.y,
              phone: "",
              place_url: "",
              distance: "",
              relevanceScore: 1100,
            });
          }
        }

        // 합성된 지역명 추가 및 재정렬
        const allPlaces = [...syntheticPlaces, ...uniquePlaces].sort(
          (a, b) => b.relevanceScore - a.relevanceScore
        );

        // 5. 검색어 길이에 따라 결과 개수 조정
        const resultLimit = keyword.length <= 2 ? 10 : 15; // 짧은 검색어는 10개, 긴 검색어는 15개
        const topResults = allPlaces.slice(0, resultLimit);

        setIsLoading(false);
        setResults(topResults);

        if (topResults.length === 0) {
          setError("지역 또는 지하철역 검색 결과가 없어요.");
        }
      };

      // 모든 키워드로 병렬 검색 시작
      searchKeywords.forEach((searchKeyword) => {
        searchWithKeyword(searchKeyword);
      });
    },
    [loaded]
  );

  const clearResults = useCallback(() => {
    setResults([]);
    setError(null);
  }, []);

  return {
    results,
    isLoading,
    error,
    searchPlaces,
    clearResults,
  };
}
