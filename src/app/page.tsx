import { PageWithLoading } from "@/components/common";
import { KakaoMap } from "@/components/features/map";

export default function Home() {
  return (
    <PageWithLoading>
      <main>
        <div className="flex min-h-screen flex-col items-center gap-8">
          {/* 카카오맵 */}
          <div className="w-full">
            <KakaoMap width="100%" height="570px" />
          </div>

          <div className="text-center text-sm text-gray-600">
            <p>가까운 가챠샵을 지도에서 확인하세요</p>
          </div>
        </div>
      </main>
    </PageWithLoading>
  );
}
