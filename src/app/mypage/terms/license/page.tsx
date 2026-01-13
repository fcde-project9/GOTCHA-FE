import TermsLayout from "@/components/mypage/TermsLayout";
import { LICENSE } from "@/data/terms";

export default function LicensePage() {
  return <TermsLayout title="라이센스" content={LICENSE} />;
}
