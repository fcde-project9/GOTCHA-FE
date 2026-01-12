"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { Camera, X } from "lucide-react";
import { useCreateReviewWithUpload } from "@/api/mutations/useCreateReviewWithUpload";
import { Button, BackHeader } from "@/components/common";

const MAX_IMAGES = 10;
const MAX_CONTENT_LENGTH = 500;

// shopId 파싱 및 검증
function parseShopId(id: string | string[] | undefined): number | null {
  if (typeof id !== "string") return null;
  const parsed = Number(id);
  if (Number.isNaN(parsed) || !Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }
  return parsed;
}

export default function ReviewWritePage() {
  const params = useParams();
  const router = useRouter();
  const shopId = parseShopId(params.id);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [content, setContent] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);

  const isValidShopId = shopId !== null;
  const validShopId = shopId ?? 0;

  // 리뷰 작성 mutation hook
  const createReviewMutation = useCreateReviewWithUpload(validShopId, (progress) => {
    setUploadProgress(`이미지 업로드 중... (${progress.uploaded}/${progress.total})`);
  });

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
  const handleSubmit = () => {
    if (!content.trim()) {
      alert("리뷰 내용을 입력해주세요.");
      return;
    }

    setUploadProgress(images.length > 0 ? "이미지 업로드 준비 중..." : null);

    createReviewMutation.mutate(
      {
        content: content.trim(),
        images,
      },
      {
        onSuccess: () => {
          setUploadProgress(null);
          alert("리뷰가 등록되었습니다.");
          router.back();
        },
        onError: (error) => {
          setUploadProgress(null);
          alert(error.message || "리뷰 등록에 실패했습니다. 다시 시도해주세요.");
        },
      }
    );
  };

  // 유효하지 않은 shopId 처리
  if (!isValidShopId) {
    return (
      <div className="min-h-dvh bg-default flex flex-col">
        <BackHeader showBorder />
        <div className="flex-1 flex flex-col items-center justify-center px-5">
          <p className="text-[15px] text-grey-500 mb-4">잘못된 접근입니다</p>
          <Button variant="primary" size="small" onClick={() => router.push("/")}>
            홈으로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  const isValid = content.trim().length > 0;
  const isProcessing = createReviewMutation.isPending;

  return (
    <div className="min-h-dvh bg-default flex flex-col">
      {/* 헤더 */}
      <BackHeader showBorder />

      {/* 컨텐츠 */}
      <div className="flex-1 px-5 py-4">
        {/* 에러 메시지 */}
        {createReviewMutation.isError && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-[14px]">
            {createReviewMutation.error?.message || "리뷰 등록에 실패했습니다."}
          </div>
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
                type="button"
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
                    type="button"
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
          {uploadProgress || "리뷰 등록하기"}
        </Button>
      </div>
    </div>
  );
}
