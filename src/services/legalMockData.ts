/**
 * Seed data for the Legal Documents admin module.
 *
 * Four canonical documents are produced — one Terms & Conditions and one
 * Privacy Policy per user role (crew / owner) — each with a small history
 * of published versions. The active mutable copy lives in `legalApi`.
 */

import type {
  LegalDocument,
  LegalDocumentId,
  LegalDocumentVersion,
} from "@/types";

/* ---------------- HTML content blocks ---------------- */

const CREW_TERMS_HTML = `
<h2>1. Acceptance of Terms</h2>
<p>By creating a crew profile on the SEAV Yacht Crew platform you confirm that you have read, understood and agree to be bound by these Terms and Conditions in their entirety. If you do not agree to these terms you must not use the platform.</p>
<h2>2. Account Responsibility</h2>
<p>You are solely responsible for maintaining the security of your login credentials and for all activities conducted under your account. Notify SEAV immediately at support@seav.app if you suspect any unauthorised access to your account.</p>
<h2>3. Profile Accuracy</h2>
<p>All information provided in your crew profile must be accurate, current and complete. You must update your profile promptly whenever your qualifications, availability or personal details change. Profiles containing misleading or unverifiable information may be suspended without notice.</p>
<h2>4. Certification Requirements</h2>
<p>Any professional maritime certifications listed on your profile must be valid, authentic and verifiable. Supporting documentation must be uploaded for each certification claimed. SEAV administrators may request re-verification of any certification at any time.</p>
<h2>5. Job Applications</h2>
<p>When applying to positions through the platform you confirm that all information submitted is truthful and complete. Fraudulent applications, or applications for roles you do not meet the stated requirements for, may result in immediate account suspension.</p>
<h2>6. Reference Verification</h2>
<p>By including professional references in your profile you confirm that those individuals have consented to be contacted by SEAV and prospective employers regarding your professional history. SEAV reserves the right to verify any reference at its discretion.</p>
<h2>7. Professional Conduct</h2>
<p>You agree to conduct yourself professionally and respectfully in all interactions with employers, captains and agents facilitated through SEAV. Harassment, discriminatory behaviour or abusive communications will result in immediate account termination.</p>
<h2>8. Prohibited Activities</h2>
<p>You must not create multiple accounts, misrepresent your qualifications or identity, attempt to circumvent the platform's verification processes, solicit users off-platform to avoid applicable service fees, or engage in any fraudulent conduct.</p>
<h2>9. Account Suspension</h2>
<p>SEAV reserves the right to suspend or permanently terminate your account without prior notice for violation of these terms, provision of false information, verified complaints of professional misconduct, or activities harmful to other users or the platform.</p>
<h2>10. Limitation of Liability</h2>
<p>SEAV operates as an intermediary connecting crew members with maritime employers and does not guarantee employment outcomes. We accept no liability for employment terms, salary disputes, working conditions, contract breaches, or personal injury arising from engagements arranged through the platform.</p>
`.trim();

const CREW_PRIVACY_HTML = `
<h2>1. Information We Collect</h2>
<p>SEAV collects information you provide directly when creating and maintaining your crew profile, together with data about your platform activity including job applications submitted, profile views received, and messages exchanged with employers.</p>
<h2>2. Personal Details</h2>
<p>We collect your full name, date of birth, nationality, email address, phone number and residential address. This information is used to verify your identity and to enable yacht owners and captains to evaluate your suitability for maritime roles.</p>
<h2>3. Certifications</h2>
<p>Copies of your maritime certifications, STCW documents and other professional qualifications are collected and stored securely. These documents are shared with prospective employers only when you apply for a specific position.</p>
<h2>4. Work History</h2>
<p>Your professional work history, including vessel names, roles held, voyage durations and employer details, is stored as part of your profile and is visible to verified yacht owners and agents who view your profile.</p>
<h2>5. References</h2>
<p>Reference contact details and verification correspondence are stored in association with your profile. Reference feedback is visible only to you and to employers to whom you have applied for a position.</p>
<h2>6. Passport &amp; Visa Information</h2>
<p>Passport numbers, expiry dates, nationality and visa details are collected to support identity verification. This sensitive information is encrypted at rest and is only accessible to SEAV administrators and prospective employers to whom you have applied.</p>
<h2>7. Uploaded Photos &amp; Videos</h2>
<p>Profile photographs and any videos you choose to upload are stored on secure servers. Profile photos are visible to all verified employers on the platform. We do not use your images for advertising purposes without your explicit written consent.</p>
<h2>8. Profile Visibility</h2>
<p>Your profile is visible to verified yacht owners, captains and agents registered on the platform. Your full contact details are only shared with employers upon application or formal offer acceptance. Visibility settings can be adjusted in your account preferences.</p>
<h2>9. Data Security</h2>
<p>SEAV employs AES-256 encryption at rest, TLS 1.3 in transit, strict access controls and regular security audits to protect your personal data. In the event of a data breach we will notify you and the relevant supervisory authority within 72 hours.</p>
<h2>10. Data Retention</h2>
<p>Your data is retained for as long as your account remains active. If you request account deletion your personal data will be removed within 30 days, except where retention is required by applicable law or for the resolution of outstanding disputes.</p>
<h2>11. User Rights</h2>
<p>Under applicable data protection law you have the right to access, rectify, export or request erasure of your personal data. To exercise these rights contact privacy@seav.app. We will respond to all requests within 30 days of receipt.</p>
`.trim();

