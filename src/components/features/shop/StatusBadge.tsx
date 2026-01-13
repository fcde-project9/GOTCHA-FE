interface StatusBadgeProps {
  isOpen: boolean;
  isDayOff?: boolean;
}

export default function StatusBadge({ isOpen, isDayOff = false }: StatusBadgeProps) {
  // 상태 결정: 휴무 > 영업중 > 영업종료
  const getStatus = () => {
    if (isDayOff) return "dayOff";
    if (isOpen) return "open";
    return "closed";
  };

  const status = getStatus();

  const statusConfig = {
    open: {
      bgColor: "bg-success-light",
      textColor: "text-success",
      label: "영업중",
    },
    closed: {
      bgColor: "bg-error-light",
      textColor: "text-main",
      label: "영업종료",
    },
    dayOff: {
      bgColor: "bg-grey-100",
      textColor: "text-grey-500",
      label: "휴무",
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
