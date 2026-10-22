/** Public legal pages. These must stay reachable without signing in. */

export const LEGAL_PATHS = ["/privacy", "/terms", "/delete-account"] as const;

export const LEGAL = {
  product: "EduBite",
  company: "Eye Magnett Pvt. Ltd.",
  address: [
    "J1905, Rustomjee Azziano",
    "Majiwada, Thane West",
    "Maharashtra 400603, India",
  ],
  email: "lsn@eyemagnett.com",
  phone: "+91-9513552961",
  grievanceOfficer: "Sankar L",
  effectiveDate: "20 October 2026",
  siteUrl: "https://edubite1.vercel.app",
} as const;

export function isPublicLegalPath(pathname: string): boolean {
  return LEGAL_PATHS.some((path) => pathname === path);
}
