"use client";

import Image from "next/image";
import { Button } from "@/components/common";
import { ERROR_IMAGES } from "@/constants/images";
import { ErrorLayout } from "./ErrorLayout";

interface NetworkErrorPageProps {
  onRetry?: () => void;
}

/**
 * 네트워크 에러 페이지 컴포넌트
 *
 * 오프라인 상태 또는 네트워크 연결 실패 시 표시되는 에러 페이지입니다.
 * 서비스 워커가 네비게이션 실패 시 이 페이지를 보여주며,
 * URL은 원래 요청한 경로 그대로이므로 reload()로 재시도합니다.
 * Figma: 에러_네트워크 에러 7-002
 */
export function NetworkErrorPage({ onRetry }: NetworkErrorPageProps) {
  const handleRetry = onRetry ?? (() => window.location.reload());

  return (
    <ErrorLayout
      illustration={
        <Image src={ERROR_IMAGES.OFFLINE} alt="오프라인 상태" width={80} height={81} priority />
      }
      title="오프라인 상태에요"
      subtitle="인터넷 연결을 확인해주세요"
      buttons={
        <Button variant="primary" size="small" className="h-[46px] flex-1" onClick={handleRetry}>
          다시 시도
        </Button>
      }
    />
  );
}
