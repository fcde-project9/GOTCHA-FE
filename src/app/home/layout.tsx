import { Metadata } from "next";

export const metadata: Metadata = {
  title: "가챠 덕후들의 아지트 GOTCHA!",
  description: "지도 기반 가챠샵 정보 서비스",
  alternates: {
    canonical: "/home",
  },
};

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
