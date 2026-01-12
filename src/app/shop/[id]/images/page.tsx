"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, X } from "lucide-react";
import { BackHeader } from "@/components/common";

// TODO: API 연동
const MOCK_IMAGES: string[] = [];

export default function ImagesGalleryPage() {
  const params = useParams();
  const _router = useRouter();
  const shopId = Number(params.id);

  const [images, setImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  useEffect(() => {
    const fetchImages = async () => {
      setIsLoading(true);
      try {
        // TODO: 실제 API 호출로 교체
        // const response = await fetchShopImages(shopId);
        await new Promise((resolve) => setTimeout(resolve, 500));
        setImages(MOCK_IMAGES);
      } catch {
        console.error("이미지 목록 불러오기 실패");
      } finally {
        setIsLoading(false);
      }
    };

    fetchImages();
  }, [shopId]);

  const handleImageClick = (index: number) => {
    setSelectedIndex(index);
  };

  const handleCloseModal = () => {
    setSelectedIndex(null);
  };

  const handlePrevImage = () => {
    if (selectedIndex === null) return;
    setSelectedIndex(selectedIndex > 0 ? selectedIndex - 1 : images.length - 1);
  };

  const handleNextImage = () => {
    if (selectedIndex === null) return;
    setSelectedIndex(selectedIndex < images.length - 1 ? selectedIndex + 1 : 0);
  };

  return (
    <div className="min-h-dvh bg-default">
      {/* 헤더 */}
      <BackHeader showBorder />

      {/* 컨텐츠 */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-grey-200 border-t-main" />
        </div>
      ) : images.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 px-5">
          <p className="text-[15px] text-grey-500">등록된 사진이 없습니다</p>
        </div>
      ) : (
        <div className="p-4">
          <p className="text-[14px] text-grey-500 mb-3">총 {images.length}장</p>
          <div className="grid grid-cols-3 gap-1">
            {images.map((imageUrl, index) => (
              <button
                key={index}
                onClick={() => handleImageClick(index)}
                className="aspect-square overflow-hidden bg-grey-100"
              >
                <Image
                  src={imageUrl}
                  alt={`업체 사진 ${index + 1}`}
                  width={150}
                  height={150}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 이미지 뷰어 모달 */}
      {selectedIndex !== null && (
        <div className="fixed inset-0 z-50 bg-black">
          {/* 모달 헤더 */}
          <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/50 to-transparent">
            <span className="text-[14px] text-white">
              {selectedIndex + 1} / {images.length}
            </span>
            <button
              onClick={handleCloseModal}
              className="w-10 h-10 flex items-center justify-center"
              aria-label="닫기"
            >
              <X size={24} className="text-white" />
            </button>
          </div>

          {/* 이미지 */}
          <div
            className="absolute inset-0 flex items-center justify-center"
            onClick={handleCloseModal}
          >
            <Image
              src={images[selectedIndex]}
              alt={`업체 사진 ${selectedIndex + 1}`}
              fill
              className="object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* 좌우 네비게이션 */}
          {images.length > 1 && (
            <>
              <button
                onClick={handlePrevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-black/30"
                aria-label="이전 이미지"
              >
                <ChevronLeft size={28} className="text-white" />
              </button>
              <button
                onClick={handleNextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-black/30"
                aria-label="다음 이미지"
              >
                <ChevronLeft size={28} className="text-white rotate-180" />
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
