"use client";

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";

interface AuthContextValue {
  isLoggedIn: boolean;
  isLoading: boolean; // 초기 로딩 상태 (localStorage 확인 전)
  login: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
  checkAuth: () => boolean; // 현재 로그인 상태 확인
}

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * 전역 인증 상태 Provider
 * localStorage의 accessToken 유무로 로그인 상태를 판단합니다.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 초기 마운트 시 localStorage 확인
  useEffect(() => {
    try {
      const token = localStorage.getItem("accessToken");
      setIsLoggedIn(!!token);
    } catch {
      // Private Browsing 등 localStorage 접근 불가 시
      setIsLoggedIn(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 로그인 처리
  const login = useCallback((accessToken: string, refreshToken: string) => {
    try {
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("user_type", "member");
      setIsLoggedIn(true);
    } catch (error) {
      console.error("토큰 저장 실패:", error);
    }
  }, []);

  // 로그아웃 처리
  const logout = useCallback(() => {
    try {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user_type");
    } catch {
      // ignore storage errors
    }
    setIsLoggedIn(false);
  }, []);

  // 현재 로그인 상태 확인 (동기적)
  const checkAuth = useCallback((): boolean => {
    try {
      const token = localStorage.getItem("accessToken");
      const loggedIn = !!token;
      setIsLoggedIn(loggedIn);
      return loggedIn;
    } catch {
      setIsLoggedIn(false);
      return false;
    }
  }, []);

  return (
    <AuthContext.Provider value={{ isLoggedIn, isLoading, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * 전역 인증 상태 훅
 * AuthProvider 내부에서만 사용 가능합니다.
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
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
