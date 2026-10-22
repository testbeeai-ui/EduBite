import type { Metadata } from "next";
import { PolicyDocument } from "@/components/legal/policy-document";
import privacyNotice from "@/lib/legal/privacy-notice.json";
import { LEGAL } from "@/lib/legal/site";

export const metadata: Metadata = {
  title: "Privacy notice · EduBite",
  description:
    "Privacy notice for EduBite, operated by Eye Magnett Pvt. Ltd.",
  robots: { index: true, follow: true },
  alternates: { canonical: `${LEGAL.siteUrl}/privacy` },
};

export default function PrivacyPage() {
  return <PolicyDocument lines={privacyNotice} />;
}
