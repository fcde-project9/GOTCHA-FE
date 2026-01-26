import { Metadata } from "next";
import { ShopDetailResponse } from "@/types/api";

interface ShopLayoutProps {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}

// 서버에서 가게 정보 조회
async function getShopDetail(shopId: number): Promise<ShopDetailResponse | null> {
  try {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!apiBaseUrl) return null;

    const response = await fetch(`${apiBaseUrl}/api/shops/${shopId}`, {
      next: { revalidate: 3600 }, // 1시간 캐시
    });

    if (!response.ok) return null;

    const data = await response.json();
    return data.success ? data.data : null;
  } catch {
    return null;
  }
}

// 동적 메타데이터 생성
export async function generateMetadata({ params }: ShopLayoutProps): Promise<Metadata> {
  const { id } = await params;
  const shopId = parseInt(id, 10);

  if (isNaN(shopId)) {
    return { title: "가게를 찾을 수 없음" };
  }

  const shop = await getShopDetail(shopId);

  if (!shop) {
    return { title: "가게를 찾을 수 없음" };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://gotcha.it.com";
  const title = `${shop.name} - 위치, 영업시간, 리뷰`;
  const description = `${shop.addressName}${shop.locationHint ? ` ${shop.locationHint}` : ""}. ${shop.openStatus}. 리뷰 ${shop.reviewCount}개.`;

  return {
    title,
    description,
    openGraph: {
      title: `${shop.name} | GOTCHA!`,
      description,
      url: `${siteUrl}/shop/${shopId}`,
      images: shop.mainImageUrl
        ? [{ url: shop.mainImageUrl, width: 800, height: 600, alt: shop.name }]
        : undefined,
      type: "website",
      locale: "ko_KR",
    },
    alternates: {
      canonical: `/shop/${shopId}`,
    },
  };
}

export default async function ShopLayout({ children, params }: ShopLayoutProps) {
  const { id } = await params;
  const shopId = parseInt(id, 10);
  const shop = !isNaN(shopId) ? await getShopDetail(shopId) : null;

  // JSON-LD 구조화된 데이터 (LocalBusiness 스키마)
  const jsonLd = shop
    ? {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        name: shop.name,
        address: {
          "@type": "PostalAddress",
          streetAddress: shop.addressName,
          addressLocality: shop.addressName.split(" ")[1] || "", // 구/군
          addressRegion: shop.addressName.split(" ")[0] || "", // 시/도
          addressCountry: "KR",
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: shop.latitude,
          longitude: shop.longitude,
        },
        image: shop.mainImageUrl || undefined,
        aggregateRating:
          shop.reviewCount > 0
            ? {
                "@type": "AggregateRating",
                reviewCount: shop.reviewCount,
              }
            : undefined,
        ...(shop.locationHint && { description: shop.locationHint }),
      }
    : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      {children}
    </>
  );
}
