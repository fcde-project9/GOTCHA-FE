/** @type {import('next').NextConfig} */
const nextConfig = {
  // API 프록시 설정
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_BASE_URL}/:path*`,
      },
    ];
  },

  // 이미지 최적화 도메인
  images: {
    domains: ["localhost", "your-s3-bucket.amazonaws.com"],
  },

  // 외부 스크립트 (Kakao Map SDK)
  // 실제 로딩은 app/layout.tsx의 Script 컴포넌트 사용
};

export default nextConfig;
