/**
 * 날짜 포맷팅 유틸
 */

/**
 * 날짜 문자열을 YYYY.MM.DD 형식으로 포맷팅
 * @param dateStr - ISO 날짜 문자열
 * @returns 포맷팅된 날짜 문자열 (예: 2024.01.15)
 */
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}`;
}
