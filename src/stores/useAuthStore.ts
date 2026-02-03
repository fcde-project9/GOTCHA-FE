import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface AuthState {
  /** 로그인 상태 */
  isLoggedIn: boolean;
  /** hydration 완료 여부 (SSR 대응) */
  hasHydrated: boolean;
  /** 로그인 처리 */
  login: (accessToken: string, refreshToken: string) => void;
  /** 로그아웃 처리 */
  logout: () => void;
  /** hydration 완료 설정 */
  setHasHydrated: (hydrated: boolean) => void;
}

/**
 * 전역 인증 상태 스토어 (Zustand)
 *
 * localStorage에 토큰을 저장하고, isLoggedIn 상태를 관리합니다.
 * Provider 없이 어디서든 import하여 사용할 수 있습니다.
 *
 * @example
 * ```tsx
 * import { useAuthStore } from "@/stores";
 *
 * // 컴포넌트에서 사용
 * const { isLoggedIn, login, logout, hasHydrated } = useAuthStore();
 *
 * // hydration 대기 (SSR)
 * if (!hasHydrated) return <Loading />;
 *
 * // 로그인
 * login(accessToken, refreshToken);
 *
 * // 로그아웃
 * logout();
 * ```
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isLoggedIn: false,
      hasHydrated: false,

      login: (accessToken: string, refreshToken: string) => {
        try {
          localStorage.setItem("accessToken", accessToken);
          localStorage.setItem("refreshToken", refreshToken);
          localStorage.setItem("user_type", "member");
          set({ isLoggedIn: true });
        } catch (error) {
          console.error("토큰 저장 실패:", error);
        }
      },

      logout: () => {
        try {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("user_type");
        } catch {
          // ignore storage errors
        }
        set({ isLoggedIn: false });
      },

      setHasHydrated: (hydrated: boolean) => set({ hasHydrated: hydrated }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => {
        if (typeof window === "undefined") {
          // SSR 환경에서는 빈 스토리지 반환
          return {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
          };
        }
        return localStorage;
      }),
      // isLoggedIn만 저장 (hasHydrated는 저장하지 않음)
      partialize: (state) => ({
        isLoggedIn: state.isLoggedIn,
      }),
      onRehydrateStorage: () => (state) => {
        // hydration 완료 시 localStorage의 토큰 유무로 상태 동기화
        if (state) {
          try {
            const token = localStorage.getItem("accessToken");
            state.isLoggedIn = !!token;
          } catch {
            state.isLoggedIn = false;
          }
          state.setHasHydrated(true);
        }
      },
    }
  )
);
