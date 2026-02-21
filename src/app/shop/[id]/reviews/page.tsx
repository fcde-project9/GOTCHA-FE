import ReviewsListClient from "./ReviewsListClient";

export function generateStaticParams() {
  return [{ id: "0" }];
}

export default function ReviewsListPage() {
  return <ReviewsListClient />;
}
