"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { X, ImageIcon, Camera, ChevronDown } from "lucide-react";
import { useCreatePost } from "@/api/mutations/useCreatePost";
import { useUploadFile } from "@/api/mutations/useUploadFile";
import { SimpleHeader } from "@/components/common";
import { useToast } from "@/hooks";
import { compressShopImage } from "@/utils";
import { isNativeApp } from "@/utils/platform";

const MAX_IMAGES = 10;
const MAX_FILE_SIZE = 20 * 1024 * 1024;

const POST_TYPES = [
  { typeId: 1, label: "갓챠일상" },
  { typeId: 2, label: "궁금해요" },
  { typeId: 3, label: "거래해요" },
] as const;

export default function CommunityWritePage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [typeId, setTypeId] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const previewUrlsRef = useRef<string[]>([]);

  useEffect(() => {
    previewUrlsRef.current = imagePreviewUrls;
  }, [imagePreviewUrls]);

  useEffect(() => {
    return () => {
      previewUrlsRef.current.forEach((url) => {
        if (url.startsWith("blob:")) URL.revokeObjectURL(url);
      });
    };
  }, []);

  const createPostMutation = useCreatePost();
  const uploadFileMutation = useUploadFile("posts");

  const isProcessing = createPostMutation.isPending || isUploading;
  const isValid = typeId !== null && title.trim().length > 0 && content.trim().length > 0;

  const selectedType = POST_TYPES.find((t) => t.typeId === typeId);

  const uploadFiles = useCallback(
    async (files: File[]) => {
      const remainingSlots = MAX_IMAGES - imageUrls.length;
      const newFiles = files.slice(0, remainingSlots);

      const validFiles = newFiles.filter((file) => {
        if (file.size > MAX_FILE_SIZE) {
          showToast("파일이 20MB를 초과해요. 파일 크기를 줄여주세요.", { variant: "warning" });
          return false;
        }
        return true;
      });

      if (validFiles.length === 0) return;

      const newPreviewUrls = validFiles.map((file) => URL.createObjectURL(file));
      setImagePreviewUrls((prev) => [...prev, ...newPreviewUrls]);

      setIsUploading(true);
      try {
        const compressedFiles = await Promise.all(
          validFiles.map((file) => compressShopImage(file))
        );
        const results = await Promise.allSettled(
          compressedFiles.map((file) => uploadFileMutation.mutateAsync(file))
        );

        const fulfilledUrls: string[] = [];
        const failedPreviewUrls: string[] = [];

        results.forEach((result, index) => {
          if (result.status === "fulfilled") {
            fulfilledUrls.push(result.value.fileUrl);
          } else {
            failedPreviewUrls.push(newPreviewUrls[index]);
          }
        });

        if (fulfilledUrls.length > 0) {
          setImageUrls((prev) => [...prev, ...fulfilledUrls]);
        }

        if (failedPreviewUrls.length > 0) {
          failedPreviewUrls.forEach((url) => URL.revokeObjectURL(url));
          setImagePreviewUrls((prev) => prev.filter((url) => !failedPreviewUrls.includes(url)));
          showToast(`${failedPreviewUrls.length}개 이미지 업로드에 실패했어요.`, {
            variant: "warning",
          });
        }
      } catch {
        newPreviewUrls.forEach((url) => URL.revokeObjectURL(url));
        setImagePreviewUrls((prev) => prev.slice(0, prev.length - newPreviewUrls.length));
        showToast("이미지 업로드에 실패했어요.", { variant: "warning" });
      } finally {
        setIsUploading(false);
      }
    },
    [imageUrls.length, showToast, uploadFileMutation]
  );

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    await uploadFiles(Array.from(files));
    e.target.value = "";
  };

  const handleNativeGallerySelect = useCallback(async () => {
    try {
      const { Camera: CapCamera } = await import("@capacitor/camera");
      const result = await CapCamera.pickImages({
        quality: 90,
        limit: MAX_IMAGES - imageUrls.length,
      });
      const files = await Promise.all(
        result.photos
          .filter((photo) => photo.webPath)
          .map(async (photo) => {
            const response = await fetch(photo.webPath!);
            const blob = await response.blob();
            return new File([blob], `photo_${Date.now()}.${photo.format || "jpeg"}`, {
              type: `image/${photo.format || "jpeg"}`,
            });
          })
      );
      await uploadFiles(files);
    } catch (error: unknown) {
      if (error instanceof Error && error.message?.includes("cancel")) return;
      showToast("갤러리를 열 수 없어요.", { variant: "warning" });
    }
  }, [imageUrls.length, uploadFiles, showToast]);

  const handleImageRemove = (index: number) => {
    const urlToRemove = imagePreviewUrls[index];
    if (urlToRemove.startsWith("blob:")) URL.revokeObjectURL(urlToRemove);
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
    setImagePreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!isValid || typeId === null) return;

    createPostMutation.mutate(
      { typeId, title: title.trim(), content: content.trim(), imageUrls },
      {
        onSuccess: () => {
          showToast("게시글이 등록되었어요!");
          router.replace("/community");
        },
        onError: (error) => {
          showToast(error.message || "게시글 등록에 실패했어요.", { variant: "warning" });
        },
      }
    );
  };

  return (
    <main className="h-[100dvh] w-full max-w-[480px] mx-auto bg-white flex flex-col">
      {/* 헤더 */}
      <SimpleHeader
        title="게시글 작성"
        rightElement={
          <button
            onClick={handleSubmit}
            disabled={!isValid || isProcessing}
            className={`text-[16px] font-medium px-4 py-1.5 rounded-full ${
              isValid && !isProcessing ? "text-white bg-main" : "text-grey-500 bg-grey-200"
            }`}
          >
            {isUploading ? "업로드 중..." : "등록"}
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto flex flex-col">
        {/* 주제 드롭다운 */}
        <div className="px-5 pt-5 pb-4 border-b border-grey-100">
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              className={`w-full flex items-center justify-between px-4 py-3 border rounded-[10px] ${
                isDropdownOpen ? "border-grey-900" : "border-grey-200"
              }`}
            >
              <span
                className={`text-[16px] leading-[1.5] tracking-[-0.16px] ${
                  selectedType ? "text-grey-900 font-medium" : "text-grey-400 font-normal"
                }`}
              >
                {selectedType ? selectedType.label : "게시글 주제를 선택해주세요 (필수)"}
              </span>
              <ChevronDown
                size={20}
                className={`stroke-grey-500 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
                strokeWidth={2}
              />
            </button>

            {isDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-grey-200 rounded-[10px] shadow-md z-10 overflow-hidden">
                {POST_TYPES.map((type) => (
                  <button
                    key={type.typeId}
                    type="button"
                    onClick={() => {
                      setTypeId(type.typeId);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 text-[16px] leading-[1.5] tracking-[-0.16px] hover:bg-grey-50 transition-colors ${
                      typeId === type.typeId ? "text-main font-medium" : "text-grey-900 font-normal"
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 제목 */}
        <div className="px-5 py-4 border-b border-grey-100">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="제목을 입력해주세요"
            disabled={isProcessing}
            className="w-full text-[17px] font-normal leading-[1.5] tracking-[-0.17px] text-grey-900 placeholder:text-grey-400 focus:outline-none disabled:opacity-50"
          />
        </div>

        {/* 내용 */}
        <div className="px-5 py-4 flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="내용을 입력해주세요"
            disabled={isProcessing}
            className="w-full h-full min-h-[200px] text-[16px] font-normal leading-[1.6] tracking-[-0.16px] text-grey-900 placeholder:text-grey-400 resize-none focus:outline-none disabled:opacity-50"
          />
        </div>

        {/* 이미지 미리보기 */}
        {imagePreviewUrls.length > 0 && (
          <div className="px-5 pb-4">
            <div className="flex gap-3 overflow-x-auto">
              {imagePreviewUrls.map((url, index) => (
                <div key={index} className="shrink-0 relative w-16 h-16">
                  <Image
                    src={url}
                    alt={`업로드 이미지 ${index + 1}`}
                    fill
                    sizes="64px"
                    className="rounded-lg object-cover"
                  />
                  {!isProcessing && (
                    <button
                      type="button"
                      onClick={() => handleImageRemove(index)}
                      className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-grey-900 flex items-center justify-center z-10"
                      aria-label={`이미지 ${index + 1} 삭제`}
                    >
                      <X size={12} className="text-white" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 하단 툴바 */}
      <div className="flex items-center gap-5 px-5 pt-3 pb-[calc(12px+env(safe-area-inset-bottom,0px))] border-t border-grey-100">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isProcessing || imageUrls.length >= MAX_IMAGES}
          className="flex items-center justify-center disabled:opacity-50"
          aria-label="카메라로 촬영"
        >
          <Camera size={24} className="stroke-grey-800" strokeWidth={1.5} />
        </button>

        <button
          type="button"
          onClick={
            isNativeApp() ? handleNativeGallerySelect : () => galleryInputRef.current?.click()
          }
          disabled={isProcessing || imageUrls.length >= MAX_IMAGES}
          className="flex items-center justify-center disabled:opacity-50"
          aria-label="갤러리에서 선택"
        >
          <ImageIcon size={24} className="stroke-grey-800" strokeWidth={1.5} />
        </button>

        {imageUrls.length > 0 && (
          <span className="text-[13px] text-grey-400 ml-auto">
            {imageUrls.length}/{MAX_IMAGES}
          </span>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp,image/heic,image/heif"
          capture="environment"
          onChange={handleImageSelect}
          className="hidden"
        />
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp,image/heic,image/heif"
          multiple
          onChange={handleImageSelect}
          className="hidden"
        />
      </div>
    </main>
  );
}
