"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { ThumbsUp, MoreVertical, Pencil, Trash2, Flag, Ban } from "lucide-react";
import type { ReviewResponse } from "@/types/api";
import { formatDate } from "@/utils";

interface ReviewItemProps {
  review: ReviewResponse;
  onLikeToggle: (reviewId: number) => void;
  onEdit: (reviewId: number) => void;
  onDelete: (reviewId: number) => void;
  onReport: (reviewId: number) => void;
  onReportUser: (userId: number) => void;
  onBlock: (userId: number, nickname: string) => void;
  onImageClick?: (images: string[], index: number) => void;
  isAdmin?: boolean;
  isLoggedIn?: boolean;
}

export function ReviewItem({
  review,
  onLikeToggle,
  onEdit,
  onDelete,
  onReport,
  onReportUser,
  onBlock,
  onImageClick,
  isAdmin = false,
  isLoggedIn = false,
}: ReviewItemProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // 본인 리뷰 메뉴: 수정/삭제 (비인증 상태에서 isOwner 방어)
  const isOwnerOrAdmin = (review.isOwner && isLoggedIn) || isAdmin;
  const canEdit = review.isOwner && isLoggedIn;
  const canDelete = (review.isOwner && isLoggedIn) || isAdmin;

  // 메뉴 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isMenuOpen]);

  return (
    <div className="bg-grey-50 rounded-[10px] p-[14px] flex flex-col gap-4">
      {/* 닉네임 & 메뉴 */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-[13px] text-grey-600 leading-[1.5]">{review.author.nickname}</span>
          <div className="relative" ref={menuRef}>
            {(isOwnerOrAdmin || isLoggedIn) && (
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center justify-center h-6"
                aria-label="메뉴"
              >
                <MoreVertical size={16} className="text-grey-500" />
              </button>
            )}
            {/* 드롭다운 메뉴 */}
            {isMenuOpen && (isOwnerOrAdmin || isLoggedIn) && (
              <div className="absolute right-0 top-6 z-10 bg-white rounded-lg shadow-[0px_0px_10px_0px_rgba(0,0,0,0.2)] overflow-hidden">
                {isOwnerOrAdmin ? (
                  <>
                    {canEdit && (
                      <>
                        <button
                          onClick={() => {
                            setIsMenuOpen(false);
                            onEdit(review.id);
                          }}
                          className="flex items-center gap-2 px-3 py-2 w-full hover:bg-grey-50"
                        >
                          <Pencil size={16} className="text-grey-900" />
                          <span className="text-[14px] text-grey-900 whitespace-nowrap">
                            수정하기
                          </span>
                        </button>
                        {canDelete && <div className="border-t border-grey-100" />}
                      </>
                    )}
                    {canDelete && (
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          onDelete(review.id);
                        }}
                        className="flex items-center gap-2 px-3 py-2 w-full hover:bg-grey-50"
                      >
                        <Trash2 size={16} className="text-error" />
                        <span className="text-[14px] text-error whitespace-nowrap">삭제하기</span>
                      </button>
                    )}
                  </>
                ) : isLoggedIn ? (
                  <>
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        onReport(review.id);
                      }}
                      className="flex items-center gap-2 px-3 py-2 w-full hover:bg-grey-50"
                    >
                      <Flag size={16} className="text-grey-900" />
                      <span className="text-[14px] text-grey-900 whitespace-nowrap">
                        리뷰 신고하기
                      </span>
                    </button>
                    <div className="border-t border-grey-100" />
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        onReportUser(review.author.id);
                      }}
                      className="flex items-center gap-2 px-3 py-2 w-full hover:bg-grey-50"
                    >
                      <Flag size={16} className="text-grey-900" />
                      <span className="text-[14px] text-grey-900 whitespace-nowrap">
                        사용자 신고하기
                      </span>
                    </button>
                    <div className="border-t border-grey-100" />
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        onBlock(review.author.id, review.author.nickname);
                      }}
                      className="flex items-center gap-2 px-3 py-2 w-full hover:bg-grey-50"
                    >
                      <Ban size={16} className="text-error" />
                      <span className="text-[14px] text-error whitespace-nowrap">
                        사용자 차단하기
                      </span>
                    </button>
                  </>
                ) : null}
              </div>
            )}
          </div>
        </div>

        {/* 리뷰 내용 */}
        <p className="text-[17px] text-grey-900 leading-[1.5] tracking-[-0.17px]">
          {review.content}
        </p>

        {/* 리뷰 이미지 */}
        {review.imageUrls && review.imageUrls.length > 0 && (
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {review.imageUrls.map((imageUrl, index) => (
              <button
                key={index}
                onClick={() => onImageClick?.(review.imageUrls, index)}
                className="shrink-0 w-[105px] h-[105px] rounded-lg overflow-hidden bg-grey-100"
              >
                <Image
                  src={imageUrl}
                  alt={`리뷰 이미지 ${index + 1}`}
                  width={105}
                  height={105}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 날짜 & 좋아요 */}
      <div className="flex items-center gap-[14px]">
        <span className="text-[13px] text-grey-400 leading-[1.5]">
          {formatDate(review.createdAt)}
        </span>
        <button
          onClick={() => isLoggedIn && onLikeToggle(review.id)}
          disabled={!isLoggedIn}
          className="flex items-center gap-[3px] disabled:opacity-50"
          aria-label={review.isLiked ? "좋아요 취소" : "좋아요"}
        >
          <ThumbsUp
            size={16}
            className={
              review.isLiked ? "fill-grey-800 stroke-grey-800" : "stroke-grey-500 fill-none"
            }
            strokeWidth={1.5}
          />
          <span className="text-[12px] text-grey-800 tracking-[-0.264px]">{review.likeCount}</span>
        </button>
      </div>
    </div>
  );
}
