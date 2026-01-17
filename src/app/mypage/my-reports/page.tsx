"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronDown, Navigation } from "lucide-react";
import { useMyReports } from "@/api/queries/useMyReports";
import { Footer, BackHeader } from "@/components/common";
import StatusBadge from "@/components/features/shop/StatusBadge";
import { DEFAULT_IMAGES } from "@/constants";

type SortOrder = "latest" | "oldest";

/**
 * 주소에서 시/도 + 구/군만 추출
 * @example "서울시 강남구 역삼동 123" -> "서울 강남구"
 * @example "서울특별시 강남구 신사동" -> "서울 강남구"
 */
const formatAddress = (addressName: string | null | undefined): string => {
  if (!addressName) return "";

  const parts = addressName.split(" ");
  if (parts.length < 2) return addressName;

  // 첫 번째 부분에서 "특별시", "광역시", "시", "도" 제거
  const city = parts[0]
    .replace("특별시", "")
    .replace("광역시", "")
    .replace("시", "")
    .replace("도", "");

  // 두 번째 부분 (구/군/시)
  const district = parts[1];

  return `${city} ${district}`;
};

export default function MyReportsPage() {
  const router = useRouter();
  const [sortOrder, setSortOrder] = useState<SortOrder>("latest");
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  // API로 내가 제보한 업체 목록 조회
  const { data: reportsData, isLoading, error } = useMyReports();

  // API 응답을 UI용 데이터로 변환
  const reports = useMemo(() => {
    if (!reportsData?.content) return [];
    return reportsData.content.map((shop) => ({
      id: shop.id,
      name: shop.name,
      imageUrl: shop.mainImageUrl,
      openStatus: shop.openStatus,
      address: formatAddress(shop.addressName),
      // YYYY-MM-DD -> YYYY.MM.DD 형식 변환
      reportedAt: shop.createdAt.replace(/-/g, "."),
    }));
  }, [reportsData]);

  // 정렬된 리스트
  const sortedReports = useMemo(() => {
    return [...reports].sort((a, b) => {
      const dateA = new Date(a.reportedAt.replace(/\./g, "-"));
      const dateB = new Date(b.reportedAt.replace(/\./g, "-"));
      return sortOrder === "latest"
        ? dateB.getTime() - dateA.getTime()
        : dateA.getTime() - dateB.getTime();
    });
  }, [reports, sortOrder]);

  const totalCount = reportsData?.totalCount ?? reports.length;

  const handleShopClick = (shopId: number) => {
    router.push(`/shop/${shopId}`);
  };

  const handleSortChange = (order: SortOrder) => {
    setSortOrder(order);
    setShowSortDropdown(false);
  };

  // 로딩 상태
  if (isLoading) {
    return (
      <>
        <main className="h-[calc(100dvh-70px)] overflow-hidden relative bg-default flex flex-col">
          <BackHeader title="내가 제보한 업체" />
          <div className="flex flex-1 items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-grey-200 border-t-main"></div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <>
        <main className="h-[calc(100dvh-70px)] overflow-hidden relative bg-default flex flex-col">
          <BackHeader title="내가 제보한 업체" />
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-5">
            <p className="text-center text-[16px] font-normal leading-[1.5] tracking-[-0.16px] text-grey-600">
              {error instanceof Error ? error.message : "제보한 업체 목록을 불러올 수 없어요."}
            </p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <main className="h-[calc(100dvh-70px)] overflow-hidden relative bg-default flex flex-col">
        {/* 헤더 */}
        <BackHeader title="내가 제보한 업체" />

        {/* 컨텐츠 영역 */}
        {reports.length === 0 ? (
          /* Empty State - 빈 상태 */
          <div className="flex flex-1 flex-col items-center justify-center gap-7 px-5">
            <div className="flex flex-col items-center gap-7">
              <Image
                src={DEFAULT_IMAGES.MY_SHOP}
                alt="제보한 업체 없음"
                width={76}
                height={110}
                className="object-contain"
              />
              <p className="text-center text-[20px] font-semibold leading-[1.4] tracking-[-0.2px] text-grey-900">
                아직 발견되지 않은
                <br />
                새로운 업체를 등록해보세요!
              </p>
            </div>
          </div>
        ) : (
          /* List State - 목록 상태 */
          <>
            {/* 총 개수 & 정렬 */}
            <div className="flex-shrink-0 mt-3 mb-1 flex items-center justify-between px-5">
              <div className="flex items-center text-[14px] font-normal leading-[1.5] tracking-[-0.14px] text-grey-900">
                <span>총&nbsp;</span>
                <span>{totalCount}개</span>
              </div>

              {/* 정렬 드롭다운 */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowSortDropdown(!showSortDropdown)}
                  className="flex items-center gap-1 text-[14px] font-normal leading-[1.5] tracking-[-0.14px] text-grey-700"
                >
                  <span>{sortOrder === "latest" ? "최신순" : "오래된순"}</span>
                  <ChevronDown size={16} className="stroke-grey-700" />
                </button>

                {showSortDropdown && (
                  <>
                    {/* 드롭다운 닫기용 오버레이 */}
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowSortDropdown(false)}
                    />
                    {/* 드롭다운 메뉴 */}
                    <div className="absolute right-0 top-6 z-20 bg-white rounded-lg shadow-lg border border-grey-100 py-1 min-w-[80px]">
                      <button
                        type="button"
                        onClick={() => handleSortChange("latest")}
                        className={`w-full px-3 py-2 text-left text-[14px] leading-[1.5] tracking-[-0.14px] ${
                          sortOrder === "latest"
                            ? "text-main font-medium"
                            : "text-grey-700 font-normal"
                        }`}
                      >
                        최신순
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSortChange("oldest")}
                        className={`w-full px-3 py-2 text-left text-[14px] leading-[1.5] tracking-[-0.14px] ${
                          sortOrder === "oldest"
                            ? "text-main font-medium"
                            : "text-grey-700 font-normal"
                        }`}
                      >
                        오래된순
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* 리스트 */}
            <div className="flex-1 overflow-y-auto px-5 pb-4">
              <div className="flex flex-col">
                {sortedReports.map((shop) => (
                  <div key={shop.id} className="relative w-full">
                    <button
                      type="button"
                      onClick={() => handleShopClick(shop.id)}
                      className="flex gap-3 items-center w-full py-4 text-left"
                    >
                      {/* 이미지 */}
                      <div className="relative rounded-[5px] shrink-0 size-[85px] overflow-hidden bg-grey-100">
                        <Image
                          src={shop.imageUrl || DEFAULT_IMAGES.NO_IMAGE}
                          alt={shop.name}
                          fill
                          className="object-cover"
                        />
                      </div>

                      {/* 정보 */}
                      <div className="flex flex-col gap-1 h-[85px] flex-1 min-w-0">
                        {/* 상단: 영업상태 & 날짜 */}
                        <div className="flex items-center justify-between w-full">
                          <StatusBadge openStatus={shop.openStatus} />
                          <span className="text-[12px] font-normal leading-[1.5] tracking-[-0.12px] text-grey-400">
                            {shop.reportedAt}
                          </span>
                        </div>

                        {/* 가게 이름 */}
                        <p className="text-[18px] font-semibold text-grey-900 tracking-[-0.18px] overflow-hidden text-ellipsis whitespace-nowrap leading-[150%]">
                          {shop.name}
                        </p>

                        {/* 위치 정보 */}
                        <div className="flex gap-1 items-center">
                          <Navigation
                            size={16}
                            className="fill-grey-600 stroke-grey-600 shrink-0"
                            strokeWidth={1.25}
                          />
                          <span className="text-[14px] font-normal text-grey-600 tracking-[-0.14px] leading-[150%]">
                            {shop.address}
                          </span>
                        </div>
                      </div>
                    </button>

                    {/* 하단 구분선 */}
                    <div className="absolute left-0 bottom-0 w-full h-[1px] bg-grey-100" />
                  </div>
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
