import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://gotcha.it.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/", // API 경로 차단
          "/oauth/", // OAuth 콜백 차단
          "/button-test/", // 테스트 페이지 차단
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
