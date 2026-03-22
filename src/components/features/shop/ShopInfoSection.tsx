import Image from "next/image";
import { Copy } from "lucide-react";
import { ALL_DAYS, DAY_MAP, parseOpenTime, getBusinessDays } from "@/utils";
import { DayBadge } from "./DayBadge";
import StatusBadge from "./StatusBadge";

interface ShopInfoSectionProps {
  addressName: string;
  locationHint: string;
  openTime: string;
  todayOpenTime: string | null;
  openStatus: string;
  onCopyAddress: () => void;
}

export function ShopInfoSection({
  addressName,
  locationHint,
  openTime,
  todayOpenTime,
  openStatus,
  onCopyAddress,
}: ShopInfoSectionProps) {
  const parsed = parseOpenTime(openTime);
  const businessDays = getBusinessDays(parsed);

  return (
    <>
      <div className="flex flex-col gap-3 py-2">
        <div className="flex items-center gap-2">
          <Image
            src="/images/icons/shop-location.png"
            alt=""
            width={20}
            height={20}
            className="shrink-0 pointer-events-none select-none"
          />
          <div className="flex items-center gap-0.5">
            <p className="text-[16px] text-grey-900 leading-[1.5] tracking-[-0.16px]">
              {addressName}
            </p>
            <button
              onClick={onCopyAddress}
              className="shrink-0 flex items-center justify-center w-5 h-5 rounded text-[12px] text-grey-600"
            >
              <Copy size={14} strokeWidth={1.5} />
            </button>
          </div>
        </div>
        {locationHint && (
          <div className="flex items-center gap-2">
            <Image
              src="/images/icons/shop-star.png"
              alt=""
              width={20}
              height={20}
              className="shrink-0 pointer-events-none select-none"
            />
            <p className="text-[16px] text-grey-900 leading-[1.5] tracking-[-0.16px]">
              {locationHint}
            </p>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-3 pb-4 mt-1">
        <div className="flex items-center gap-2">
          <Image
            src="/images/icons/shop-calendar.png"
            alt=""
            width={20}
            height={20}
            className="shrink-0 pointer-events-none select-none"
          />
          <div className="flex gap-1.5">
            {ALL_DAYS.map((day) => (
              <DayBadge key={day} day={DAY_MAP[day]} isActive={businessDays.includes(day)} />
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 min-h-6">
          <Image
            src="/images/icons/shop-time.png"
            alt=""
            width={20}
            height={20}
            className="shrink-0 pointer-events-none select-none"
          />
          {todayOpenTime && <span className="text-[16px] text-grey-900">{todayOpenTime}</span>}
          <StatusBadge openStatus={openStatus} />
        </div>
      </div>
    </>
  );
}
