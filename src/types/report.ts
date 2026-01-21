/**
 * 영업시간 입력 항목
 */
export interface OperatingHoursEntry {
  id: string;
  days: number[];
  openTime: string;
  closeTime: string;
  isUnknown: boolean;
  is24Hours: boolean;
}
