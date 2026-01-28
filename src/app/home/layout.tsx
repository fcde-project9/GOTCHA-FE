import { Metadata } from "next";

export const metadata: Metadata = {
  title: "홈 - 내 주변 가챠샵 찾기",
  description:
    "지도에서 내 주변 가챠샵을 찾아보세요. 가챠샵 위치, 영업시간, 리뷰 정보를 한눈에 확인할 수 있습니다.",
  openGraph: {
    title: "GOTCHA! - 내 주변 가챠샵 찾기",
    description: "지도에서 내 주변 가챠샵을 찾아보세요.",
  },
  alternates: {
    canonical: "/home",
  },
};

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
