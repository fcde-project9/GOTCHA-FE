import type { AxiosRequestConfig } from "axios";
import apiClient from "./client";
import type { ApiResponse } from "./types";
import { extractApiError } from "./types";

type HttpMethod = "get" | "post" | "put" | "patch" | "delete";

interface RequestOptions<T> {
  /** 에러 발생 시 표시할 기본 메시지 */
  errorMessage?: string;
  /** 401 에러 시 null 반환 여부 (비로그인 허용 API용) */
  allowUnauthorized?: boolean;
  /** 응답 데이터 변환 함수 */
  transform?: (data: T) => T;
  /** Query parameters (POST/PUT/PATCH/DELETE용) */
  params?: Record<string, unknown>;
  /** 커스텀 헤더 (FormData 등) */
  headers?: Record<string, unknown>;
}

/**
 * API 요청 래퍼 함수
 *
 * 공통 로직을 캡슐화하여 중복 코드를 제거합니다:
 * - ApiResponse<T> 형식 검증
 * - success/data 필드 체크
 * - 에러 메시지 추출 및 throw
 *
 * @example
 * // 기본 사용
 * const data = await request<ShopDetail>("get", "/api/shops/1");
 *
 * // 에러 메시지 커스텀
 * const data = await request<Shop[]>("get", "/api/shops", {
 *   errorMessage: "매장 목록을 불러오는데 실패했어요."
 * });
 *
 * // 비로그인 허용 (401 시 null 반환)
 * const data = await request<User>("get", "/api/users/me", {
 *   allowUnauthorized: true
 * });
 */
export async function request<T>(
  method: HttpMethod,
  url: string,
  options?: RequestOptions<T>
): Promise<T>;

export async function request<T>(
  method: HttpMethod,
  url: string,
  data: unknown,
  options?: RequestOptions<T>
): Promise<T>;

export async function request<T>(
  method: HttpMethod,
  url: string,
  dataOrOptions?: unknown | RequestOptions<T>,
  maybeOptions?: RequestOptions<T>
): Promise<T> {
  // 인자 파싱: data와 options 구분
  let requestData: unknown = undefined;
  let options: RequestOptions<T> = {};

  if (maybeOptions !== undefined) {
    // 4개 인자: request(method, url, data, options)
    requestData = dataOrOptions;
    options = maybeOptions;
  } else if (dataOrOptions !== undefined) {
    // 3개 인자: data인지 options인지 판단
    if (
      typeof dataOrOptions === "object" &&
      dataOrOptions !== null &&
      ("errorMessage" in dataOrOptions ||
        "allowUnauthorized" in dataOrOptions ||
        "transform" in dataOrOptions)
    ) {
      options = dataOrOptions as RequestOptions<T>;
    } else {
      requestData = dataOrOptions;
    }
  }

  const {
    errorMessage = "요청에 실패했어요.",
    allowUnauthorized = false,
    transform,
    params,
    headers,
  } = options;

  try {
    let response;

    // HTTP 메서드별 요청
    if (method === "get") {
      // GET은 params로 전달
      const config: AxiosRequestConfig = requestData ? { params: requestData } : {};
      response = await apiClient.get<ApiResponse<T>>(url, config);
    } else if (method === "delete") {
      // DELETE는 body(data) + params 지원
      const config: AxiosRequestConfig = {};
      if (requestData) config.data = requestData;
      if (params) config.params = params;
      if (headers) config.headers = headers as AxiosRequestConfig["headers"];
      response = await apiClient.delete<ApiResponse<T>>(url, config);
    } else {
      // POST, PUT, PATCH는 body + params + headers 지원
      const config: AxiosRequestConfig = {};
      if (params) config.params = params;
      if (headers) config.headers = headers as AxiosRequestConfig["headers"];
      response = await apiClient[method]<ApiResponse<T>>(url, requestData, config);
    }

    // success 플래그 검증
    if (!response.data.success) {
      throw new Error(response.data.error?.message || errorMessage);
    }

    // data 필드 검증 (success: true이지만 data가 없는 경우)
    if (response.data.data === undefined) {
      throw new Error(errorMessage);
    }

    // 변환 함수가 있으면 적용
    return transform ? transform(response.data.data) : response.data.data;
  } catch (error: unknown) {
    // 401 Unauthorized 처리 (비로그인 허용 API)
    if (allowUnauthorized) {
      const axiosError = error as { response?: { status?: number } };
      if (axiosError?.response?.status === 401) {
        return null as T;
      }
    }

    // API 에러 메시지 추출
    const apiError = extractApiError(error);
    if (apiError) {
      throw new Error(apiError.message);
    }

    // 이미 Error 객체면 그대로 throw
    if (error instanceof Error) {
      throw error;
    }

    // 그 외 에러
    throw new Error(errorMessage);
  }
}

/**
 * GET 요청 헬퍼
 *
 * @example
 * const shop = await get<ShopDetail>("/api/shops/1");
 * const shops = await get<Shop[]>("/api/shops", { params: { page: 1 } });
 */
export async function get<T>(
  url: string,
  params?: Record<string, unknown>,
  options?: RequestOptions<T>
): Promise<T> {
  return request<T>("get", url, params, options);
}

/**
 * POST 요청 헬퍼
 *
 * @example
 * const result = await post<Review>("/api/reviews", { content: "좋아요" });
 */
export async function post<T>(
  url: string,
  data?: unknown,
  options?: RequestOptions<T>
): Promise<T> {
  return request<T>("post", url, data, options);
}

/**
 * PUT 요청 헬퍼
 */
export async function put<T>(url: string, data?: unknown, options?: RequestOptions<T>): Promise<T> {
  return request<T>("put", url, data, options);
}

/**
 * PATCH 요청 헬퍼
 */
export async function patch<T>(
  url: string,
  data?: unknown,
  options?: RequestOptions<T>
): Promise<T> {
  return request<T>("patch", url, data, options);
}

/**
 * DELETE 요청 헬퍼
 *
 * @example
 * // 기본 DELETE
 * await del("/api/shops/1/favorite");
 *
 * // body가 필요한 DELETE (회원탈퇴 등)
 * await del("/api/users/withdraw", { reasons: ["reason1"] }, { errorMessage: "..." });
 */
export async function del<T>(
  url: string,
  data?: unknown | RequestOptions<T>,
  options?: RequestOptions<T>
): Promise<T> {
  // 2개 인자일 때: del(url, options)
  if (options === undefined && isRequestOptions(data)) {
    return request<T>("delete", url, data as RequestOptions<T>);
  }
  // 3개 인자일 때: del(url, data, options)
  return request<T>("delete", url, data, options);
}

/**
 * RequestOptions 타입 가드
 */
function isRequestOptions<T>(obj: unknown): obj is RequestOptions<T> {
  if (typeof obj !== "object" || obj === null) return false;
  const keys = Object.keys(obj);
  const optionKeys = ["errorMessage", "allowUnauthorized", "transform", "params", "headers"];
  return keys.length === 0 || keys.some((key) => optionKeys.includes(key));
}
