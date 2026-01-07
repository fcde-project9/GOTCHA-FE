/**
 * GOTCHA 디자인 시스템 컬러 팔레트
 * Figma 디자인에서 정의된 컬러 값들
 */

export const colors = {
  // 메인 컬러 군
  main: {
    900: "#D61D1B",
    800: "#E22723",
    700: "#F43329",
    600: "#FF3E27",
    500: "#FF4545",
    400: "#FF4545", // main
    300: "#F3726E",
    200: "#FA9A97",
    100: "#FFCDD1",
    50: "#FFEBEE",
  },

  // Grey 컬러
  grey: {
    900: "#121213",
    800: "#323233",
    700: "#626264",
    600: "#626264",
    500: "#8A8A8B",
    400: "#ABABAC",
    300: "#CCCCCD",
    200: "#E2E2E3",
    100: "#EEEEEF",
    50: "#F7F7F9",
    white: "#FFFFFF",
  },

  // 라인 컬러
  line: {
    800: "#323233",
    300: "#CCCCCD",
    100: "#EEEEEF",
  },

  // 시스템 컬러
  system: {
    success: "#02BD79",
    successLight: "#E0F7EF",
    error: "#FF3E27",
    errorLight: "#FFEBEE",
  },

  // 배경 컬러
  background: {
    default: "#FDFEFF",
    white: "#FFFFFF",
    grey: "#F7F7F9",
  },
} as const;

// 타입 정의
export type MainColor = keyof typeof colors.main;
export type GreyColor = keyof typeof colors.grey;
export type LineColor = keyof typeof colors.line;
export type SystemColor = keyof typeof colors.system;
export type BackgroundColor = keyof typeof colors.background;
