/**
 * API 공통 타입 정의
 * 백엔드 응답 형식과 일치하도록 정의
 */

/**
 * API 에러 타입
 * 백엔드에서 code와 message를 함께 반환
 */
export interface ApiError {
  code: string;
  message: string;
}

/**
 * API 공통 응답 타입
 * @template T - 응답 데이터 타입
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

/**
 * API 에러에서 사용자 메시지 추출
 * 백엔드 메시지를 우선 사용하고, 없으면 폴백 메시지 반환
 * @param error - ApiError 객체 또는 unknown 에러
 * @param fallback - 기본 메시지
 */
export function getErrorMessage(error: unknown, fallback = "오류가 발생했어요."): string {
  // ApiError 형태인 경우
  if (error && typeof error === "object" && "message" in error) {
    return (error as ApiError).message || fallback;
  }
  // Error 객체인 경우
  if (error instanceof Error) {
    return error.message || fallback;
  }
  return fallback;
}

/**
 * Axios 에러에서 API 응답 추출
 * @param error - Axios 에러 객체
 */
export function extractApiError(error: unknown): ApiError | null {
  const axiosError = error as {
    response?: { data?: { error?: ApiError } };
  };
  return axiosError?.response?.data?.error ?? null;
}

/**
 * 소셜 로그인 타입
 */
export type SocialType = "KAKAO" | "GOOGLE" | "NAVER";

/**
 * 사용자 정보 타입
 * 백엔드 /api/users/me 응답 형식
 */
export interface User {
  id: number;
  nickname: string;
  email: string;
  profileImageUrl: string | null;
  socialType: SocialType;
}

/**
 * 파일 업로드 응답 타입
 * 백엔드 /api/files/upload 응답 형식
 */
export interface FileUploadResponse {
  fileUrl: string;
  originalFilename: string;
  fileSize: number;
  contentType: string;
}

/**
 * 가게 생성 요청 타입
 * 백엔드 POST /api/shops/save 요청 형식
 */
export interface CreateShopRequest {
  name: string;
  addressName?: string; // 주소 (선택)
  mainImageUrl?: string;
  locationHint?: string;
  openTime?: Record<string, string>; // {"Mon": "10:00-22:00", "Tue": "10:00-22:00", ...} (영업하는 날만 포함)
}

/**
 * 좌표 요청 타입
 */
export interface CoordinateRequest {
  latitude: number;
  longitude: number;
}

/**
 * 가게 응답 타입
 */
export interface ShopResponse {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  addressName: string;
  mainImageUrl: string | null;
  locationHint: string | null;
  openTime: Record<string, string> | null; // {"mon": "10:00-22:00", ...}
  isOpen: boolean;
}

/**
 * 근처 가게 응답 타입
 */
export interface NearbyShopResponse {
  name: string;
  mainImageUrl: string | null;
}

/**
 * 근처 가게 목록 응답 타입
 */
export interface NearbyShopsResponse {
  count: number;
  shops: NearbyShopResponse[];
}
