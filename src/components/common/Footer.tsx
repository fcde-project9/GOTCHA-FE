"use client";

import { usePathname, useRouter } from "next/navigation";
import { House, MessageSquare, Heart, UserRound } from "lucide-react";

interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: typeof House;
}

const navItems: NavItem[] = [
  { id: "home", label: "홈", path: "/", icon: House },
  { id: "report", label: "제보", path: "/report", icon: MessageSquare },
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
    <footer
      className="fixed left-0 right-0 mx-auto w-full max-w-[480px] bg-white"
      style={{
        boxShadow: "0px -3px 8px rgba(163, 163, 163, 0.15)",
        height: "56px",
        bottom: "calc(14px + env(safe-area-inset-bottom))",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      <nav className="flex h-full items-center justify-around px-9 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <button
              key={item.id}
              onClick={() => router.push(item.path)}
              className="flex flex-col items-center justify-center gap-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded-md"
              style={{ minWidth: "44px" }}
              aria-label={item.label}
              aria-current={active ? "page" : undefined}
            >
              <Icon
                size={24}
                stroke={active ? "#323233" : "#8A8A8B"}
                fill={active ? "#323233" : "none"}
                strokeWidth={active ? 2 : 1.5}
                aria-hidden="true"
              />
              <span
                className="text-center font-medium"
                style={{
                  fontSize: "11px",
                  lineHeight: "1.5",
                  letterSpacing: "-0.11px",
                  color: active ? "#323233" : "#8A8A8B",
                }}
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
