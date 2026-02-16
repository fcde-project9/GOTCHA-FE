"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/common";
import { ERROR_IMAGES } from "@/constants/images";
import { ContactSubtitle } from "./ContactSubtitle";
import { ErrorLayout } from "./ErrorLayout";

/**
 * 세션 만료 페이지 컴포넌트
 *
 * 401 토큰 만료 등 인증이 만료되었을 때 표시합니다.
 * Figma: 세션 만료 에러
 */
export function SessionExpiredPage() {
  const router = useRouter();

  return (
    <ErrorLayout
      illustration={
        <Image
          src={ERROR_IMAGES.SESSION_EXPIRED}
          alt="세션 만료"
          width={169}
          height={98}
          priority
        />
      }
      title={
        <>
          요청시간이 만료되었어요
          <br />
          다시 로그인해 주세요
        </>
      }
      subtitle={<ContactSubtitle />}
      buttons={
        <Button
          variant="primary"
          size="small"
          className="h-[46px] flex-1"
          onClick={() => router.push("/login")}
        >
          로그인 화면으로
        </Button>
      }
    />
  );
}
