import TermsLayout from "@/components/mypage/TermsLayout";
import { PRIVACY_POLICY } from "@/data/terms";

export default function PrivacyPolicyPage() {
  return <TermsLayout title="개인정보처리방침" content={PRIVACY_POLICY.replace(/^# .+\n\n/, "")} />;
}
