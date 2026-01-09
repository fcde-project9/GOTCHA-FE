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
export function getErrorMessage(error: unknown, fallback = "오류가 발생했습니다."): string {
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
