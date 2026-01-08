interface StatusBadgeProps {
  isOpen: boolean;
}

export default function StatusBadge({ isOpen }: StatusBadgeProps) {
  return (
    <div
      className={`flex items-center justify-center px-[5.893px] py-[1.964px] rounded-[55px] ${
        isOpen ? "bg-success-light text-success" : "bg-error-light text-main"
      }`}
    >
      <span
        className="text-center font-pretendard font-normal"
        style={{
          fontSize: "11.786px",
          lineHeight: "150%",
          letterSpacing: "-0.259px",
        }}
      >
        {isOpen ? "영업중" : "영업종료"}
      </span>
    </div>
  );
}
