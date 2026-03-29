export function DayBadge({ day, isActive }: { day: string; isActive: boolean }) {
  return (
    <div
      className={`flex items-center justify-center w-[22px] h-[22px] rounded-full text-[12px] font-normal tracking-[-0.12px] leading-[150%] ${
        isActive ? "bg-grey-800 text-white" : "bg-grey-100 text-grey-400"
      }`}
    >
      {day}
    </div>
  );
}
