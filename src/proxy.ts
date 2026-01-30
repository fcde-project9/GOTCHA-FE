import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 루트 경로(/)를 /home으로 서버 사이드 리디렉션
  // SEO: 클라이언트 JS 리디렉션 대신 서버 리디렉션으로 Google 크롤러가 올바르게 처리
  if (pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = "/home";
    return NextResponse.redirect(url, { status: 308 }); // Permanent redirect
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // 정적 파일, API, _next 제외
    "/((?!api|_next/static|_next/image|favicon.ico|images|manifest.json|sitemap.xml|robots.txt).*)",
  ],
};
