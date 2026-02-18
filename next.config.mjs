/** @type {import('next').NextConfig} */

const isCapacitor = process.env.NEXT_PUBLIC_BUILD_TARGET === "capacitor";

const nextConfig = {
  // Capacitor 빌드 시 정적 내보내기
  ...(isCapacitor && {
    output: "export",
  }),

  // API 프록시 설정 (Capacitor에서는 rewrites 불가 → 직접 API URL 사용)
  ...(!isCapacitor && {
    async rewrites() {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      if (!apiBaseUrl) {
        return [];
      }
      return [
        {
          source: "/api/:path*",
          destination: `${apiBaseUrl}/:path*`,
        },
      ];
    },
  }),

  // 이미지 최적화 도메인 (Capacitor에서는 unoptimized)
  images: {
    ...(isCapacitor && { unoptimized: true }),
    remotePatterns: [
      {
        protocol: "https",
        hostname: "gotcha-storage.s3.ap-northeast-2.amazonaws.com",
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
    ],
  },

  // 외부 스크립트 (Kakao Map SDK)
  // 실제 로딩은 app/layout.tsx의 Script 컴포넌트 사용
};

export default nextConfig;
