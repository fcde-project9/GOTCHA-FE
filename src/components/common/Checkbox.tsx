/**
 * 체크박스 컴포넌트
 * 이용약관 동의, 회원탈퇴 설문 등에서 사용
 */

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  variant?: "filled" | "outlined";
  size?: "small" | "medium";
  className?: string;
}

export function Checkbox({
  checked,
  onChange,
  label,
  variant = "filled",
  size = "medium",
  className = "",
}: CheckboxProps) {
  const sizeClasses = {
    small: "w-5 h-5",
    medium: "w-6 h-6",
  };

  const variantClasses = {
    filled: checked ? "bg-main border-0" : "bg-grey-200 border-0",
    outlined: checked ? "bg-main border-2 border-main" : "bg-white border-2 border-grey-300",
  };

  return (
    <label className={`flex items-center gap-2 cursor-pointer ${className}`}>
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only peer"
        />
        <div
          className={`${sizeClasses[size]} ${variantClasses[variant]} rounded-full flex items-center justify-center transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-main`}
        >
          {checked && (
            <svg
              width="14"
              height="10"
              viewBox="0 0 14 10"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M1 5L5 9L13 1"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </div>
      </div>
      {label && (
        <span className="text-[14px] font-normal leading-[1.5] tracking-[-0.14px] text-grey-900">
          {label}
        </span>
      )}
    </label>
  );
}
