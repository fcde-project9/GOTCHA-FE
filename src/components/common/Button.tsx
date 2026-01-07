import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "secondary" | "tertiary" | "ghost";
export type ButtonSize = "large" | "medium" | "small";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * 버튼 스타일 variant
   * @default "primary"
   */
  variant?: ButtonVariant;
  /**
   * 버튼 크기
   * @default "medium"
   */
  size?: ButtonSize;
  /**
   * 전체 너비 사용 여부
   * @default false
   */
  fullWidth?: boolean;
  /**
   * 비활성화 상태
   * @default false
   */
  disabled?: boolean;
  /**
   * 로딩 상태
   * @default false
   */
  loading?: boolean;
}

/**
 * GOTCHA 디자인 시스템 Button 컴포넌트
 *
 * @example
 * ```tsx
 * <Button variant="primary" size="large">확인</Button>
 * <Button variant="secondary" size="medium" disabled>취소</Button>
 * <Button variant="tertiary" size="small" fullWidth>작은 버튼</Button>
 * ```
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "medium",
      fullWidth = false,
      disabled = false,
      loading = false,
      className,
      children,
      ...props
    },
    ref
  ) => {
    // 기본 스타일
    const baseStyles = [
      "inline-flex items-center justify-center",
      "font-semibold tracking-[-0.01em]",
      "rounded-lg",
      "transition-colors duration-200",
      "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
      "disabled:cursor-not-allowed",
    ];

    // Variant별 스타일
    const variantStyles: Record<ButtonVariant, string> = {
      primary: cn(
        "bg-main text-grey-white",
        "hover:bg-main-700",
        "active:bg-main-900",
        "focus-visible:ring-main-300",
        "disabled:bg-grey-300 disabled:text-grey-500"
      ),
      secondary: cn(
        "bg-grey-900 text-grey-white",
        "hover:bg-grey-800",
        "active:bg-grey-900",
        "focus-visible:ring-grey-500",
        "disabled:bg-grey-300 disabled:text-grey-500"
      ),
      tertiary: cn(
        "bg-grey-100 text-grey-900",
        "hover:bg-grey-200",
        "active:bg-grey-300",
        "focus-visible:ring-grey-300",
        "disabled:bg-grey-100 disabled:text-grey-400"
      ),
      ghost: cn(
        "bg-transparent text-grey-900",
        "hover:bg-grey-50",
        "active:bg-grey-100",
        "focus-visible:ring-grey-300",
        "disabled:text-grey-400"
      ),
    };

    // Size별 스타일
    const sizeStyles: Record<ButtonSize, string> = {
      large: "h-[56px] px-6 text-[16px] leading-[1.5]",
      medium: "h-[48px] px-5 text-[15px] leading-[1.5]",
      small: "h-[40px] px-4 text-[14px] leading-[1.5]",
    };

    // 전체 너비
    const widthStyles = fullWidth ? "w-full" : "";

    // 로딩 상태
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], widthStyles, className)}
        disabled={isDisabled}
        {...props}
      >
        {loading ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>{children}</span>
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
