interface StatusBadgeProps {
  /** @deprecated Use openStatus instead */
  isOpen?: boolean;
  /** @deprecated Use openStatus instead */
  isDayOff?: boolean;
  /** 영업 상태 문자열 ("영업 중", "휴무", "" 등). 빈 문자열이면 "영업시간 모름" 표시 */
  openStatus?: string;
}

export default function StatusBadge({ isOpen, isDayOff = false, openStatus }: StatusBadgeProps) {
  // 상태 결정
  const getStatus = () => {
    // openStatus 문자열이 있으면 우선 사용
    if (openStatus !== undefined) {
      if (openStatus === "영업 중") return "open";
      if (openStatus === "휴무") return "dayOff";
      if (openStatus === "영업 종료") return "closed";
      if (openStatus === "") return "unknown";
      // 기타 상태는 그대로 표시
      return "custom";
    }

    // 기존 boolean 기반 로직 (하위 호환성)
    if (isDayOff) return "dayOff";
    if (isOpen) return "open";
    return "closed";
  };

  const status = getStatus();

  const statusConfig: Record<string, { bgColor: string; textColor: string; label: string }> = {
    open: {
      bgColor: "bg-success-light",
      textColor: "text-success",
      label: "영업 중",
    },
    closed: {
      bgColor: "bg-error-light",
      textColor: "text-main",
      label: "영업 종료",
    },
    dayOff: {
      bgColor: "bg-grey-100",
      textColor: "text-grey-500",
      label: "휴무",
    },
    unknown: {
      bgColor: "bg-grey-100",
      textColor: "text-grey-500",
      label: "영업정보 없음",
    },
    custom: {
      bgColor: "bg-grey-100",
      textColor: "text-grey-500",
      label: openStatus || "",
    },
  };

  const config = statusConfig[status];

  return (
    <div
      className={`flex items-center justify-center px-[5.893px] py-[1.964px] rounded-[55px] ${config.bgColor} ${config.textColor}`}
    >
      <span
        className="text-center font-pretendard font-normal"
        style={{
          fontSize: "11.786px",
          lineHeight: "150%",
          letterSpacing: "-0.259px",
        }}
      >
        {config.label}
      </span>
    </div>
  );
}
