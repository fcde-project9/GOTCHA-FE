"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/common";
import { ERROR_IMAGES } from "@/constants/images";
import { ContactSubtitle } from "./ContactSubtitle";
import { ErrorLayout } from "./ErrorLayout";

interface ErrorPageProps {
  onRetry?: () => void;
}

/**
 * 알 수 없는 오류 페이지 컴포넌트
 *
 * 예상치 못한 클라이언트/서버 에러 발생 시 표시합니다.
 * Figma: 시스템 에러
 */
export function ErrorPage({ onRetry }: ErrorPageProps) {
  const router = useRouter();
  const handleRetry = onRetry ?? (() => window.location.reload());

  return (
    <ErrorLayout
      illustration={
        <Image src={ERROR_IMAGES.UNKNOWN} alt="알 수 없는 오류" width={169} height={98} priority />
      }
      title="알 수 없는 오류가 발생했어요"
      subtitle={<ContactSubtitle />}
      buttons={
        <>
          <Button variant="tertiary" size="small" className="h-11 flex-1" onClick={handleRetry}>
            다시 시도
          </Button>
          <Button
            variant="primary"
            size="small"
            className="h-11 flex-1"
            onClick={() => router.push("/home")}
          >
            홈으로
          </Button>
        </>
      }
    />
  );
}
