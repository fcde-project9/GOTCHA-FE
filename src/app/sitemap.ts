import { MetadataRoute } from "next";

// 전체 가게 목록 조회 (sitemap용)
async function getAllShops(): Promise<{ id: number; updatedAt?: string }[]> {
  try {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!apiBaseUrl) return [];

    // TODO: 백엔드에서 전체 가게 목록 API 제공 시 활성화
    // GET /api/shops/all 또는 GET /api/shops?all=true
    // const response = await fetch(`${apiBaseUrl}/api/shops/all`, {
    //   next: { revalidate: 86400 }, // 24시간 캐시
    // });
    // if (!response.ok) return [];
    // const data = await response.json();
    // return data.success ? data.data : [];

    return [];
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://gotcha.it.com";
  const currentDate = new Date();

  // 정적 페이지 목록
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${siteUrl}/home`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/login`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${siteUrl}/favorites`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 0.7,
    },
    {
      url: `${siteUrl}/mypage`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${siteUrl}/report`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${siteUrl}/terms`,
      lastModified: currentDate,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${siteUrl}/mypage/terms`,
      lastModified: currentDate,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${siteUrl}/mypage/terms/service`,
      lastModified: currentDate,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${siteUrl}/mypage/terms/license`,
      lastModified: currentDate,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${siteUrl}/mypage/about`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.4,
    },
  ];

  // 동적 페이지 - 가게 상세 페이지
  const shops = await getAllShops();
  const shopPages: MetadataRoute.Sitemap = shops.map((shop) => ({
    url: `${siteUrl}/shop/${shop.id}`,
    lastModified: shop.updatedAt ? new Date(shop.updatedAt) : currentDate,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticPages, ...shopPages];
}
