import type { Metadata } from "next";
import { Koulen } from "next/font/google";
import Script from "next/script";
import Providers from "./providers";
import "./globals.css";

const koulen = Koulen({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-koulen",
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://gotcha.it.com"),
  title: "GOTCHA! - 가챠샵 지도 서비스",
  description: "가챠샵을 지도 기반으로 탐색하고 매장 정보를 확인할 수 있는 모바일 웹 서비스",
  keywords: ["가챠샵", "가챠", "지도", "매장찾기", "GOTCHA"],
  icons: {
    icon: "/favicon.ico",
  },
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
        <Script
          src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js"
          integrity="sha384-TiCUE00h649CAMonG018J2ujOgDKW/kVWlChEuu4jK2vxfAAD0eZxzCKakxg55G4"
          crossOrigin="anonymous"
          strategy="beforeInteractive"
        />
      </head>
      <body className={`w-full max-w-[480px] mx-auto ${koulen.variable}`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
