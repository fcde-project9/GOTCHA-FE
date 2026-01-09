"use client";

import { PlaceSearchResult } from "@/hooks/useKakaoPlaces";

interface SearchResultItemProps {
  result: PlaceSearchResult;
  searchQuery: string;
  onClick: () => void;
}

/**
 * 검색 결과 아이템 컴포넌트
 * 검색어와 일치하는 부분을 굵게 표시
 */
export function SearchResultItem({ result, searchQuery, onClick }: SearchResultItemProps) {
  // 검색어가 포함된 부분을 찾아서 굵게 표시
  const highlightText = (text: string, query: string) => {
    if (!query) return <span className="font-normal text-grey-400">{text}</span>;

    const index = text.toLowerCase().indexOf(query.toLowerCase());
    if (index === -1) return <span className="font-normal text-grey-400">{text}</span>;

    const before = text.slice(0, index);
    const match = text.slice(index, index + query.length);
    const after = text.slice(index + query.length);

    return (
      <span>
        {before && <span className="font-normal text-grey-400">{before}</span>}
        <span className="font-semibold text-grey-900">{match}</span>
        {after && <span className="font-normal text-grey-400">{after}</span>}
      </span>
    );
  };

  return (
    <div
      onClick={onClick}
      className="flex h-8 w-full cursor-pointer items-center text-[16px] leading-[1.5] tracking-[-0.16px]"
    >
      {highlightText(result.place_name, searchQuery)}
    </div>
  );
}
