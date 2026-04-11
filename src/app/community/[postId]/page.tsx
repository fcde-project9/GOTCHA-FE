"use client";

import { useState, useRef, useEffect, use } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Heart, MessageCircle, RefreshCcw, CornerDownRight, Trash2 } from "lucide-react";
import { useCreateComment } from "@/api/mutations/useCreateComment";
import { useDeleteComment } from "@/api/mutations/useDeleteComment";
import { useDeletePost } from "@/api/mutations/useDeletePost";
import { useToggleCommentLike } from "@/api/mutations/useToggleCommentLike";
import { useTogglePostLike } from "@/api/mutations/useTogglePostLike";
import { usePostDetail } from "@/api/queries/usePostDetail";
import { SimpleHeader, Spinner } from "@/components/common";
import { DEFAULT_IMAGES } from "@/constants";
import { useToast } from "@/hooks";
import type { PostComment, CommentReply } from "@/types/api";

function formatDate(iso: string) {
  const date = new Date(iso);
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}`;
}

interface ReplyTarget {
  commentId: number;
  authorNickname: string;
}

function CommentItem({
  comment,
  onReply,
  onLike,
  onDelete,
}: {
  comment: PostComment;
  onReply: (target: ReplyTarget) => void;
  onLike: (commentId: number, isCurrentlyLiked: boolean) => void;
  onDelete: (commentId: number) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      {/* 댓글 */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-semibold leading-[1.4] tracking-[-0.13px] text-grey-900">
            {comment.isAnonymous ? "익명" : comment.authorNickname}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-normal leading-[1.5] tracking-[-0.11px] text-grey-400">
              {formatDate(comment.createdAt)}
            </span>
            {comment.isOwner && (
              <button
                onClick={() => onDelete(comment.id)}
                className="flex items-center justify-center"
                aria-label="댓글 삭제"
              >
                <Trash2 size={14} className="stroke-grey-400" strokeWidth={2} />
              </button>
            )}
          </div>
        </div>
        <p className="text-[14px] font-normal leading-[1.6] tracking-[-0.14px] text-grey-800 whitespace-pre-wrap">
          {comment.content}
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onLike(comment.id, comment.isLiked)}
            className="flex items-center gap-1"
            aria-label={comment.isLiked ? "좋아요 취소" : "좋아요"}
          >
            <Heart
              size={14}
              className={comment.isLiked ? "fill-main stroke-main" : "stroke-grey-400"}
              strokeWidth={2}
            />
            <span className="text-[12px] font-normal text-grey-400">{comment.likeCount}</span>
          </button>
          <button
            onClick={() =>
              onReply({ commentId: comment.id, authorNickname: comment.authorNickname })
            }
            className="text-[12px] font-medium text-grey-500"
          >
            답글
          </button>
        </div>
      </div>

      {/* 대댓글 */}
      {comment.replies?.length > 0 && (
        <div className="flex flex-col gap-3 pl-4 border-l-2 border-grey-100">
          {comment.replies.map((reply) => (
            <ReplyItem key={reply.id} reply={reply} onLike={onLike} onDelete={onDelete} />
          ))}
        </div>
      )}
    </div>
  );
}

function ReplyItem({
  reply,
  onLike,
  onDelete,
}: {
  reply: CommentReply;
  onLike: (commentId: number, isCurrentlyLiked: boolean) => void;
  onDelete: (commentId: number) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <CornerDownRight size={12} className="stroke-grey-400" strokeWidth={2} />
          <span className="text-[13px] font-semibold leading-[1.4] tracking-[-0.13px] text-grey-900">
            {reply.isAnonymous ? "익명" : reply.authorNickname}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-normal leading-[1.5] tracking-[-0.11px] text-grey-400">
            {formatDate(reply.createdAt)}
          </span>
          {reply.isOwner && (
            <button
              onClick={() => onDelete(reply.id)}
              className="flex items-center justify-center"
              aria-label="대댓글 삭제"
            >
              <Trash2 size={14} className="stroke-grey-400" strokeWidth={2} />
            </button>
          )}
        </div>
      </div>
      <p className="text-[14px] font-normal leading-[1.6] tracking-[-0.14px] text-grey-800 whitespace-pre-wrap">
        {reply.content}
      </p>
      <button
        onClick={() => onLike(reply.id, reply.isLiked)}
        className="flex items-center gap-1 w-fit"
        aria-label={reply.isLiked ? "좋아요 취소" : "좋아요"}
      >
        <Heart
          size={14}
          className={reply.isLiked ? "fill-main stroke-main" : "stroke-grey-400"}
          strokeWidth={2}
        />
        <span className="text-[12px] font-normal text-grey-400">{reply.likeCount}</span>
      </button>
    </div>
  );
}

export default function PostDetailPage({ params }: { params: Promise<{ postId: string }> }) {
  const { postId } = use(params);
  const postIdNum = Number(postId);
  const router = useRouter();
  const { showToast } = useToast();

  const { data: post, isLoading, error, refetch } = usePostDetail(postIdNum);
  const createCommentMutation = useCreateComment(postIdNum);
  const deletePostMutation = useDeletePost(postIdNum);
  const deleteCommentMutation = useDeleteComment(postIdNum);
  const togglePostLike = useTogglePostLike(postIdNum);
  const toggleCommentLike = useToggleCommentLike(postIdNum);

  const [commentText, setCommentText] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [replyTarget, setReplyTarget] = useState<ReplyTarget | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (replyTarget) inputRef.current?.focus();
  }, [replyTarget]);

  const handlePostLike = () => {
    if (!post) return;
    togglePostLike.mutate(post.isLiked, {
      onError: () => showToast("좋아요 처리에 실패했어요.", { variant: "warning" }),
    });
  };

  const handleCommentLike = (commentId: number, isCurrentlyLiked: boolean) => {
    toggleCommentLike.mutate(
      { commentId, isCurrentlyLiked },
      {
        onError: () => showToast("좋아요 처리에 실패했어요.", { variant: "warning" }),
      }
    );
  };

  const handleDeletePost = () => {
    if (!window.confirm("게시글을 삭제할까요?")) return;
    deletePostMutation.mutate(undefined, {
      onSuccess: () => {
        showToast("게시글이 삭제되었어요.");
        router.back();
      },
      onError: (error) => {
        showToast(error.message || "게시글 삭제에 실패했어요.", { variant: "warning" });
      },
    });
  };

  const handleDeleteComment = (commentId: number) => {
    if (!window.confirm("댓글을 삭제할까요?")) return;
    deleteCommentMutation.mutate(commentId, {
      onError: (error) => {
        showToast(error.message || "댓글 삭제에 실패했어요.", { variant: "warning" });
      },
    });
  };

  const handleSubmitComment = () => {
    if (!commentText.trim()) return;

    createCommentMutation.mutate(
      { parentId: replyTarget?.commentId ?? null, content: commentText.trim(), isAnonymous },
      {
        onSuccess: () => {
          setCommentText("");
          setReplyTarget(null);
          setIsAnonymous(false);
        },
        onError: (error) => {
          showToast(error.message || "댓글 등록에 실패했어요.", { variant: "warning" });
        },
      }
    );
  };

  return (
    <main className="h-[100dvh] w-full max-w-[480px] mx-auto bg-white flex flex-col">
      <SimpleHeader title={post?.typeName ?? "게시글"} />

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Spinner />
          </div>
        ) : error || !post ? (
          <div className="flex flex-col items-center justify-center gap-4 h-full px-5">
            <p className="text-center text-[16px] font-normal leading-[1.5] tracking-[-0.16px] text-grey-600">
              {error instanceof Error ? error.message : "게시글을 불러올 수 없어요."}
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              className="rounded-lg bg-grey-900 w-[174px] h-[46px] flex items-center justify-center gap-1"
            >
              <span className="text-[16px] text-white font-normal leading-[1.5] tracking-[-0.16px]">
                다시 시도
              </span>
              <RefreshCcw size={16} className="stroke-white" strokeWidth={2} />
            </button>
          </div>
        ) : (
          <>
            {/* 게시글 본문 */}
            <div className="flex flex-col gap-4 px-5 py-5">
              <div className="flex items-center gap-2">
                <div className="relative w-9 h-9 rounded-full overflow-hidden shrink-0">
                  <Image
                    src={DEFAULT_IMAGES.PROFILE}
                    alt={post.authorNickname}
                    fill
                    sizes="36px"
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-[14px] font-semibold leading-[1.4] tracking-[-0.14px] text-grey-900">
                    {post.authorNickname}
                  </span>
                  <span className="text-[12px] font-normal leading-[1.5] tracking-[-0.12px] text-grey-400">
                    {formatDate(post.createdAt)}
                  </span>
                </div>
                <div className="ml-auto flex items-center gap-2">
                  <span className="text-[11px] font-medium leading-[1.5] tracking-[-0.11px] text-main bg-main-50 px-2 py-0.5 rounded-full">
                    {post.typeName}
                  </span>
                  {post.isOwner && (
                    <button
                      onClick={handleDeletePost}
                      disabled={deletePostMutation.isPending}
                      className="flex items-center justify-center disabled:opacity-50"
                      aria-label="게시글 삭제"
                    >
                      <Trash2 size={16} className="stroke-grey-400" strokeWidth={2} />
                    </button>
                  )}
                </div>
              </div>

              <h1 className="text-[18px] font-semibold leading-[1.4] tracking-[-0.18px] text-grey-900">
                {post.title}
              </h1>

              <p className="text-[15px] font-normal leading-[1.6] tracking-[-0.15px] text-grey-800 whitespace-pre-wrap">
                {post.content}
              </p>

              {post.imageUrls.length > 0 && (
                <div className="flex flex-col gap-2">
                  {post.imageUrls.map((url, index) => (
                    <div
                      key={index}
                      className="relative w-full rounded-[8px] overflow-hidden"
                      style={{ aspectRatio: "4/3" }}
                    >
                      <Image
                        src={url}
                        alt={`게시글 이미지 ${index + 1}`}
                        fill
                        sizes="(max-width: 480px) 100vw"
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* 게시글 좋아요 / 댓글 수 */}
              <div className="flex items-center gap-4">
                <button
                  onClick={handlePostLike}
                  className="flex items-center gap-1"
                  aria-label={post.isLiked ? "좋아요 취소" : "좋아요"}
                >
                  <Heart
                    size={18}
                    className={post.isLiked ? "fill-main stroke-main" : "stroke-grey-400"}
                    strokeWidth={2}
                  />
                  <span className="text-[14px] font-normal leading-[1.5] tracking-[-0.14px] text-grey-500">
                    {post.likeCount}
                  </span>
                </button>
                <div className="flex items-center gap-1">
                  <MessageCircle size={18} className="stroke-grey-400" strokeWidth={2} />
                  <span className="text-[14px] font-normal leading-[1.5] tracking-[-0.14px] text-grey-500">
                    {post.comments.length}
                  </span>
                </div>
              </div>
            </div>

            {/* 댓글 섹션 */}
            <div className="border-t border-grey-100">
              <div className="px-5 py-3">
                <span className="text-[14px] font-semibold leading-[1.5] tracking-[-0.14px] text-grey-900">
                  댓글 {post.comments.length}
                </span>
              </div>

              {post.comments.length === 0 ? (
                <div className="flex items-center justify-center py-10">
                  <p className="text-[14px] font-normal text-grey-400">첫 댓글을 작성해보세요</p>
                </div>
              ) : (
                <div className="flex flex-col gap-5 px-5 pb-5">
                  {post.comments.map((comment) => (
                    <CommentItem
                      key={comment.id}
                      comment={comment}
                      onReply={setReplyTarget}
                      onLike={handleCommentLike}
                      onDelete={handleDeleteComment}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* 댓글 입력 바 */}
      <div className="border-t border-grey-100 bg-white pb-[env(safe-area-inset-bottom,0px)]">
        {replyTarget && (
          <div className="flex items-center justify-between px-4 py-2 bg-grey-50">
            <span className="text-[12px] text-grey-600">
              <span className="font-semibold">{replyTarget.authorNickname}</span>님에게 답글 작성 중
            </span>
            <button onClick={() => setReplyTarget(null)} className="text-[12px] text-grey-400">
              취소
            </button>
          </div>
        )}

        <div className="flex items-center gap-2 px-4 py-3">
          <label className="flex items-center gap-1 shrink-0 cursor-pointer">
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="w-4 h-4 accent-grey-900"
            />
            <span className="text-[12px] font-normal text-grey-500">익명</span>
          </label>

          <div className="flex flex-1 items-center gap-2 bg-grey-50 rounded-full px-4 py-2">
            <input
              ref={inputRef}
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmitComment();
                }
              }}
              placeholder={replyTarget ? "답글을 입력해주세요" : "댓글을 입력해주세요"}
              disabled={createCommentMutation.isPending}
              className="flex-1 bg-transparent text-[14px] font-normal leading-[1.5] tracking-[-0.14px] text-grey-900 placeholder:text-grey-400 focus:outline-none disabled:opacity-50"
            />
            <button
              onClick={handleSubmitComment}
              disabled={!commentText.trim() || createCommentMutation.isPending}
              className="shrink-0 text-[13px] font-semibold text-main disabled:text-grey-300"
            >
              등록
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
