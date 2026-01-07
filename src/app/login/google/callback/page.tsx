"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function GoogleCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get("code");

    if (!code) {
      alert("잘못된 접근입니다.");
      router.push("/login");
      return;
    }

    // 백엔드로 code 전송하여 액세스 토큰 교환
    handleGoogleAuth(code);
  }, [searchParams, router]);

  const handleGoogleAuth = async (code: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/google/callback`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ code }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("token", data.token);
        router.push("/map");
      } else {
        throw new Error("인증 실패");
      }
    } catch (error) {
      console.error("구글 인증 처리 실패", error);
      alert("로그인 처리 중 오류가 발생했습니다.");
      router.push("/login");
    }
  };

  return (
    <main
      className="flex min-h-screen items-center justify-center"
      style={{ backgroundColor: "#FDFEFF" }}
    >
      <div className="text-center">
        <p className="text-lg">로그인 처리 중...</p>
      </div>
    </main>
  );
}
