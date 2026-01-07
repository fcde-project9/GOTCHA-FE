import { Footer } from "@/components/common";

export default function ReportPage() {
  return (
    <>
      <main className="flex h-[calc(100vh-70px)] flex-col items-center justify-center p-8">
        <h1 className="mb-4 text-3xl font-bold">제보</h1>
        <p className="text-center text-gray-600">가챠샵 정보를 제보하는 페이지입니다.</p>
      </main>
      <Footer />
    </>
  );
}
