import type { Metadata } from "next";
import { PolicyDocument } from "@/components/legal/policy-document";
import { LEGAL } from "@/lib/legal/site";
import termsOfUse from "@/lib/legal/terms-of-use.json";

export const metadata: Metadata = {
  title: "Terms of use · EduBite",
  description: "Terms of use for EduBite, operated by Eye Magnett Pvt. Ltd.",
  robots: { index: true, follow: true },
  alternates: { canonical: `${LEGAL.siteUrl}/terms` },
};

export default function TermsPage() {
  return <PolicyDocument lines={termsOfUse} />;
}
