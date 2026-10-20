import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, LegalSection } from "@/components/legal/legal-page";
import { LEGAL } from "@/lib/legal/site";

export const metadata: Metadata = {
  title: "Terms of use · EduBite",
  description: "The terms that apply when you use EduBite, operated by Eye Magnett Pvt. Ltd.",
  robots: { index: true, follow: true },
  alternates: { canonical: `${LEGAL.siteUrl}/terms` },
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms of use">
      <p>
        By using EduBite, you agree to these terms. If you do not agree, do not
        use EduBite. Our{" "}
        <Link href="/privacy" className="text-teal hover:underline">
          privacy notice
        </Link>{" "}
        explains how we handle personal information.
      </p>

      <LegalSection id="service" heading="1. The service">
        <p>
          EduBite, operated by {LEGAL.company}, gives Class 11 and Class 12
          students practice and habit tools. Those tools include DailyDose,
          FunBrain, Brain Gym, puzzles, habits, streaks, achievements,
          inspiration, AI integrity pledges, and an optional link to a WhatsApp
          group. Features can be added, changed, or removed.
        </p>
      </LegalSection>

      <LegalSection id="eligibility" heading="2. Who can use EduBite">
        <p>
          Give accurate account information. Do not pretend to be another person
          or misstate your age. If you are under 18, use EduBite with a parent
          or guardian. Parents and guardians are responsible for a minor’s use.
        </p>
      </LegalSection>

      <LegalSection id="account" heading="3. Your account">
        <p>
          You sign in with Google. Keep that account under your control, and
          tell us at {LEGAL.email} if you think someone else is using it. You
          are responsible for activity on your account unless we failed to keep
          reasonable security. Signing out ends the session. It does not close
          the account. To ask for deletion, email {LEGAL.email}.
        </p>
      </LegalSection>

      <LegalSection id="disclaimer" heading="4. Educational disclaimer">
        <p>EduBite does not guarantee:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Examination scores</li>
          <li>Admission or rank</li>
          <li>Scholarships or employment</li>
          <li>Any particular academic result</li>
        </ul>
        <p>
          Check important academic information with your teachers and official
          course material.
        </p>
      </LegalSection>

      <LegalSection id="use" heading="5. Acceptable use">
        <p>You must not:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Manipulate scores, streaks, or RDM</li>
          <li>Use bots or scripts against the service</li>
          <li>Break security or upload malware</li>
          <li>Copy, scrape, or resell EduBite content</li>
          <li>Harass anyone, or post another person’s private information</li>
          <li>Use EduBite for anything illegal</li>
        </ul>
      </LegalSection>

      <LegalSection id="whatsapp" heading="6. WhatsApp Squad">
        <p>
          The WhatsApp Squad button opens a WhatsApp group. That group is not a
          chat inside EduBite. WhatsApp’s own terms apply there. Do not share
          phone numbers, home addresses, passwords, OTPs, bank details, or
          identity documents in connection with EduBite.
        </p>
      </LegalSection>

      <LegalSection id="ip" heading="7. Intellectual property">
        <p>
          The EduBite software, name, design, questions, and learning structure
          belong to {LEGAL.company} You receive a personal, non-transferable
          permission to use them for your own study. You do not receive
          ownership of them.
        </p>
      </LegalSection>

      <LegalSection id="rewards" heading="8. RDM, badges, and streaks">
        <p>
          RDM points, badges, levels, and streaks are progress markers inside
          EduBite. They have no cash value. You cannot sell, transfer, or redeem
          them for cash. We may change or stop them.
        </p>
        <p>
          If a separate contest mentions a prize, only the terms shown with that
          contest apply. A prize mentioned on a WhatsApp screen is not a promise
          that RDM can be cashed out.
        </p>
      </LegalSection>

      <LegalSection id="paid" heading="9. Paid features">
        <p>
          This version of EduBite does not sell subscriptions or digital goods.
          If we add a purchase later, the price, renewal, and cancellation terms
          will be shown before you pay. Purchases on Google Play will use Google
          Play billing.
        </p>
      </LegalSection>

      <LegalSection id="suspension" heading="10. Suspension">
        <p>
          We may suspend or close an account for fraud, abuse, illegal activity,
          a serious breach of these terms, or manipulation of scores and rewards.
          Where we can, we will tell you and give you a chance to respond.
        </p>
      </LegalSection>

      <LegalSection id="availability" heading="11. Availability">
        <p>
          We work to keep EduBite available. It may be down for maintenance,
          updates, outages, or problems at a provider we rely on.
        </p>
      </LegalSection>

      <LegalSection id="liability" heading="12. Liability">
        <p>
          To the extent Indian law allows, {LEGAL.company} is not liable for
          indirect or consequential loss from use of EduBite. These terms do not
          remove liability that the law says cannot be removed.
        </p>
      </LegalSection>

      <LegalSection id="law" heading="13. Law and disputes">
        <p>
          These terms are governed by the laws of India. Courts at Mumbai,
          Maharashtra have jurisdiction, subject to any right you have under
          law to bring a claim somewhere else.
        </p>
      </LegalSection>

      <LegalSection id="changes" heading="14. Changes">
        <p>
          We may update these terms. The new version will be posted on this page
          with a new effective date. If you keep using EduBite after that date,
          the new terms apply.
        </p>
      </LegalSection>

      <LegalSection id="contact" heading="15. Contact">
        <p>
          {LEGAL.company}
          <br />
          Email:{" "}
          <a className="text-teal hover:underline" href={`mailto:${LEGAL.email}`}>
            {LEGAL.email}
          </a>
          <br />
          Privacy and grievances: {LEGAL.grievanceOfficer}, {LEGAL.email}
          <br />
          Address: {LEGAL.address.join(", ")}
        </p>
      </LegalSection>
    </LegalPage>
  );
}
