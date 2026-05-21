import { Suspense } from "react";
import PostDetailClient from "./PostDetailClient";

// 정적 내보내기: 최소 1개의 경로를 생성해야 output: "export" 체크를 통과
// 실제 게시글 상세는 클라이언트 사이드에서 params(postId)를 읽어 동적 처리
export function generateStaticParams() {
  return [{ postId: "0" }];
}

export default function PostDetailPage({ params }: { params: Promise<{ postId: string }> }) {
  return (
    <Suspense>
      <PostDetailClient params={params} />
    </Suspense>
  );
}
