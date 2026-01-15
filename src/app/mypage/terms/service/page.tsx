import TermsLayout from "@/components/mypage/TermsLayout";
import { TERMS_OF_SERVICE } from "@/data/terms";

export default function TermsServicePage() {
  return <TermsLayout title="이용약관" content={TERMS_OF_SERVICE.replace(/^# .+\n\n/, "")} />;
}
