"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { Camera, X } from "lucide-react";
import { uploadImages, createReview } from "@/api/queries/reviewApi";
import { Button, BackHeader } from "@/components/common";

const MAX_IMAGES = 10;
const MAX_CONTENT_LENGTH = 500;

export default function ReviewWritePage() {
  const params = useParams();
  const router = useRouter();
  const shopId = Number(params.id);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [content, setContent] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 이미지 선택
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const remainingSlots = MAX_IMAGES - images.length;
    const newFiles = Array.from(files).slice(0, remainingSlots);

    // 파일 크기 검증 (20MB)
    const MAX_FILE_SIZE = 20 * 1024 * 1024;
    const validFiles = newFiles.filter((file) => {
      if (file.size > MAX_FILE_SIZE) {
        alert(`${file.name}은(는) 20MB를 초과합니다.`);
        return false;
      }
      return true;
    });

    // 미리보기 URL 생성
    const newPreviewUrls = validFiles.map((file) => URL.createObjectURL(file));

    setImages((prev) => [...prev, ...validFiles]);
    setImagePreviewUrls((prev) => [...prev, ...newPreviewUrls]);

    // input 초기화 (같은 파일 다시 선택 가능하도록)
    e.target.value = "";
  };

  // 이미지 삭제
  const handleImageRemove = (index: number) => {
    // 미리보기 URL 해제
    URL.revokeObjectURL(imagePreviewUrls[index]);

    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  // 리뷰 작성 제출
  const handleSubmit = async () => {
    if (!content.trim()) {
      alert("리뷰 내용을 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // 1. 이미지 업로드
      let imageUrls: string[] = [];
      if (images.length > 0) {
        setIsUploading(true);
        imageUrls = await uploadImages(images, "reviews");
        setIsUploading(false);
      }

      // 2. 리뷰 작성 API 호출
      const response = await createReview(shopId, {
        content: content.trim(),
        imageUrls,
      });

      if (response.success) {
        // TODO: 토스트 메시지로 변경
        alert("리뷰가 등록되었습니다.");
        router.back();
      } else {
        setError("리뷰 등록에 실패했습니다.");
      }
    } catch (err) {
      console.error("리뷰 등록 실패:", err);
      setError("리뷰 등록에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
    }
  };

  const isValid = content.trim().length > 0;
  const isProcessing = isSubmitting || isUploading;

  return (
    <div className="min-h-dvh bg-default flex flex-col">
      {/* 헤더 */}
      <BackHeader showBorder />

      {/* 컨텐츠 */}
      <div className="flex-1 px-5 py-4">
        {/* 에러 메시지 */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-[14px]">{error}</div>
        )}

        {/* 이미지 업로드 */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[14px] font-medium text-grey-900">사진 첨부</h3>
            <span className="text-[13px] text-grey-500">
              {images.length}/{MAX_IMAGES}
            </span>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2">
            {/* 이미지 추가 버튼 */}
            {images.length < MAX_IMAGES && (
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
                className="shrink-0 w-20 h-20 rounded-lg border-2 border-dashed border-grey-200 flex flex-col items-center justify-center gap-1 bg-grey-50 disabled:opacity-50"
              >
                <Camera size={24} className="text-grey-400" />
                <span className="text-[11px] text-grey-400">추가</span>
              </button>
            )}

            {/* 이미지 미리보기 */}
            {imagePreviewUrls.map((url, index) => (
              <div key={index} className="shrink-0 relative w-20 h-20">
                <Image
                  src={url}
                  alt={`업로드 이미지 ${index + 1}`}
                  fill
                  className="rounded-lg object-cover"
                />
                {!isProcessing && (
                  <button
                    onClick={() => handleImageRemove(index)}
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-grey-900 flex items-center justify-center"
                    aria-label={`이미지 ${index + 1} 삭제`}
                  >
                    <X size={14} className="text-white" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <p className="mt-2 text-[12px] text-grey-400">jpg, jpeg, png, webp 형식 / 최대 20MB</p>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            multiple
            onChange={handleImageSelect}
            className="hidden"
          />
        </div>

        {/* 리뷰 내용 */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[14px] font-medium text-grey-900">리뷰 내용</h3>
            <span className="text-[13px] text-grey-500">
              {content.length}/{MAX_CONTENT_LENGTH}
            </span>
          </div>

          <textarea
            value={content}
            onChange={(e) => {
              if (e.target.value.length <= MAX_CONTENT_LENGTH) {
                setContent(e.target.value);
              }
            }}
            placeholder="방문 경험을 자유롭게 공유해주세요."
            disabled={isProcessing}
            className="w-full h-40 p-4 rounded-xl bg-grey-50 border border-grey-100 text-[15px] text-grey-900 placeholder:text-grey-400 resize-none focus:outline-none focus:border-main disabled:opacity-50"
          />
        </div>
      </div>

      {/* 하단 버튼 */}
      <div className="sticky bottom-0 px-5 py-4 bg-default border-t border-grey-100 pb-safe">
        <Button
          variant="primary"
          size="large"
          fullWidth
          disabled={!isValid || isProcessing}
          loading={isProcessing}
          onClick={handleSubmit}
        >
          {isUploading ? "이미지 업로드 중..." : "리뷰 등록하기"}
        </Button>
      </div>
    </div>
  );
}
