import { Metadata } from "next";
import { ShopDetailResponse } from "@/types/api";

interface ShopLayoutProps {
  children: React.ReactNode;
  params: { id: string };
}

interface ParsedAddress {
  streetAddress: string;
  addressLocality: string;
  addressRegion: string;
  addressCountry: string;
}

/**
 * 한국 주소를 Schema.org PostalAddress 형식으로 파싱
 */
function parseAddress(addressName: string): ParsedAddress {
  if (!addressName || typeof addressName !== "string") {
    return {
      streetAddress: "",
      addressLocality: "",
      addressRegion: "",
      addressCountry: "KR",
    };
  }

  const trimmed = addressName.trim();
  if (!trimmed) {
    return {
      streetAddress: trimmed,
      addressLocality: "",
      addressRegion: "",
      addressCountry: "KR",
    };
  }

  // 특별자치시/도 패턴 (세종특별자치시, 제주특별자치도 등)
  const specialRegionPattern = /^(세종특별자치시|제주특별자치도)/;
  const specialMatch = trimmed.match(specialRegionPattern);

  if (specialMatch) {
    const region = specialMatch[1];
    const rest = trimmed.slice(region.length).trim();
    const restParts = rest.split(" ").filter(Boolean);

    return {
      streetAddress: trimmed,
      addressLocality: restParts[0] || "",
      addressRegion: region,
      addressCountry: "KR",
    };
  }

  // 일반 주소 파싱
  const parts = trimmed.split(" ").filter(Boolean);

  if (parts.length === 0) {
    return {
      streetAddress: trimmed,
      addressLocality: "",
      addressRegion: "",
      addressCountry: "KR",
    };
  }

  if (parts.length === 1) {
    return {
      streetAddress: trimmed,
      addressLocality: "",
      addressRegion: parts[0],
      addressCountry: "KR",
    };
  }

  const region = parts[0];
  const localityParts: string[] = [];

  for (let i = 1; i < parts.length; i++) {
    const part = parts[i];
    if (part.endsWith("구") || part.endsWith("군") || part.endsWith("시")) {
      localityParts.push(part);
    } else {
      break;
    }
  }

  return {
    streetAddress: trimmed,
    addressLocality: localityParts.join(" "),
    addressRegion: region,
    addressCountry: "KR",
  };
}

// 서버에서 가게 정보 조회
async function getShopDetail(shopId: number): Promise<ShopDetailResponse | null> {
  try {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!apiBaseUrl) return null;

    const response = await fetch(`${apiBaseUrl}/api/shops/${shopId}`, {
      next: { revalidate: 3600 },
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
  const shopId = parseInt(params.id, 10);

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
  const shopId = parseInt(params.id, 10);
  const shop = !isNaN(shopId) ? await getShopDetail(shopId) : null;

  // JSON-LD 구조화된 데이터 (LocalBusiness 스키마)
  const parsedAddress = shop ? parseAddress(shop.addressName) : null;
  const jsonLd = shop
    ? {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        name: shop.name,
        address: {
          "@type": "PostalAddress",
          ...parsedAddress,
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: shop.latitude,
          longitude: shop.longitude,
        },
        image: shop.mainImageUrl || undefined,
        // TODO: 백엔드에서 averageRating 제공 시 aggregateRating 추가
        // aggregateRating: shop.averageRating && shop.reviewCount > 0
        //   ? { "@type": "AggregateRating", ratingValue: shop.averageRating, bestRating: 5, reviewCount: shop.reviewCount }
        //   : undefined,
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
