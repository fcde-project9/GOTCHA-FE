"use client";

interface MenuItemProps {
  label: string;
  onClick?: () => void;
  showBorder?: boolean;
}

function MenuItem({ label, onClick, showBorder = true }: MenuItemProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-between w-full px-0 py-3.5 ${
        showBorder ? "border-b border-line-100" : ""
      }`}
    >
      <span className="flex-1 text-left text-[16px] font-normal leading-[1.5] tracking-[-0.16px] text-grey-900 h-6">
        {label}
      </span>
      <div className="w-6 h-6 flex items-center justify-center">
        <svg
          width="7"
          height="14"
          viewBox="0 0 7 14"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M1 13L6 7L1 1"
            stroke="#626264"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </button>
  );
}

interface MenuListProps {
  onMyReports?: () => void;
  onTerms?: () => void;
  onAbout?: () => void;
}

export function MenuList({ onMyReports, onTerms, onAbout }: MenuListProps) {
  return (
    <div className="flex flex-col items-start w-full">
      <MenuItem label="내가 제보한 업체" onClick={onMyReports} />
      <MenuItem label="약관/라이센스" onClick={onTerms} />
      <MenuItem label="이 서비스를 만든 녀석들" onClick={onAbout} showBorder={false} />
    </div>
  );
}
