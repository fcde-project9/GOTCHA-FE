/**
 * 로딩 화면 컴포넌트
 * 앱 초기 로딩 시 표시되는 스플래시 스크린
 */
export default function LoadingScreen() {
  return (
    <div className="relative flex h-screen w-full items-center justify-center bg-[#a9a9a9]">
      <div className="flex flex-col items-center gap-4">
        <p className="text-center text-[64px] font-bold leading-[1.5] tracking-[-1.408px] text-white">
          GOTCHA!
        </p>
        <p className="text-center text-[14px] leading-[1.5] tracking-[-0.308px] text-[#252525]">
          서비스에 대한 문구
        </p>
      </div>
    </div>
  );
}
