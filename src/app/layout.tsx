import Script from "next/script";
import type { Metadata } from "next";
import Providers from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://gotcha.it.com"),
  title: "GOTCHA! - 가챠샵 지도 서비스",
  description: "가챠샵을 지도 기반으로 탐색하고 매장 정보를 확인할 수 있는 모바일 웹 서비스",
  keywords: ["가챠샵", "가챠", "지도", "매장찾기", "GOTCHA"],
  openGraph: {
    title: "GOTCHA! - 가챠샵 지도 서비스",
    description: "가까운 가챠샵을 찾아보세요",
    type: "website",
    url: "https://gotcha.it.com",
    siteName: "GOTCHA!",
    locale: "ko_KR",
  },
  twitter: {
    card: "summary_large_image",
    title: "GOTCHA! - 가챠샵 지도 서비스",
    description: "가까운 가챠샵을 찾아보세요",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        {/* Kakao Map SDK */}
        <Script
          src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_KEY}&libraries=services,clusterer&autoload=false`}
          strategy="beforeInteractive"
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
