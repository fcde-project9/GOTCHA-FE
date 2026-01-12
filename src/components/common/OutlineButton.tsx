import { ButtonHTMLAttributes, forwardRef, ReactNode } from "react";
import { cn } from "@/lib/utils";

export type OutlineButtonSize = "large" | "medium" | "small";

export interface OutlineButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * 버튼 크기
   * @default "medium"
   */
  size?: OutlineButtonSize;
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
   * 오른쪽에 표시할 아이콘
   */
  rightIcon?: ReactNode;
  /**
   * 왼쪽에 표시할 아이콘
   */
  leftIcon?: ReactNode;
}

/**
 * GOTCHA 디자인 시스템 OutlineButton 컴포넌트
 * 테두리가 있는 버튼 스타일
 *
 * @example
 * ```tsx
 * <OutlineButton>리뷰 전체보기</OutlineButton>
 * <OutlineButton rightIcon={<ChevronRight size={24} />}>전체보기</OutlineButton>
 * <OutlineButton size="small" fullWidth>작은 버튼</OutlineButton>
 * ```
 */
export const OutlineButton = forwardRef<HTMLButtonElement, OutlineButtonProps>(
  (
    {
      size = "medium",
      fullWidth = false,
      disabled = false,
      rightIcon,
      leftIcon,
      className,
      children,
      ...props
    },
    ref
  ) => {
    // 기본 스타일
    const baseStyles = [
      "inline-flex items-center justify-center gap-1",
      "font-semibold tracking-[-0.16px]",
      "rounded-lg",
      "border border-grey-400",
      "text-grey-700",
      "bg-transparent",
      "transition-colors duration-200",
      "hover:bg-grey-50 active:bg-grey-100",
      "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-grey-300",
      "disabled:cursor-not-allowed disabled:border-grey-200 disabled:text-grey-400",
    ];

    // Size별 스타일
    const sizeStyles: Record<OutlineButtonSize, string> = {
      large: "h-[56px] px-6 text-[16px] leading-[1.5]",
      medium: "h-[46px] px-5 text-[16px] leading-[1.5]",
      small: "h-[40px] px-4 text-[14px] leading-[1.5]",
    };

    // 전체 너비
    const widthStyles = fullWidth ? "w-full" : "";

    return (
      <button
        ref={ref}
        className={cn(baseStyles, sizeStyles[size], widthStyles, className)}
        disabled={disabled}
        {...props}
      >
        {leftIcon && <span className="flex items-center">{leftIcon}</span>}
        {children}
        {rightIcon && <span className="flex items-center">{rightIcon}</span>}
      </button>
    );
  }
);

OutlineButton.displayName = "OutlineButton";
