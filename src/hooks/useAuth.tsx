"use client";

import { useAuthStore } from "@/stores";

interface AuthContextValue {
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
  checkAuth: () => boolean;
}

/**
 * 전역 인증 상태 훅
 *
 * Zustand 스토어(useAuthStore)를 래핑하여 기존 인터페이스를 유지합니다.
 * Provider 없이 어디서든 사용 가능합니다.
 *
 * @example
 * ```tsx
 * const { isLoggedIn, isLoading, login, logout } = useAuth();
 *
 * if (isLoading) return <Loading />;
 *
 * if (!isLoggedIn) {
 *   return <LoginPrompt />;
 * }
 *
 * // 로그인 후 처리
 * login(accessToken, refreshToken);
 *
 * // 로그아웃
 * logout();
 * ```
 */
export function useAuth(): AuthContextValue {
  const { isLoggedIn, hasHydrated, login, logout } = useAuthStore();

  // checkAuth: localStorage에서 토큰 확인 (동기적)
  const checkAuth = (): boolean => {
    try {
      const token = localStorage.getItem("accessToken");
      return !!token;
    } catch {
      return false;
    }
  };

  return {
    isLoggedIn,
    isLoading: !hasHydrated, // hydration 완료 전까지 로딩 상태
    login,
    logout,
    checkAuth,
  };
}

/**
 * @deprecated AuthProvider는 더 이상 필요하지 않습니다.
 * Zustand 스토어로 마이그레이션되어 Provider 없이 useAuth()를 사용할 수 있습니다.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
