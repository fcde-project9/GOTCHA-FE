"use client";

import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";

type NavItem = {
  id: string;
  label: string;
  path: string;
  activeIcon: string;
  inactiveIcon: string;
};

const navItems: NavItem[] = [
  {
    id: "home",
    label: "홈",
    path: "/home",
    activeIcon: "/images/icons/home_fill.svg",
    inactiveIcon: "/images/icons/home_blank.svg",
  },
  {
    id: "report",
    label: "제보하기",
    path: "/report",
    activeIcon: "/images/icons/report_fill.svg",
    inactiveIcon: "/images/icons/report_blank.svg",
  },
  {
    id: "favorites",
    label: "찜한업체",
    path: "/favorites",
    activeIcon: "/images/icons/favorites_fill.svg",
    inactiveIcon: "/images/icons/favorites_blank.svg",
  },
  {
    id: "mypage",
    label: "마이페이지",
    path: "/mypage",
    activeIcon: "/images/icons/mypage_fill.svg",
    inactiveIcon: "/images/icons/mypage_blank.svg",
  },
];

export default function Footer() {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (path: string) => {
    if (path === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(path);
  };

  return (
    <footer
      className="fixed bottom-0 left-0 right-0 mx-auto w-full max-w-[480px] bg-white shadow-[0px_-3px_8px_rgba(163,163,163,0.15)] z-[20]"
      style={{
        paddingBottom: "calc(env(safe-area-inset-bottom) + 8px)",
        minHeight: "calc(60px + env(safe-area-inset-bottom))",
      }}
    >
      <nav className="flex h-[60px] px-12 items-center justify-between">
        {navItems.map((item) => {
          const active = isActive(item.path);

          return (
            <button
              key={item.id}
              onClick={() => router.push(item.path)}
              className="flex flex-col items-center justify-center gap-1 min-w-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded-md"
              aria-label={item.label}
              aria-current={active ? "page" : undefined}
            >
              <Image
                src={active ? item.activeIcon : item.inactiveIcon}
                alt=""
                width={24}
                height={24}
                aria-hidden="true"
              />
              <span
                className={`text-center font-medium text-[11px] leading-[1.5] tracking-[-0.11px] ${
                  active ? "text-grey-800" : "text-grey-500"
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </footer>
  );
}
