"use client";

import { usePathname, useRouter } from "next/navigation";
import { House, Megaphone, Heart, UserRound } from "lucide-react";

interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: typeof House;
}

const navItems: NavItem[] = [
  { id: "home", label: "홈", path: "/home", icon: House },
  { id: "report", label: "제보", path: "/report", icon: Megaphone },
  { id: "favorites", label: "찜", path: "/favorites", icon: Heart },
  { id: "mypage", label: "마이", path: "/mypage", icon: UserRound },
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
    <footer className="fixed left-0 right-0 mx-auto w-full max-w-[480px] bg-white h-[70px] pb-2 shadow-[0px_-3px_8px_rgba(163,163,163,0.15)]">
      <nav className="flex h-full items-center justify-around px-9 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <button
              key={item.id}
              onClick={() => router.push(item.path)}
              className="flex flex-col items-center justify-center gap-1 min-w-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded-md"
              aria-label={item.label}
              aria-current={active ? "page" : undefined}
            >
              <Icon
                size={24}
                className={active ? "stroke-grey-800 fill-grey-800" : "stroke-grey-500 fill-none"}
                strokeWidth={active ? 2 : 1.5}
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
