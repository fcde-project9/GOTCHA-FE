"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { X, Camera, ImageIcon } from "lucide-react";
import { useCreateReview } from "@/api/mutations/useCreateReview";
import { useUploadFile } from "@/api/mutations/useUploadFile";
import { useToast } from "@/hooks";

const MAX_IMAGES = 10;
const MAX_CONTENT_LENGTH = 150;
const MIN_CONTENT_LENGTH = 10;

interface ReviewWriteModalProps {
  shopId: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

/**
 * 리뷰 작성 모달 (바텀시트 형식)
 */
export function ReviewWriteModal({ shopId, isOpen, onClose, onSuccess }: ReviewWriteModalProps) {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const [content, setContent] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]); // 업로드된 이미지 URL들
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]); // 로컬 미리보기 URL들
  const [isUploading, setIsUploading] = useState(false);

  // 파일 업로드 mutation hook
  const uploadFileMutation = useUploadFile("reviews");

  // 리뷰 작성 mutation hook
  const createReviewMutation = useCreateReview(shopId);

  // 모달이 열릴 때 body 스크롤 방지
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // 모달이 닫힐 때 상태 초기화
  const handleClose = () => {
    // 미리보기 URL 해제
    imagePreviewUrls.forEach((url) => URL.revokeObjectURL(url));
    setContent("");
    setImageUrls([]);
    setImagePreviewUrls([]);
    onClose();
  };

  // 이미지 선택 및 업로드 (카메라/갤러리 공통)
  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const remainingSlots = MAX_IMAGES - imageUrls.length;
    const newFiles = Array.from(files).slice(0, remainingSlots);

    // 파일 크기 검증 (20MB)
    const MAX_FILE_SIZE = 20 * 1024 * 1024;
    const validFiles = newFiles.filter((file) => {
      if (file.size > MAX_FILE_SIZE) {
        showToast(`${file.name}은(는) 20MB를 초과합니다.`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) {
      e.target.value = "";
      return;
    }

    // 미리보기 URL 생성
    const newPreviewUrls = validFiles.map((file) => URL.createObjectURL(file));
    setImagePreviewUrls((prev) => [...prev, ...newPreviewUrls]);

    // 이미지 업로드
    setIsUploading(true);
    try {
      const uploadPromises = validFiles.map((file) => uploadFileMutation.mutateAsync(file));
      const results = await Promise.all(uploadPromises);
      const uploadedUrls = results.map((result) => result.fileUrl);
      setImageUrls((prev) => [...prev, ...uploadedUrls]);
    } catch {
      // 업로드 실패 시 미리보기 URL 제거
      newPreviewUrls.forEach((url) => URL.revokeObjectURL(url));
      setImagePreviewUrls((prev) => prev.slice(0, prev.length - newPreviewUrls.length));
      showToast("이미지 업로드에 실패했습니다.");
    } finally {
      setIsUploading(false);
    }

    // input 초기화 (같은 파일 다시 선택 가능하도록)
    e.target.value = "";
  };

  // 이미지 삭제
  const handleImageRemove = (index: number) => {
    // 미리보기 URL 해제
    URL.revokeObjectURL(imagePreviewUrls[index]);

    setImageUrls((prev) => prev.filter((_, i) => i !== index));
    setImagePreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  // 리뷰 작성 제출
  const handleSubmit = () => {
    if (content.trim().length < MIN_CONTENT_LENGTH) {
      showToast(`리뷰는 ${MIN_CONTENT_LENGTH}자 이상 작성해주세요.`);
      return;
    }

    createReviewMutation.mutate(
      {
        content: content.trim(),
        imageUrls,
      },
      {
        onSuccess: () => {
          showToast("리뷰가 등록되었습니다.");
          handleClose();
          onSuccess?.();
        },
        onError: (error) => {
          showToast(error.message || "리뷰 등록에 실패했습니다.");
        },
      }
    );
  };

  const isValid = content.trim().length >= MIN_CONTENT_LENGTH;
  const isProcessing = createReviewMutation.isPending || isUploading;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      {/* 오버레이 */}
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />

      {/* 모달 컨텐츠 */}
      <div className="relative bg-white rounded-t-[20px] max-h-[580px] flex flex-col animate-slide-up">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-5 py-5">
          {/* X 버튼 */}
          <button
            onClick={handleClose}
            disabled={isProcessing}
            className="w-6 h-6 flex items-center justify-center disabled:opacity-50"
            aria-label="닫기"
          >
            <X size={24} className="stroke-grey-900" strokeWidth={2} />
          </button>

          {/* 타이틀 */}
          <div className="flex items-center gap-2">
            <span className="text-[20px] font-semibold leading-[1.5] tracking-[-0.2px] text-grey-900 ml-[30px]">
              리뷰 작성
            </span>
          </div>

          {/* 등록 버튼 */}
          <button
            onClick={handleSubmit}
            disabled={!isValid || isProcessing}
            className={`text-[16px] font-medium px-4 py-1.5 rounded-full ${
              isValid && !isProcessing ? "text-white bg-main" : "text-grey-500 bg-grey-200"
            } disabled:opacity-50`}
          >
            {isUploading ? "업로드 중..." : "등록"}
          </button>
        </div>

        {/* 텍스트 입력 영역 */}
        <div className="px-5 pb-4">
          <div className="border border-[#CFCFD1] rounded-[10px] p-3 flex flex-col gap-3">
            <textarea
              value={content}
              onChange={(e) => {
                if (e.target.value.length <= MAX_CONTENT_LENGTH) {
                  setContent(e.target.value);
                }
              }}
              placeholder="10자 이상의 리뷰를 작성해주세요"
              disabled={isProcessing}
              className="w-full h-[88px] text-[14px] leading-[1.5] tracking-[-0.14px] text-grey-900 placeholder:text-grey-400 resize-none focus:outline-none disabled:opacity-50"
            />
            <div className="flex justify-end text-[13px] tracking-[-0.286px]">
              <span className="text-main">{content.length}</span>
              <span className="text-[#8A8A8B]"> /{MAX_CONTENT_LENGTH}</span>
            </div>
          </div>
        </div>

        {/* 이미지 미리보기 */}
        {imagePreviewUrls.length > 0 && (
          <div className="px-5 py-3 border-t border-grey-100">
            <div className="flex gap-3 overflow-x-auto pt-2 pr-3 last:pr-0">
              {imagePreviewUrls.map((url, index) => (
                <div key={index} className="shrink-0 relative w-16 h-16">
                  <Image
                    src={url}
                    alt={`업로드 이미지 ${index + 1}`}
                    fill
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

        {/* 하단 툴바 */}
        <div className="flex items-center gap-4 px-5 py-3 border-t border-grey-100 pb-safe">
          {/* 카메라 버튼 */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing || imageUrls.length >= MAX_IMAGES}
            className="w-10 h-10 flex items-center justify-center disabled:opacity-50"
            aria-label="카메라로 촬영"
          >
            <Camera size={24} className="stroke-grey-600" strokeWidth={1.5} />
          </button>

          {/* 갤러리 버튼 */}
          <button
            type="button"
            onClick={() => galleryInputRef.current?.click()}
            disabled={isProcessing || imageUrls.length >= MAX_IMAGES}
            className="w-10 h-10 flex items-center justify-center disabled:opacity-50"
            aria-label="갤러리에서 선택"
          >
            <ImageIcon size={24} className="stroke-grey-600" strokeWidth={1.5} />
          </button>

          {/* 파일 input (카메라) */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            capture="environment"
            onChange={handleImageSelect}
            className="hidden"
          />

          {/* 파일 input (갤러리) */}
          <input
            ref={galleryInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            multiple
            onChange={handleImageSelect}
            className="hidden"
          />
        </div>
      </div>
    </div>
  );
}
