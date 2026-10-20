import type { Metadata } from "next";
import { DeleteAccountPanel } from "@/components/account/delete-account-panel";
import { LEGAL } from "@/lib/legal/site";

export const metadata: Metadata = {
  title: "Delete account · EduBite",
  description: "Delete your EduBite learning data from the account you use to sign in.",
  robots: { index: true, follow: true },
  alternates: { canonical: `${LEGAL.siteUrl}/delete-account` },
};

export default function DeleteAccountPage() {
  return <DeleteAccountPanel />;
}
