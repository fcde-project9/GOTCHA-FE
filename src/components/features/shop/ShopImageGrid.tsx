import Image from "next/image";
import { ChevronRight, Images } from "lucide-react";
import { DEFAULT_IMAGES, ICON_IMAGES } from "@/constants/images";

interface ShopImageGridProps {
  images: string[];
  totalImageCount: number;
  onImageClick: (filteredImages: string[], index: number) => void;
  onViewAll: () => void;
  onEmptyClick?: () => void;
  showViewAllButton?: boolean;
}

export function ShopImageGrid({
  images,
  totalImageCount,
  onImageClick,
  onViewAll,
  onEmptyClick,
  showViewAllButton = true,
}: ShopImageGridProps) {
  const galleryImages = images.filter((img) => img !== DEFAULT_IMAGES.NO_IMAGE);
  const visibleGalleryCount = images
    .slice(0, 5)
    .filter((img) => img !== DEFAULT_IMAGES.NO_IMAGE).length;
  const remainingCount = Math.max(galleryImages.length - visibleGalleryCount, 0);

  const handleImageClick = (allImages: string[], index: number) => {
    if (allImages[index] === DEFAULT_IMAGES.NO_IMAGE) {
      onEmptyClick?.();
    } else {
      const filteredIndex =
        allImages.slice(0, index + 1).filter((img) => img !== DEFAULT_IMAGES.NO_IMAGE).length - 1;
      onImageClick(galleryImages, filteredIndex);
    }
  };

  return (
    <div className="py-4">
      <div className="flex items-center mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-[19px] font-medium text-grey-900 leading-[1.5] tracking-[-0.19px]">
            매장 사진
          </h3>
          {totalImageCount > 0 && (
            <span className="text-[14px] text-main font-medium">{totalImageCount}</span>
          )}
        </div>
      </div>

      {images.length === 0 ? (
        <button
          className="w-full flex items-center justify-center h-32 rounded-xl bg-grey-50"
          onClick={onEmptyClick}
        >
          <p className="text-[14px] text-grey-400">등록된 사진이 없어요</p>
        </button>
      ) : images.length === 1 ? (
        <button
          onClick={() => handleImageClick(images, 0)}
          className="w-full aspect-[335/167] rounded-lg overflow-hidden bg-grey-100"
        >
          <Image
            src={images[0]}
            alt="매장 사진"
            width={335}
            height={167}
            className="w-full h-full object-cover"
          />
        </button>
      ) : images.length === 2 ? (
        <div className="relative aspect-[335/167]">
          <div className="absolute inset-0 flex gap-px">
            <button
              onClick={() => handleImageClick(images, 0)}
              className="flex-1 rounded-l-lg overflow-hidden bg-grey-100"
            >
              <Image
                src={images[0]}
                alt="매장 사진 1"
                width={167}
                height={167}
                className="w-full h-full object-cover"
              />
            </button>
            <button
              onClick={() => handleImageClick(images, 1)}
              className="flex-1 rounded-r-lg overflow-hidden bg-grey-100"
            >
              <Image
                src={images[1]}
                alt="매장 사진 2"
                width={167}
                height={167}
                className="w-full h-full object-cover"
              />
            </button>
          </div>
        </div>
      ) : images.length === 3 ? (
        <div className="relative aspect-[335/167]">
          <div className="absolute inset-0 flex gap-px">
            <button
              onClick={() => handleImageClick(images, 0)}
              className="flex-1 rounded-l-lg overflow-hidden bg-grey-100"
            >
              <Image
                src={images[0]}
                alt="매장 사진 1"
                width={167}
                height={167}
                className="w-full h-full object-cover"
              />
            </button>
            <div className="flex-1 flex flex-col gap-px">
              <button
                onClick={() => handleImageClick(images, 1)}
                className="flex-1 rounded-tr-lg overflow-hidden bg-grey-100"
              >
                <Image
                  src={images[1]}
                  alt="매장 사진 2"
                  width={112}
                  height={83}
                  className="w-full h-full object-cover"
                />
              </button>
              <button
                onClick={() => handleImageClick(images, 2)}
                className="flex-1 rounded-br-lg overflow-hidden bg-grey-100"
              >
                <Image
                  src={images[2]}
                  alt="매장 사진 3"
                  width={112}
                  height={83}
                  className="w-full h-full object-cover"
                />
              </button>
            </div>
          </div>
        </div>
      ) : images.length === 4 ? (
        <div className="relative aspect-[335/167]">
          <div className="absolute inset-0 flex gap-px">
            <button
              onClick={() => handleImageClick(images, 0)}
              className="flex-1 rounded-l-lg overflow-hidden bg-grey-100"
            >
              <Image
                src={images[0]}
                alt="매장 사진 1"
                width={167}
                height={167}
                className="w-full h-full object-cover"
              />
            </button>
            <div className="flex-1 flex flex-col gap-px">
              <button
                onClick={() => handleImageClick(images, 1)}
                className="flex-1 rounded-tr-lg overflow-hidden bg-grey-100"
              >
                <Image
                  src={images[1]}
                  alt="매장 사진 2"
                  width={167}
                  height={83}
                  className="w-full h-full object-cover"
                />
              </button>
              <div className="flex gap-px">
                <button
                  onClick={() => handleImageClick(images, 2)}
                  className="flex-1 aspect-square overflow-hidden bg-grey-100"
                >
                  <Image
                    src={images[2]}
                    alt="매장 사진 3"
                    width={83}
                    height={83}
                    className="w-full h-full object-cover"
                  />
                </button>
                <button
                  onClick={() => handleImageClick(images, 3)}
                  className="flex-1 aspect-square rounded-br-lg overflow-hidden bg-grey-100"
                >
                  <Image
                    src={images[3]}
                    alt="매장 사진 4"
                    width={83}
                    height={83}
                    className="w-full h-full object-cover"
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex gap-px">
          <button
            onClick={() => handleImageClick(images, 0)}
            className="flex-1 aspect-square rounded-l-lg overflow-hidden bg-grey-100"
          >
            <Image
              src={images[0]}
              alt="매장 사진 1"
              width={167}
              height={167}
              className="w-full h-full object-cover"
            />
          </button>
          <div className="flex-1 flex flex-wrap gap-px">
            <button
              onClick={() => handleImageClick(images, 1)}
              className="w-[calc(50%-0.5px)] aspect-square overflow-hidden bg-grey-100"
            >
              <Image
                src={images[1]}
                alt="매장 사진 2"
                width={83}
                height={83}
                className="w-full h-full object-cover"
              />
            </button>
            <button
              onClick={() => handleImageClick(images, 2)}
              className="w-[calc(50%-0.5px)] aspect-square rounded-tr-lg overflow-hidden bg-grey-100"
            >
              <Image
                src={images[2]}
                alt="매장 사진 3"
                width={83}
                height={83}
                className="w-full h-full object-cover"
              />
            </button>
            <button
              onClick={() => handleImageClick(images, 3)}
              className="w-[calc(50%-0.5px)] aspect-square overflow-hidden bg-grey-100"
            >
              <Image
                src={images[3]}
                alt="매장 사진 4"
                width={83}
                height={83}
                className="w-full h-full object-cover"
              />
            </button>
            <button
              onClick={onViewAll}
              className="relative w-[calc(50%-0.5px)] aspect-square rounded-br-lg overflow-hidden bg-grey-100"
            >
              <Image
                src={images[4]}
                alt="매장 사진 5"
                width={83}
                height={83}
                className="w-full h-full object-cover"
              />
              {remainingCount > 0 && (
                <div className="absolute inset-0 bg-black/55 flex flex-col items-center justify-center rounded-br-lg">
                  <Images size={24} className="text-white" strokeWidth={1.5} />
                  <div className="flex items-center justify-center">
                    <span className="text-[12px] text-white leading-[1.5] tracking-[-0.12px]">
                      +{remainingCount}
                    </span>
                    <ChevronRight size={10} className="text-white" />
                  </div>
                </div>
              )}
            </button>
          </div>
        </div>
      )}

      {showViewAllButton && totalImageCount >= 6 && (
        <div className="mt-3">
          <button
            onClick={onViewAll}
            className="flex items-center justify-center w-full h-[46px] rounded-lg border border-grey-300"
          >
            <span className="text-[16px] font-medium text-grey-600 leading-[1.5] tracking-[-0.16px]">
              사진 전체보기
            </span>
            <Image src={ICON_IMAGES.ARROW_RIGHT} alt="" width={24} height={24} />
          </button>
        </div>
      )}
    </div>
  );
}
