"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/common";

interface Shop {
  id: number;
  name: string;
  mainImageUrl: string | null;
  distance?: number; // 미터 단위 (백엔드에서 제공 시 사용)
}

interface ShopDuplicateCheckModalProps {
  isOpen: boolean;
  shops: Shop[];
  onClose: () => void;
  onSelectNotHere: () => void;
}

export function ShopDuplicateCheckModal({
  isOpen,
  shops,
  onClose,
  onSelectNotHere,
}: ShopDuplicateCheckModalProps) {
  const [selectedImage, setSelectedImage] = useState<{ url: string; name: string } | null>(null);

  // ESC 키로 모달 닫기
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (selectedImage) {
          setSelectedImage(null);
        } else {
          onClose();
        }
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose, selectedImage]);

  // Body 스크롤 방지
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/70" onClick={onClose} aria-hidden="true" />

      {/* Modal */}
      <div
        role="dialog"
        aria-labelledby="duplicate-check-title"
        aria-describedby="duplicate-check-description"
        className="relative bg-white rounded-t-3xl w-full max-w-[480px] pb-[52px] flex flex-col gap-5"
      >
        {/* Content */}
        <div className="px-5 pt-5">
          {/* Title & Close Button */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 pr-2">
              <h2
                id="duplicate-check-title"
                className="text-[18px] font-semibold leading-[1.4] tracking-[-0.18px] text-grey-900 mb-2 w-[183px] whitespace-pre-wrap"
              >
                50m 이내에 이미 등록된 {shops.length}개의 가챠샵이 있어요
              </h2>
              <p
                id="duplicate-check-description"
                className="text-[14px] leading-[1.5] tracking-[-0.14px] text-grey-400"
              >
                등록 전, 중복되는 가챠샵이 있는지 확인해주세요
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-6 h-6 flex items-center justify-center flex-shrink-0"
              aria-label="닫기"
            >
              <X size={24} className="stroke-grey-900" strokeWidth={2} />
            </button>
          </div>

          {/* Shop List - Horizontal Scroll in Border Box */}
          <div className="border border-line-200 rounded-lg px-3 py-2 flex flex-col gap-2">
            <p className="text-[12px] font-medium leading-[1.5] tracking-[-0.12px] text-grey-500 select-none">
              근처 가게
            </p>
            <div className="flex gap-2 overflow-x-auto pb-px -mr-3 pr-3 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {shops.map((shop) => (
                <div key={shop.id} className="flex flex-col gap-2 flex-shrink-0 select-none">
                  {/* Shop Image */}
                  <div
                    className="w-[85px] h-[85px] rounded-[5px] overflow-hidden bg-grey-100 cursor-pointer"
                    onClick={() =>
                      shop.mainImageUrl &&
                      setSelectedImage({ url: shop.mainImageUrl, name: shop.name })
                    }
                  >
                    {shop.mainImageUrl ? (
                      <img
                        src={shop.mainImageUrl}
                        alt={shop.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-grey-400 text-[12px]">
                        이미지 없음
                      </div>
                    )}
                  </div>
                  {/* Shop Name */}
                  <p className="text-[15px] leading-[1.5] tracking-[-0.15px] text-grey-900 text-center truncate w-[85px]">
                    {shop.name}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Button */}
        <div className="px-5">
          <Button variant="secondary" size="medium" fullWidth onClick={onSelectNotHere}>
            중복되는 장소가 없어요
          </Button>
        </div>
      </div>

      {/* Image Zoom Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/70"
            onClick={() => setSelectedImage(null)}
            aria-hidden="true"
          />

          {/* Content */}
          <div
            role="dialog"
            aria-label={selectedImage.name}
            className="relative flex flex-col gap-7 items-center justify-center w-full max-w-[480px]"
          >
            {/* Title & Image */}
            <div className="flex flex-col gap-4 items-start w-full">
              {/* Title */}
              <div className="flex items-center justify-center px-6 w-full">
                <p className="text-[20px] font-semibold leading-[1.4] tracking-[-0.2px] text-white text-center truncate">
                  {selectedImage.name}
                </p>
              </div>

              {/* Image */}
              <div className="w-full px-6">
                <div className="w-[327px] h-[435px] mx-auto flex items-center justify-center overflow-hidden rounded-3xl">
                  <img
                    src={selectedImage.url}
                    alt={selectedImage.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={() => setSelectedImage(null)}
              className="w-11 h-11 flex items-center justify-center rounded-full bg-grey-500"
              aria-label="닫기"
            >
              <X size={20} className="stroke-white" strokeWidth={2} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
