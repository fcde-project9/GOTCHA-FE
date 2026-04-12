"use client";

import Image from "next/image";
import { Heart, MessageCircle } from "lucide-react";
import { DEFAULT_IMAGES } from "@/constants";
import type { Post } from "@/types/api";

interface PostItemProps {
  post: Post;
  onClick?: (postId: number) => void;
}

export function PostItem({ post, onClick }: PostItemProps) {
  return (
    <button
      type="button"
      className="flex flex-col gap-3 px-5 py-4 border-b border-grey-100 cursor-pointer active:bg-grey-50 w-full text-left"
      onClick={() => onClick?.(post.id)}
    >
      {/* 작성자 정보 */}
      <div className="flex items-center gap-2">
        <div className="relative w-8 h-8 rounded-full overflow-hidden shrink-0">
          <Image
            src={post.authorProfileImageUrl || DEFAULT_IMAGES.PROFILE}
            alt={post.authorNickname}
            fill
            sizes="32px"
            className="object-cover"
          />
        </div>
        <div className="flex flex-col">
          <span className="text-[13px] font-semibold leading-[1.4] tracking-[-0.13px] text-grey-900">
            {post.authorNickname}
          </span>
          <span className="text-[11px] font-normal leading-[1.5] tracking-[-0.11px] text-grey-400">
            {post.timeAgo}
          </span>
        </div>
        <span className="ml-auto text-[11px] font-medium leading-[1.5] tracking-[-0.11px] text-main bg-main-50 px-2 py-0.5 rounded-full">
          {post.typeName}
        </span>
      </div>

      {/* 게시글 내용 */}
      <p className="text-[15px] font-normal leading-[1.6] tracking-[-0.15px] text-grey-800 whitespace-pre-wrap">
        {post.content}
      </p>

      {/* 게시글 이미지 */}
      {post.imageUrls.length > 0 && (
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {post.imageUrls.map((url, index) => (
            <div
              key={index}
              className="relative shrink-0 w-[120px] h-[120px] rounded-[8px] overflow-hidden"
            >
              <Image
                src={url}
                alt={`게시글 이미지 ${index + 1}`}
                fill
                sizes="120px"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      )}

      {/* 추천 / 댓글 */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1">
          <Heart size={16} className="stroke-grey-400" strokeWidth={2} />
          <span className="text-[13px] font-normal leading-[1.5] tracking-[-0.13px] text-grey-400">
            {post.likeCount}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <MessageCircle size={16} className="stroke-grey-400" strokeWidth={2} />
          <span className="text-[13px] font-normal leading-[1.5] tracking-[-0.13px] text-grey-400">
            {post.commentCount}
          </span>
        </div>
      </div>
    </button>
  );
}
