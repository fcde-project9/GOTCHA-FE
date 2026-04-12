"use client";

import { useMemo, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCcw, PenLine } from "lucide-react";
import { usePosts } from "@/api/queries/usePosts";
import { Footer, SimpleHeader, Spinner } from "@/components/common";
import { PostItem } from "@/components/features/community";

const CATEGORIES = [
  { label: "전체", typeId: undefined },
  { label: "갓챠일상", typeId: 1 },
  { label: "궁금해요", typeId: 2 },
  { label: "거래해요", typeId: 3 },
] as const;

export default function CommunityPage() {
  const router = useRouter();
  const [selectedTypeId, setSelectedTypeId] = useState<number | undefined>(undefined);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, error, refetch, hasNextPage, fetchNextPage, isFetchingNextPage } =
    usePosts(selectedTypeId);

  const allPosts = useMemo(() => data?.pages.flatMap((page) => page?.content ?? []) ?? [], [data]);

  // 무한 스크롤 Intersection Observer
  useEffect(() => {
    if (isLoading || isFetchingNextPage || !hasNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [isLoading, isFetchingNextPage, hasNextPage, fetchNextPage]);

  return (
    <>
      <main className="h-[calc(100dvh-env(safe-area-inset-top,0px)-var(--footer-height))] w-full max-w-[480px] mx-auto bg-default flex flex-col overflow-hidden">
        <SimpleHeader title="커뮤니티" />

        {/* 카테고리 탭 */}
        <div className="flex shrink-0 border-b border-grey-100">
          {CATEGORIES.map((category) => {
            const isActive = selectedTypeId === category.typeId;
            return (
              <button
                key={category.label}
                onClick={() => setSelectedTypeId(category.typeId)}
                className={`flex-1 py-3 text-[14px] font-medium leading-[1.5] tracking-[-0.14px] transition-colors ${
                  isActive
                    ? "text-grey-900 border-b-2 border-grey-900"
                    : "text-grey-400 border-b-2 border-transparent"
                }`}
              >
                {category.label}
              </button>
            );
          })}
        </div>

        {/* 컨텐츠 영역 */}
        {isLoading ? (
          <div className="flex flex-1 items-center justify-center">
            <Spinner />
          </div>
        ) : error ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-5">
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
        ) : allPosts.length === 0 ? (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-center text-[16px] font-normal leading-[1.5] tracking-[-0.16px] text-grey-600">
              아직 게시글이 없어요
            </p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            {allPosts.map((post) => (
              <PostItem
                key={post.id}
                post={post}
                onClick={(id) => router.push(`/community/${id}`)}
              />
            ))}

            {/* 무한 스크롤 트리거 */}
            {hasNextPage && (
              <div ref={loadMoreRef} className="flex justify-center py-4">
                {isFetchingNextPage && <Spinner />}
              </div>
            )}
          </div>
        )}
      </main>

      {/* 글쓰기 플로팅 버튼 */}
      <button
        onClick={() => router.push("/community/write")}
        className="fixed bottom-[calc(var(--footer-height)+16px)] right-4 flex items-center gap-1.5 bg-grey-900 text-white rounded-full px-4 py-2.5 shadow-lg z-10"
        aria-label="게시글 작성"
      >
        <PenLine size={16} className="stroke-white" strokeWidth={2} />
        <span className="text-[14px] font-medium leading-[1.5] tracking-[-0.14px]">글쓰기</span>
      </button>

      <Footer />
    </>
  );
}
