import type { Metadata } from "next";
import Providers from "./providers";
import "./globals.css";

export const viewport = {
  width: "device-width",
  initialScale: 1,
  // maximumScale 제거 - 접근성을 위해 핀치 줌 허용
  themeColor: "#ffffff", // Safe area 배경색 흰색
};

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://gotcha.it.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "GOTCHA! - 가챠샵 지도 서비스",
    template: "%s | GOTCHA!",
  },
  description: "가챠샵을 지도 기반으로 탐색하고 매장 정보를 확인할 수 있는 모바일 웹 서비스",
  keywords: [
    // 서비스 관련
    "가챠샵",
    "가차샵",
    "가챠",
    "가차",
    "캡슐토이",
    "캡슐토이샵",
    "피규어샵",
    "가챠샵 지도",
    "가챠샵 찾기",
    "가챠샵 위치",
    "가챠샵 영업시간",
    "내 근처 가챠샵",
    "GOTCHA",
    "갓챠",
    "갓차",
    // 인기 캐릭터 - 산리오
    "산리오",
    "헬로키티",
    "마이멜로디",
    "쿠로미",
    "시나모롤",
    "폼폼푸린",
    "포차코",
    "키키라라",
    "헬로키티 가챠",
    "쿠로미 가챠",
    "시나모롤 가챠",
    // 인기 캐릭터 - 디즈니/픽사
    "디즈니",
    "디즈니 가챠",
    "토이스토리",
    "곰돌이 푸",
    "스티치",
    "미키마우스",
    "미니마우스",
    "디즈니 피규어",
    // 인기 캐릭터 - 일본 애니메이션
    "커비",
    "포켓몬",
    "포켓몬스터",
    "피카츄",
    "짱구",
    "짱구는 못말려",
    "원피스",
    "나루토",
    "스파이패밀리",
    "아냐",
    "귀멸의 칼날",
    "주술회전",
    "도라에몽",
    // 인기 캐릭터 - 한국/기타
    "카카오프렌즈",
    "라이언",
    "춘식이",
    "어피치",
    "뽀로로",
    "펭수",
    "몰랑이",
    "쿠키런",
    "브롤스타즈",
    // 브랜드/제조사
    "반다이",
    "타카라토미",
    "리멘트",
    "소니엔젤",
    "팝마트",
    "POPMART",
    "몰리",
    "디무",
    "스미코구라시",
    // 검색 키워드
    "피규어",
    "미니피규어",
    "블라인드박스",
    "랜덤박스",
    "토이샵",
    "장난감가게",
    "캐릭터샵",
    "굿즈샵",
    "덕질",
    "수집",
    "컬렉션",
  ],
  authors: [{ name: "GOTCHA Team" }],
  creator: "GOTCHA",
  publisher: "GOTCHA",
  icons: {
    icon: "/favicon.ico",
    apple: "/images/icon-512.png",
  },
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    url: siteUrl,
    title: "가챠 덕후들의 아지트 GOTCHA!",
    description: "지도 기반 가챠샵 정보 서비스",
    siteName: "GOTCHA!",
    locale: "ko_KR",
    images: [
      {
        url: "https://gotcha-prod-files.s3.ap-northeast-2.amazonaws.com/prod/defaults/og-image.png",
        width: 1200,
        height: 630,
        alt: "가챠 덕후들의 아지트 GOTCHA!",
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // google: "your-google-verification-code", // Google Search Console 인증 코드
    // naver: "your-naver-verification-code", // 네이버 웹마스터 인증 코드
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="bg-white">
      <head>
        {/* PWA - Apple 메타태그 */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="GOTCHA!" />
        {/* 폰트 CSS preload - 렌더링 차단 방지 */}
        <link rel="preload" href="/fonts/pretendard.css" as="style" />
        <link rel="stylesheet" href="/fonts/pretendard.css" />
        {/* Preconnect - 외부 리소스 연결 시간 단축 */}
        <link rel="preconnect" href="https://gotcha-prod-files.s3.ap-northeast-2.amazonaws.com" />
        <link rel="preconnect" href="https://dapi.kakao.com" />
        <link rel="preconnect" href="https://t1.daumcdn.net" crossOrigin="anonymous" />
      </head>
      <body className="w-full max-w-[480px] mx-auto bg-white">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
