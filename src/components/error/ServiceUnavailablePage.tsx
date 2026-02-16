"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/common";
import { ERROR_IMAGES } from "@/constants/images";
import { ContactSubtitle } from "./ContactSubtitle";
import { ErrorLayout } from "./ErrorLayout";

/**
 * 서비스 일시적 이용불가 페이지 컴포넌트
 *
 * 5xx 서버 에러 등 서비스를 일시적으로 이용할 수 없을 때 표시합니다.
 * Figma: 서버 에러
 */
export function ServiceUnavailablePage() {
  const router = useRouter();

  return (
    <ErrorLayout
      illustration={
        <Image
          src={ERROR_IMAGES.SERVICE_UNAVAILABLE}
          alt="SORRY"
          width={202}
          height={31}
          priority
        />
      }
      title={
        <>
          서비스를 일시적으로 이용할 수 없어요
          <br />
          잠시 후 다시 시도해 주세요
        </>
      }
      subtitle={<ContactSubtitle />}
      buttons={
        <>
          <Button
            variant="tertiary"
            size="small"
            className="h-11 flex-1"
            onClick={() => router.back()}
          >
            이전 페이지
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