const OWNER_TERMS_HTML = `
<h2>1. Acceptance of Terms</h2>
<p>By registering as a yacht owner, captain, agent or fleet operator on the SEAV platform you agree to these Terms and Conditions in full. Use of the platform constitutes acceptance. These terms apply to all users acting in an employer capacity.</p>
<h2>2. Business Verification</h2>
<p>All employer accounts must complete verification before accessing full platform features. You must provide accurate business details including your registered company name, VAT or business registration number, and authorised contact information.</p>
<h2>3. Vessel Verification</h2>
<p>Any vessel listed on the platform must be accurately described, including its flag state, IMO or registration number, type, length, and current operational status. SEAV reserves the right to request official vessel documentation at any time.</p>
<h2>4. Job Posting Standards</h2>
<p>All job postings must accurately describe the role, required qualifications, compensation, vessel details and departure location. Misleading or fraudulent job postings are strictly prohibited and will result in immediate account suspension.</p>
<h2>5. Hiring Responsibility</h2>
<p>You are solely responsible for conducting appropriate due diligence on any crew member you engage through the platform. SEAV does not guarantee the accuracy of crew profiles and accepts no responsibility for a crew member's suitability for your specific requirements.</p>
<h2>6. Crew Data Usage</h2>
<p>You may only use crew member data accessed through the platform for the purpose of evaluating and hiring for your listed positions. You must not use crew data for marketing, sale to third parties, or any purpose unrelated to the hiring of maritime crew.</p>
<h2>7. Professional Conduct</h2>
<p>All communications with crew members through the platform must be professional, respectful and relevant to the hiring process. Discriminatory, harassing or abusive communications are strictly prohibited and will result in account termination.</p>
<h2>8. Prohibited Activities</h2>
<p>You must not post fraudulent job listings, misrepresent vessel or company details, contact crew members off-platform to avoid applicable service fees, recruit crew under false pretences, or engage in any conduct that undermines the integrity of the platform.</p>
<h2>9. Platform Monitoring</h2>
<p>SEAV monitors platform activity to maintain integrity and safety. We may review job postings, communications and account behaviour. Employers found to be acting in bad faith may have their listings removed and accounts suspended without notice or refund.</p>
<h2>10. Account Suspension</h2>
<p>We reserve the right to suspend or terminate employer accounts that violate these terms, post fraudulent listings, engage in prohibited data practices, or receive verified complaints from crew members. Suspended accounts may submit a formal appeal within 14 days.</p>
<h2>11. Limitation of Liability</h2>
<p>SEAV is not liable for the conduct of crew members found through the platform, for losses arising from employment decisions, or for crew-related incidents at sea. We do not guarantee the supply of crew and shall not be liable for any consequential losses arising from unfilled positions.</p>
`.trim();

