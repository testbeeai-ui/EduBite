import type { Metadata } from "next";
import { LegalPage, LegalSection } from "@/components/legal/legal-page";
import { LEGAL } from "@/lib/legal/site";

export const metadata: Metadata = {
  title: "Privacy notice · EduBite",
  description:
    "How Eye Magnett Pvt. Ltd. collects, uses, and shares personal information in EduBite.",
  robots: { index: true, follow: true },
  alternates: { canonical: `${LEGAL.siteUrl}/privacy` },
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy notice">
      <LegalSection id="about" heading="1. About EduBite">
        <p>
          EduBite is a learning product for Class 11 and Class 12 students. It
          includes DailyDose, FunBrain, Brain Gym, puzzles, habits, streaks,
          achievements, inspiration, and AI integrity pledges. {LEGAL.company}{" "}
          operates it.
        </p>
        <p>
          Registered office: {LEGAL.address.join(", ")}.
          <br />
          Email: <a className="text-teal hover:underline" href={`mailto:${LEGAL.email}`}>{LEGAL.email}</a>
          <br />
          Phone: {LEGAL.phone}
        </p>
        <p>
          In this notice, “EduBite”, “we”, “us”, and “our” mean {LEGAL.company} and
          the EduBite website and mobile app.
        </p>
      </LegalSection>

      <LegalSection id="collect" heading="2. Information we collect">
        <p>We collect what we need to run accounts, learning features, and security.</p>
        <p className="font-semibold text-[var(--text)]">Information from your Google account</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Name</li>
          <li>Email address</li>
          <li>Profile photo, when Google provides one</li>
        </ul>
        <p className="font-semibold text-[var(--text)]">Information created while you learn</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Student ID</li>
          <li>Quiz attempts, answers, and scores</li>
          <li>Streaks, habits, achievements, and RDM points</li>
          <li>Puzzle and pledge activity</li>
        </ul>
        <p className="font-semibold text-[var(--text)]">Technical information</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Device or browser type, app version, and language</li>
          <li>IP address</li>
          <li>Sign-in session and security logs</li>
        </ul>
        <p>
          We do not ask for your contacts, SMS, call logs, precise location,
          microphone, or camera. We do not show ads, and we do not collect payment
          card numbers. EduBite has no paid checkout in this version.
        </p>
      </LegalSection>

      <LegalSection id="use" heading="3. How we use information">
        <ul className="list-disc space-y-1 pl-5">
          <li>Create and keep your account signed in</li>
          <li>Save learning progress, streaks, achievements, and RDM</li>
          <li>Show your profile and student ID</li>
          <li>Protect the service from abuse and fraud</li>
          <li>Fix errors and answer support email</li>
          <li>Meet legal duties</li>
        </ul>
        <p>
          EduBite is practice and habit support. It does not guarantee examination
          scores, rank, admission, or scholarships.
        </p>
      </LegalSection>

      <LegalSection id="ai" heading="4. AI pledges">
        <p>
          The AI section of EduBite is a daily integrity pledge about using AI
          tools to learn, not to skip the work. We do not use your account or
          learning history to train unrelated AI models, and we do not use it for
          targeted advertising.
        </p>
      </LegalSection>

      <LegalSection id="children" heading="5. Students under 18">
        <p>
          EduBite is built for Class 11 and Class 12 students. Some of those
          students are under 18. If you are under 18, use EduBite with a parent
          or guardian.
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>We do not sell personal information.</li>
          <li>We do not use it for targeted advertising.</li>
          <li>
            A parent or guardian may email {LEGAL.email} to ask for access,
            correction, or deletion of a student’s information.
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="sharing" heading="6. Who we share information with">
        <p>We share information only with providers that run EduBite for us:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Google, for sign-in</li>
          <li>Supabase, for accounts and the learning database</li>
          <li>Vercel, for hosting this website</li>
        </ul>
        <p>
          Sign-in uses the same Google account system as Edublast. EduBite learning
          records are stored in EduBite tables. Joining the WhatsApp Squad opens
          WhatsApp, which has its own terms and privacy policy.
        </p>
        <p>
          We may also disclose information if the law requires it, or to investigate
          fraud, security incidents, or harm to users. We do not sell personal
          information.
        </p>
      </LegalSection>

      <LegalSection id="security" heading="7. Security">
        <p>
          Account and learning data are sent over encrypted HTTPS. Access to the
          database is limited to signed-in accounts and to people who operate the
          service. No internet service can promise perfect security.
        </p>
      </LegalSection>

      <LegalSection id="retention" heading="8. How long we keep information">
        <p>
          We keep personal information while your account is in use, and for as
          long as we need it for security, disputes, or a legal duty. When it is
          no longer needed, we delete it or remove the details that identify you.
        </p>
      </LegalSection>

      <LegalSection id="rights" heading="9. Your choices">
        <p>You can ask us to:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Show you the personal information we hold</li>
          <li>Correct information that is wrong</li>
          <li>Stop using information where we rely on your consent</li>
          <li>Delete your EduBite account and the personal information tied to it</li>
        </ul>
        <p>
          Email{" "}
          <a className="text-teal hover:underline" href={`mailto:${LEGAL.email}`}>
            {LEGAL.email}
          </a>{" "}
          from the Google account you use on EduBite. Signing out ends the session
          on that device. It does not delete the account.
        </p>
        <p>
          If you withdraw consent for a feature that cannot work without that
          information, that feature will stop being available. Withdrawal does not
          undo use that was already lawful.
        </p>
      </LegalSection>

      <LegalSection id="transfers" heading="10. Processing outside India">
        <p>
          Google, Supabase, or Vercel may process information outside India. We
          use them to provide EduBite, under their security and contract terms.
        </p>
      </LegalSection>

      <LegalSection id="changes" heading="11. Changes">
        <p>
          When this notice changes, we will post the new version on this page and
          change the “Last updated” date.
        </p>
      </LegalSection>

      <LegalSection id="contact" heading="12. Contact and grievances">
        <p>
          Privacy contact and grievance officer: {LEGAL.grievanceOfficer}
          <br />
          Email:{" "}
          <a className="text-teal hover:underline" href={`mailto:${LEGAL.email}`}>
            {LEGAL.email}
          </a>
          <br />
          Phone: {LEGAL.phone}
          <br />
          Address: {LEGAL.address.join(", ")}
        </p>
      </LegalSection>
    </LegalPage>
  );
}
