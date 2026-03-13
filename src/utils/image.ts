import imageCompression from "browser-image-compression";

export async function compressShopImage(file: File): Promise<File> {
  try {
    return await imageCompression(file, {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      fileType: "image/jpeg",
      initialQuality: 0.8,
      useWebWorker: true,
    });
  } catch {
    // 미지원 포맷(HEIC/HEIF)만 원본 허용
    if (file.type === "image/heic" || file.type === "image/heif") {
      return file;
    }
    // 기타 압축 오류는 전파
    throw new Error(`이미지 압축 실패: ${file.name}`);
  }
}
