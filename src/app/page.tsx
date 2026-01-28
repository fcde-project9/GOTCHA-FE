import { redirect } from "next/navigation";

/**
 * 루트 페이지 - /home으로 서버 사이드 리디렉션
 *
 * SEO 최적화:
 * - 클라이언트 JS 리디렉션 대신 서버 리디렉션 사용
 * - Google 크롤러가 올바르게 색인할 수 있도록 함
 * - middleware.ts에서도 처리하지만 fallback으로 유지
 *
 * 스플래시 화면:
 * - 기존 스플래시 애니메이션이 필요한 경우 /home 페이지에서 처리
 */
export default function RootPage() {
  redirect("/home");
}
