import { Footer } from "@/components/common";

export default function FavoritesPage() {
  return (
    <>
      <main className="flex h-[calc(100vh-70px)] flex-col items-center justify-center p-8">
        <h1 className="mb-4 text-3xl font-bold">찜</h1>
        <p className="text-center text-gray-600">찜한 가챠샵 목록 페이지입니다.</p>
      </main>
      <Footer />
    </>
  );
}
