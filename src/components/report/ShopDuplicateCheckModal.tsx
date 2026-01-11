"use client";

import { X } from "lucide-react";

interface Shop {
  id: number;
  name: string;
  mainImageUrl: string | null;
  distance: number; // 미터 단위
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
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Dim Background */}
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-t-3xl w-full max-w-[480px] max-h-[70vh] pb-[52px] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-line-200">
          <h2 className="text-[18px] font-semibold leading-[1.5] tracking-[-0.18px] text-grey-900">
            근처 등록된 업체
          </h2>
          <button onClick={onClose} className="w-6 h-6 flex items-center justify-center">
            <X size={24} className="stroke-grey-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <p className="text-[14px] leading-[1.5] tracking-[-0.14px] text-grey-600 mb-4">
            이미 등록된 업체가 있습니다. 아래 업체가 맞나요?
          </p>

          {/* Shop List */}
          <div className="flex flex-col gap-3">
            {shops.map((shop) => (
              <div
                key={shop.id}
                className="flex gap-3 p-3 rounded-lg border border-line-200 hover:border-main-400 transition-colors cursor-pointer"
              >
                {/* Shop Image */}
                <div className="w-20 h-20 rounded-lg overflow-hidden bg-grey-100 flex-shrink-0">
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

                {/* Shop Info */}
                <div className="flex flex-col justify-center flex-1">
                  <p className="text-[16px] font-semibold leading-[1.5] tracking-[-0.16px] text-grey-900">
                    {shop.name}
                  </p>
                  <p className="text-[14px] leading-[1.5] tracking-[-0.14px] text-grey-500">
                    약 {shop.distance}m
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Button */}
        <div className="px-5 pt-4 border-t border-line-200">
          <button
            onClick={onSelectNotHere}
            className="w-full h-[46px] bg-grey-100 rounded-lg flex items-center justify-center text-[16px] font-semibold leading-[1.5] tracking-[-0.16px] text-grey-900 hover:bg-grey-200 transition-colors"
          >
            이 위치가 아니에요
          </button>
        </div>
      </div>
    </div>
  );
}
