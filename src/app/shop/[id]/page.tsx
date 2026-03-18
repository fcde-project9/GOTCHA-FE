import { Suspense } from "react";
import ShopDetailClient from "./ShopDetailClient";

// 정적 내보내기: 최소 1개의 경로를 생성해야 output: "export" 체크를 통과
// 실제 매장 페이지는 클라이언트 사이드에서 useParams()로 ID를 읽어 동적 처리
export function generateStaticParams() {
  return [{ id: "0" }];
}

export default function ShopDetailPage() {
  return (
    <Suspense>
      <ShopDetailClient />
    </Suspense>
  );
}
