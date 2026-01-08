interface StatusBadgeProps {
  isOpen: boolean;
}

export default function StatusBadge({ isOpen }: StatusBadgeProps) {
  return (
    <div
      className={`flex items-center justify-center px-[5.893px] py-[1.964px] rounded-[55px] ${
        isOpen
          ? "bg-[#ecfcf4] text-[#02BD79]"
          : "bg-[#FFF4F4] text-[#FF4545]"
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
