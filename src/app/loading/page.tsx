"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function SplashPage() {
  const router = useRouter();
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, 1200);

    const navigateTimer = setTimeout(() => {
      router.push("/login");
    }, 1800);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(navigateTimer);
    };
  }, [router]);

  return (
    <main
      className={`flex min-h-screen items-center justify-center transition-opacity duration-500 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
      style={{ backgroundColor: "#FDFEFF" }}
    >
      <h1
        className="font-koulen text-[64px] leading-[150%] tracking-[-1.408px]"
        style={{ color: "#121213" }}
      >
        GOTCHA!
      </h1>
    </main>
  );
}
