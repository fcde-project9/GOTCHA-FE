import imageCompression from "browser-image-compression";

export async function compressShopImage(file: File): Promise<File> {
  try {
    return await imageCompression(file, {
      maxSizeMB: 1,
      maxWidthOrHeight: 1024,
      useWebWorker: true,
    });
  } catch {
    // HEIC/HEIF 등 브라우저가 처리 못하는 포맷은 원본 그대로 사용
    return file;
  }
}
