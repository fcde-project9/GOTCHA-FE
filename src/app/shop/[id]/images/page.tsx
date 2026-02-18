import ImagesGalleryClient from "./ImagesGalleryClient";

export function generateStaticParams() {
  return [{ id: "0" }];
}

export default function ImagesGalleryPage() {
  return <ImagesGalleryClient />;
}