const OWNER_PRIVACY_HTML = `
<h2>1. Information We Collect</h2>
<p>SEAV collects information provided by employer accounts when registering and operating on the platform, including business registration details, vessel information, job postings, and communications with crew members conducted through the platform.</p>
<h2>2. Company Information</h2>
<p>We collect your registered company or trading name, business registration or VAT number, registered address, authorised contact details, and billing information. This data is used to verify your identity and to process any applicable platform fees.</p>
<h2>3. Vessel Information</h2>
<p>Details about your registered vessels, including vessel name, type, flag state, IMO number, length, year built, and operational status, are collected and stored. Vessel details are used to match appropriate crew candidates to your posted positions.</p>
<h2>4. Verification Documents</h2>
<p>Business registration certificates, vessel ownership documents, insurance certificates and identity documents provided for verification are stored securely with restricted access. These documents are reviewed only by authorised SEAV administrators.</p>
<h2>5. Hiring Activity</h2>
<p>Records of job postings, candidate shortlists, application decisions and hiring outcomes are maintained on the platform. This information is used to improve matching accuracy and to maintain an audit trail of platform activity where required by law.</p>
<h2>6. Candidate Interactions</h2>
<p>Communications between your account and crew member profiles, including interview notes and offer exchanges conducted on the platform, are logged for security and dispute resolution purposes. Communications data is not shared with third parties.</p>
<h2>7. Data Sharing</h2>
<p>Your company name and posted positions are visible to registered crew members searching for work. Your full contact details are not shared publicly. SEAV does not sell employer data to third parties or share your information with advertisers.</p>
<h2>8. Security Measures</h2>
<p>All employer data is encrypted at rest using AES-256 and transmitted over TLS 1.3. Access to your account data is restricted to authorised SEAV personnel. We conduct regular penetration testing and security audits to protect your information.</p>
<h2>9. Data Retention</h2>
<p>Employer account data is retained for the lifetime of your account and for seven years following account closure to comply with maritime employment record-keeping requirements. You may request earlier deletion of non-statutory data at any time.</p>
<h2>10. Owner Rights</h2>
<p>As an employer account holder you have the right to access, rectify, and export your company data at any time through your account settings. To request data deletion or to exercise additional rights under applicable law contact privacy@seav.app.</p>
`.trim();

/* ---------------- date helpers ---------------- */

const isoAgo = (days: number) =>
  new Date(Date.now() - days * 86_400_000).toISOString();

/* ---------------- seed documents ---------------- */

export const seedLegalDocuments: LegalDocument[] = [
  {
    id: "crew-terms",
    documentType: "terms",
    userRole: "crew",
    title: "Crew Terms & Conditions",
    content: CREW_TERMS_HTML,
    status: "published",
    version: "1.2",
    createdAt: isoAgo(120),
    updatedAt: isoAgo(3),
    updatedBy: "Alex Marlowe",
    publishedAt: isoAgo(3),
  },
  {
    id: "crew-privacy",
    documentType: "privacy",
    userRole: "crew",
    title: "Crew Privacy Policy",
    content: CREW_PRIVACY_HTML,
    status: "published",
    version: "1.1",
    createdAt: isoAgo(120),
    updatedAt: isoAgo(7),
    updatedBy: "Sara Khan",
    publishedAt: isoAgo(7),
  },
  {
    id: "owner-terms",
    documentType: "terms",
    userRole: "owner",
    title: "Owner Terms & Conditions",
    content: OWNER_TERMS_HTML,
    status: "draft",
    version: "1.1",
    createdAt: isoAgo(110),
    updatedAt: isoAgo(1),
    updatedBy: "Alex Marlowe",
    publishedAt: isoAgo(18),
  },
  {
    id: "owner-privacy",
    documentType: "privacy",
    userRole: "owner",
    title: "Owner Privacy Policy",
    content: OWNER_PRIVACY_HTML,
    status: "published",
    version: "1.0",
    createdAt: isoAgo(110),
    updatedAt: isoAgo(21),
    updatedBy: "Alex Marlowe",
    publishedAt: isoAgo(21),
  },
];

/* ---------------- seed versions (immutable history) ---------------- */

export const seedLegalDocumentVersions: LegalDocumentVersion[] = [
  /* Crew terms — versions 1.0, 1.1 (1.2 is current) */
  {
    id: "crew-terms-v1.0",
    documentId: "crew-terms",
    version: "1.0",
    content: CREW_TERMS_HTML,
    status: "published",
    createdAt: isoAgo(90),
    createdBy: "Alex Marlowe",
    note: "Initial release",
  },
  {
    id: "crew-terms-v1.1",
    documentId: "crew-terms",
    version: "1.1",
    content: CREW_TERMS_HTML,
    status: "published",
    createdAt: isoAgo(45),
    createdBy: "Alex Marlowe",
    note: "Clarified §5 — application accuracy",
  },
  /* Crew privacy — version 1.0 (1.1 current) */
  {
    id: "crew-privacy-v1.0",
    documentId: "crew-privacy",
    version: "1.0",
    content: CREW_PRIVACY_HTML,
    status: "published",
    createdAt: isoAgo(60),
    createdBy: "Alex Marlowe",
    note: "Initial release",
  },
  /* Owner terms — version 1.0 (1.1 current draft) */
  {
    id: "owner-terms-v1.0",
    documentId: "owner-terms",
    version: "1.0",
    content: OWNER_TERMS_HTML,
    status: "published",
    createdAt: isoAgo(85),
    createdBy: "Alex Marlowe",
    note: "Initial release",
  },
];

export const LEGAL_DOC_IDS: LegalDocumentId[] = [
  "crew-terms",
  "crew-privacy",
  "owner-terms",
  "owner-privacy",
];
