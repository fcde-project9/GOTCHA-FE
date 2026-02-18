import TermsLayout from "@/components/mypage/TermsLayout";
import { COMMUNITY_GUIDE } from "@/data/terms";

export default function CommunityGuidePage() {
  return <TermsLayout title="커뮤니티 가이드" content={COMMUNITY_GUIDE.replace(/^.+\n\n/, "")} />;
}
