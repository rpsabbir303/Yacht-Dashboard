/**
 * In-memory fixtures for the admin module.
 *
 * Scoped to what the admin actually needs to run the platform — crew,
 * vessel owners, jobs, applications, security, analytics and announcements.
 * Anything related to reports / fraud / disputes / moderation has been
 * removed: those systems don't exist on the platform yet.
 */
import { mockJobs } from "./mockData";
import type {
  ActiveSession,
  AdminAuditEntry,
  AnalyticsSnapshot,
  Announcement,
  ApplicationSummary,
  CrewProfile,
  OwnerProfile,
  SecurityEvent,
} from "@/types";

const now = new Date();
const iso = (offsetDays = 0, offsetHours = 0): string => {
  const d = new Date(now);
  d.setDate(d.getDate() + offsetDays);
  d.setHours(d.getHours() + offsetHours);
  return d.toISOString();
};

/* ----------------------------------------------------------------------
   CREW PROFILES
---------------------------------------------------------------------- */

export const mockCrewProfiles: CrewProfile[] = [
  {
    id: "crew_1",
    fullName: "Sophia Laurent",
    email: "sophia.l@yachtmail.io",
    avatarUrl:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=facearea&w=200&h=200&q=80",
    position: "chief-stewardess",
    nationality: "French",
    countryCode: "FR",
    location: "Antibes, France",
    status: "active",
    verificationStatus: "approved",
    joinedAt: iso(-220),
    lastActiveAt: iso(0, -2),
    bio: "Chief stewardess with 9 seasons aboard 50–80m motor yachts.",
    passport: { number: "FR8847123", country: "France", expiresAt: iso(720) },
    visas: [
      { country: "USA", expiresAt: iso(540), type: "B1/B2" },
      { country: "Schengen", expiresAt: iso(360), type: "Long-stay" },
    ],
    languages: ["English", "French", "Italian"],
    yearsExperience: 9,
    experience: [
      {
        yacht: "M/Y Aurora Borealis",
        yachtType: "motor",
        length: 72,
        role: "Chief Stewardess",
        from: iso(-820),
        to: iso(-60),
      },
      {
        yacht: "M/Y Cassiopeia",
        yachtType: "motor",
        length: 65,
        role: "2nd Stewardess",
        from: iso(-1300),
        to: iso(-840),
      },
    ],
    certifications: [
      {
        id: "c_1",
        name: "STCW Basic Training",
        issuer: "MCA",
        validUntil: iso(540),
        verified: true,
      },
      {
        id: "c_2",
        name: "ENG1 Medical",
        issuer: "MCA",
        validUntil: iso(220),
        verified: true,
      },
      {
        id: "c_3",
        name: "Food Safety Level 3",
        issuer: "RYA",
        validUntil: iso(700),
        verified: true,
      },
    ],
    references: [
      {
        id: "r_1",
        name: "Captain Adrien Vidal",
        role: "Captain",
        vessel: "M/Y Aurora Borealis",
        contact: "adrien@meridian-yachts.com",
        verified: true,
      },
      {
        id: "r_2",
        name: "Eleanor Brooks",
        role: "Purser",
        vessel: "M/Y Cassiopeia",
        contact: "eleanor.b@bluepearl.io",
        verified: false,
      },
    ],
    documents: [
      {
        id: "d_1",
        name: "Passport scan",
        kind: "passport",
        url: "https://images.unsplash.com/photo-1568633574956-c6566b4f5a09?auto=format&fit=crop&w=900&q=70",
        status: "verified",
        uploadedAt: iso(-200),
      },
      {
        id: "d_2",
        name: "STCW Certificate",
        kind: "certification",
        url: "https://images.unsplash.com/photo-1554224155-1696413565d3?auto=format&fit=crop&w=900&q=70",
        status: "verified",
        uploadedAt: iso(-180),
      },
    ],
    availability: "available",
    availableFrom: iso(7),
    profileCompletion: 96,
    applicationsCount: 14,
    hiresCount: 3,
    rating: 4.9,
  },
  {
    id: "crew_2",
    fullName: "James O'Connor",
    email: "james.o@yachtmail.io",
    avatarUrl:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&w=200&h=200&q=80",
    position: "captain",
    nationality: "Irish",
    countryCode: "IE",
    location: "Palma de Mallorca, Spain",
    status: "active",
    verificationStatus: "pending",
    joinedAt: iso(-410),
    lastActiveAt: iso(-1),
    bio: "Yachtmaster Ocean with 14 years on private and charter vessels up to 80m.",
    passport: { number: "IE5512902", country: "Ireland", expiresAt: iso(820) },
    visas: [{ country: "USA", expiresAt: iso(412), type: "B1/B2" }],
    languages: ["English", "Spanish"],
    yearsExperience: 14,
    experience: [
      {
        yacht: "M/Y Atlas",
        yachtType: "motor",
        length: 60,
        role: "Captain",
        from: iso(-400),
        to: iso(-12),
      },
    ],
    certifications: [
      {
        id: "c_4",
        name: "Yachtmaster Ocean",
        issuer: "RYA",
        validUntil: iso(720),
        verified: false,
      },
      {
        id: "c_5",
        name: "STCW HELM",
        issuer: "MCA",
        validUntil: iso(440),
        verified: true,
      },
    ],
    references: [
      {
        id: "r_3",
        name: "Sarah Mendelson",
        role: "Operations Manager",
        vessel: "Mendelson Yachting",
        contact: "sarah@mendelson-yachts.com",
        verified: false,
      },
    ],
    documents: [
      {
        id: "d_3",
        name: "Yachtmaster cert",
        kind: "certification",
        url: "https://images.unsplash.com/photo-1554224155-1696413565d3?auto=format&fit=crop&w=900&q=70",
        status: "pending",
        uploadedAt: iso(-3),
      },
    ],
    availability: "available",
    availableFrom: iso(14),
    profileCompletion: 78,
    applicationsCount: 28,
    hiresCount: 6,
    rating: 4.8,
  },
  {
    id: "crew_3",
    fullName: "Marco Bianchi",
    email: "marco.b@yachtmail.io",
    avatarUrl:
      "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=facearea&w=200&h=200&q=80",
    position: "chef",
    nationality: "Italian",
    countryCode: "IT",
    location: "Naples, Italy",
    status: "active",
    verificationStatus: "approved",
    joinedAt: iso(-310),
    lastActiveAt: iso(0, -6),
    bio: "Mediterranean cuisine specialist, ex-Michelin sous chef.",
    passport: { number: "IT7740921", country: "Italy", expiresAt: iso(900) },
    visas: [],
    languages: ["English", "Italian"],
    yearsExperience: 7,
    experience: [
      {
        yacht: "S/Y Northern Crown",
        yachtType: "sail",
        length: 46,
        role: "Sole Chef",
        from: iso(-300),
        to: iso(-30),
      },
    ],
    certifications: [
      {
        id: "c_6",
        name: "Food Safety Level 3",
        issuer: "RYA",
        validUntil: iso(540),
        verified: true,
      },
      {
        id: "c_7",
        name: "HACCP",
        issuer: "MCA",
        validUntil: iso(640),
        verified: true,
      },
    ],
    references: [],
    documents: [
      {
        id: "d_4",
        name: "Passport scan",
        kind: "passport",
        url: "https://images.unsplash.com/photo-1568633574956-c6566b4f5a09?auto=format&fit=crop&w=900&q=70",
        status: "verified",
        uploadedAt: iso(-300),
      },
    ],
    availability: "on-contract",
    profileCompletion: 88,
    applicationsCount: 9,
    hiresCount: 2,
    rating: 4.7,
  },
  {
    id: "crew_4",
    fullName: "Anya Volkov",
    email: "anya.v@yachtmail.io",
    avatarUrl:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=facearea&w=200&h=200&q=80",
    position: "engineer",
    nationality: "Russian",
    countryCode: "RU",
    location: "Tivat, Montenegro",
    status: "pending-verification",
    verificationStatus: "in-review",
    joinedAt: iso(-22),
    lastActiveAt: iso(0, -2),
    passport: { number: "RU0040482", country: "Russia", expiresAt: iso(1100) },
    visas: [{ country: "Schengen", expiresAt: iso(300), type: "Short-stay" }],
    languages: ["English", "Russian", "German"],
    yearsExperience: 11,
    experience: [
      {
        yacht: "M/Y Octavia",
        yachtType: "motor",
        length: 85,
        role: "2nd Engineer",
        from: iso(-1200),
        to: iso(-200),
      },
    ],
    certifications: [
      {
        id: "c_8",
        name: "MEOL (Y)",
        issuer: "MCA",
        validUntil: iso(640),
        verified: false,
      },
    ],
    references: [],
    documents: [
      {
        id: "d_5",
        name: "MEOL certificate",
        kind: "certification",
        url: "https://images.unsplash.com/photo-1554224155-1696413565d3?auto=format&fit=crop&w=900&q=70",
        status: "pending",
        uploadedAt: iso(-3),
      },
      {
        id: "d_6",
        name: "Schengen visa",
        kind: "visa",
        url: "https://images.unsplash.com/photo-1554224154-26032cdc0c11?auto=format&fit=crop&w=900&q=70",
        status: "pending",
        uploadedAt: iso(-3),
      },
    ],
    availability: "available",
    availableFrom: iso(30),
    profileCompletion: 62,
    applicationsCount: 4,
    hiresCount: 0,
  },
  {
    id: "crew_5",
    fullName: "Élodie Brun",
    email: "elodie@yachtmail.io",
    avatarUrl:
      "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=facearea&w=200&h=200&q=80",
    position: "chief-officer",
    nationality: "French",
    countryCode: "FR",
    location: "Cannes, France",
    status: "active",
    verificationStatus: "approved",
    joinedAt: iso(-540),
    lastActiveAt: iso(-1),
    passport: { number: "FR4490211", country: "France", expiresAt: iso(660) },
    visas: [{ country: "USA", expiresAt: iso(440), type: "B1/B2" }],
    languages: ["English", "French"],
    yearsExperience: 12,
    experience: [],
    certifications: [
      {
        id: "c_9",
        name: "OOW 3000gt",
        issuer: "MCA",
        validUntil: iso(880),
        verified: true,
      },
    ],
    references: [],
    documents: [],
    availability: "unavailable",
    profileCompletion: 91,
    applicationsCount: 16,
    hiresCount: 4,
    rating: 4.85,
  },
  {
    id: "crew_6",
    fullName: "Mateo Ríos",
    email: "mateo@yachtmail.io",
    avatarUrl:
      "https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=facearea&w=200&h=200&q=80",
    position: "deckhand",
    nationality: "Spanish",
    countryCode: "ES",
    location: "Barcelona, Spain",
    status: "suspended",
    verificationStatus: "rejected",
    joinedAt: iso(-95),
    lastActiveAt: iso(-15),
    passport: { number: "ES1124092", country: "Spain", expiresAt: iso(1200) },
    visas: [],
    languages: ["English", "Spanish"],
    yearsExperience: 2,
    experience: [],
    certifications: [
      {
        id: "c_10",
        name: "STCW Basic",
        issuer: "MCA",
        validUntil: iso(720),
        verified: false,
      },
    ],
    references: [],
    documents: [],
    availability: "unavailable",
    profileCompletion: 48,
    applicationsCount: 6,
    hiresCount: 0,
  },
];

/* ----------------------------------------------------------------------
   OWNER PROFILES
---------------------------------------------------------------------- */

export const mockOwnerProfiles: OwnerProfile[] = [
  {
    id: "u_owner_1",
    fullName: "Alex Marlowe",
    email: "alex@meridian-yachts.com",
    avatarUrl:
      "https://images.unsplash.com/photo-1607746882042-944635dfe10e?auto=format&fit=facearea&w=200&h=200&q=80",
    companyName: "Meridian Yachting Group",
    vatNumber: "FR-2244122-MY",
    country: "France",
    countryCode: "FR",
    status: "active",
    verificationStatus: "approved",
    joinedAt: iso(-540),
    lastActiveAt: iso(0, -1),
    vessels: [
      {
        id: "ves_1",
        name: "M/Y Aurora Borealis",
        type: "motor",
        length: 72,
        flag: "Cayman Islands",
        yearBuilt: 2019,
        imageUrl:
          "https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?auto=format&fit=crop&w=1200&q=80",
      },
      {
        id: "ves_2",
        name: "M/Y Cassiopeia",
        type: "motor",
        length: 65,
        flag: "Malta",
        yearBuilt: 2016,
        imageUrl:
          "https://images.unsplash.com/photo-1610631066894-62452ccb927c?auto=format&fit=crop&w=1200&q=80",
      },
    ],
    documents: [
      {
        id: "od_1",
        name: "Business registration",
        kind: "business-registration",
        url: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=900&q=70",
        status: "verified",
        uploadedAt: iso(-500),
      },
      {
        id: "od_2",
        name: "M/Y Aurora — registration",
        kind: "vessel-registration",
        url: "https://images.unsplash.com/photo-1559825481-12a05cc00344?auto=format&fit=crop&w=900&q=70",
        status: "verified",
        uploadedAt: iso(-490),
      },
    ],
    jobsPostedCount: 12,
    hiresMadeCount: 7,
    profileCompletion: 98,
  },
  {
    id: "u_owner_2",
    fullName: "Nora Castellan",
    email: "n.castellan@blueyacht.com",
    avatarUrl:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&w=200&h=200&q=80",
    companyName: "Blue Yacht Holdings",
    vatNumber: "MC-887741-BY",
    country: "Monaco",
    countryCode: "MC",
    status: "pending-verification",
    verificationStatus: "in-review",
    joinedAt: iso(-32),
    lastActiveAt: iso(-1),
    vessels: [
      {
        id: "ves_3",
        name: "M/Y Saltire",
        type: "motor",
        length: 58,
        flag: "Marshall Islands",
        yearBuilt: 2021,
        imageUrl:
          "https://images.unsplash.com/photo-1559825481-12a05cc00344?auto=format&fit=crop&w=1200&q=80",
      },
    ],
    documents: [
      {
        id: "od_3",
        name: "Company registration",
        kind: "business-registration",
        url: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=900&q=70",
        status: "verified",
        uploadedAt: iso(-30),
      },
      {
        id: "od_4",
        name: "M/Y Saltire — registration",
        kind: "vessel-registration",
        url: "https://images.unsplash.com/photo-1559825481-12a05cc00344?auto=format&fit=crop&w=900&q=70",
        status: "pending",
        uploadedAt: iso(-12),
      },
      {
        id: "od_5",
        name: "Hull & machinery insurance",
        kind: "insurance",
        url: "https://images.unsplash.com/photo-1554224154-26032cdc0c11?auto=format&fit=crop&w=900&q=70",
        status: "pending",
        uploadedAt: iso(-12),
      },
    ],
    jobsPostedCount: 3,
    hiresMadeCount: 0,
    profileCompletion: 74,
  },
  {
    id: "u_owner_3",
    fullName: "Henrik Lindqvist",
    email: "henrik@lindqvist-yachting.se",
    avatarUrl:
      "https://images.unsplash.com/photo-1542178243-bc20204b769f?auto=format&fit=facearea&w=200&h=200&q=80",
    companyName: "Lindqvist Yachting AB",
    vatNumber: "SE-449112",
    country: "Sweden",
    countryCode: "SE",
    status: "active",
    verificationStatus: "approved",
    joinedAt: iso(-300),
    lastActiveAt: iso(-3),
    vessels: [
      {
        id: "ves_4",
        name: "S/Y Northern Crown",
        type: "sail",
        length: 46,
        flag: "Malta",
        yearBuilt: 2015,
        imageUrl:
          "https://images.unsplash.com/photo-1599839952773-eb20df8b8c92?auto=format&fit=crop&w=1200&q=80",
      },
    ],
    documents: [
      {
        id: "od_6",
        name: "Business registration",
        kind: "business-registration",
        url: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=900&q=70",
        status: "verified",
        uploadedAt: iso(-290),
      },
    ],
    jobsPostedCount: 5,
    hiresMadeCount: 3,
    profileCompletion: 92,
  },
  {
    id: "u_owner_4",
    fullName: "Karim Wallach",
    email: "kw@blueocean-charters.com",
    avatarUrl:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&w=200&h=200&q=80",
    companyName: "Blue Ocean Charters",
    country: "Lebanon",
    countryCode: "LB",
    status: "pending-verification",
    verificationStatus: "additional-info",
    joinedAt: iso(-22),
    lastActiveAt: iso(-2),
    vessels: [
      {
        id: "ves_5",
        name: "M/Y Mistral",
        type: "motor",
        length: 38,
        flag: "Lebanon",
        yearBuilt: 2010,
        imageUrl:
          "https://images.unsplash.com/photo-1505739679850-7adf8385f88c?auto=format&fit=crop&w=1200&q=80",
      },
    ],
    documents: [
      {
        id: "od_7",
        name: "Business registration",
        kind: "business-registration",
        url: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=900&q=70",
        status: "pending",
        uploadedAt: iso(-22),
      },
    ],
    jobsPostedCount: 2,
    hiresMadeCount: 0,
    profileCompletion: 55,
    notes: "Please upload a clearer copy of the vessel registration document.",
  },
];

/* ----------------------------------------------------------------------
   APPLICATIONS
---------------------------------------------------------------------- */

export const mockApplications: ApplicationSummary[] = [
  {
    id: "app_1",
    candidate: {
      id: "crew_1",
      fullName: "Sophia Laurent",
      avatarUrl: mockCrewProfiles[0].avatarUrl,
      position: "chief-stewardess",
      nationality: "French",
      yearsExperience: 9,
    },
    job: {
      id: mockJobs[0].id,
      title: mockJobs[0].title,
      yacht: mockJobs[0].yacht.name,
      location: mockJobs[0].location,
    },
    owner: {
      id: "u_owner_1",
      name: "Alex Marlowe",
      avatarUrl: mockOwnerProfiles[0].avatarUrl,
    },
    status: "shortlisted",
    matchScore: 92,
    appliedAt: iso(-2),
    updatedAt: iso(-1, -2),
    coverLetter:
      "I've spent the last 4 years running interior teams on similar 70m+ yachts and would love to bring that experience to Aurora Borealis.",
  },
  {
    id: "app_2",
    candidate: {
      id: "crew_2",
      fullName: "James O'Connor",
      avatarUrl: mockCrewProfiles[1].avatarUrl,
      position: "captain",
      nationality: "Irish",
      yearsExperience: 14,
    },
    job: {
      id: mockJobs[1].id,
      title: mockJobs[1].title,
      yacht: mockJobs[1].yacht.name,
      location: mockJobs[1].location,
    },
    owner: {
      id: "u_owner_1",
      name: "Alex Marlowe",
      avatarUrl: mockOwnerProfiles[0].avatarUrl,
    },
    status: "interviewing",
    matchScore: 88,
    appliedAt: iso(-5),
    updatedAt: iso(-1),
  },
  {
    id: "app_3",
    candidate: {
      id: "crew_3",
      fullName: "Marco Bianchi",
      avatarUrl: mockCrewProfiles[2].avatarUrl,
      position: "chef",
      nationality: "Italian",
      yearsExperience: 7,
    },
    job: {
      id: mockJobs[2].id,
      title: mockJobs[2].title,
      yacht: mockJobs[2].yacht.name,
      location: mockJobs[2].location,
    },
    owner: {
      id: "u_owner_3",
      name: "Henrik Lindqvist",
      avatarUrl: mockOwnerProfiles[2].avatarUrl,
    },
    status: "pending",
    matchScore: 76,
    appliedAt: iso(-1, -4),
    updatedAt: iso(-1, -4),
  },
  {
    id: "app_4",
    candidate: {
      id: "crew_5",
      fullName: "Élodie Brun",
      avatarUrl: mockCrewProfiles[4].avatarUrl,
      position: "chief-officer",
      nationality: "French",
      yearsExperience: 12,
    },
    job: {
      id: mockJobs[1].id,
      title: mockJobs[1].title,
      yacht: mockJobs[1].yacht.name,
      location: mockJobs[1].location,
    },
    owner: {
      id: "u_owner_1",
      name: "Alex Marlowe",
      avatarUrl: mockOwnerProfiles[0].avatarUrl,
    },
    status: "accepted",
    matchScore: 95,
    appliedAt: iso(-10),
    updatedAt: iso(-3),
  },
  {
    id: "app_5",
    candidate: {
      id: "crew_4",
      fullName: "Anya Volkov",
      avatarUrl: mockCrewProfiles[3].avatarUrl,
      position: "engineer",
      nationality: "Russian",
      yearsExperience: 11,
    },
    job: {
      id: mockJobs[1].id,
      title: mockJobs[1].title,
      yacht: mockJobs[1].yacht.name,
      location: mockJobs[1].location,
    },
    owner: {
      id: "u_owner_1",
      name: "Alex Marlowe",
      avatarUrl: mockOwnerProfiles[0].avatarUrl,
    },
    status: "rejected",
    matchScore: 64,
    appliedAt: iso(-7),
    updatedAt: iso(-5),
  },
  {
    id: "app_6",
    candidate: {
      id: "crew_6",
      fullName: "Mateo Ríos",
      avatarUrl: mockCrewProfiles[5].avatarUrl,
      position: "deckhand",
      nationality: "Spanish",
      yearsExperience: 2,
    },
    job: {
      id: mockJobs[3].id,
      title: mockJobs[3].title,
      yacht: mockJobs[3].yacht.name,
      location: mockJobs[3].location,
    },
    owner: {
      id: "u_owner_3",
      name: "Henrik Lindqvist",
      avatarUrl: mockOwnerProfiles[2].avatarUrl,
    },
    status: "pending",
    matchScore: 54,
    appliedAt: iso(-1, -6),
    updatedAt: iso(-1, -6),
  },
];

/* ----------------------------------------------------------------------
   ANNOUNCEMENTS
---------------------------------------------------------------------- */

export const mockAnnouncements: Announcement[] = [
  {
    id: "an_1",
    title: "New verification requirements for owners",
    body: "From November onward all yacht owners need to submit a current insurance certificate alongside their vessel registration before posting jobs.",
    audience: "owners-captains",
    channels: ["in-app", "email"],
    status: "sent",
    sentAt: iso(-2),
    createdAt: iso(-2, -1),
    createdBy: { id: "u_owner_1", name: "Alex Marlowe" },
    deliveredCount: 1284,
    openRate: 0.58,
  },
  {
    id: "an_2",
    title: "Mediterranean season briefing",
    body: "We're hosting a virtual briefing for crew preparing for the Med season — covering schedules, visa renewals and certifications.",
    audience: "crew",
    channels: ["in-app", "push"],
    status: "sent",
    sentAt: iso(-10),
    createdAt: iso(-10, -3),
    createdBy: { id: "u_owner_1", name: "Alex Marlowe" },
    deliveredCount: 4210,
    openRate: 0.46,
  },
  {
    id: "an_3",
    title: "Platform maintenance window — Sunday 02:00 UTC",
    body: "Brief maintenance window — the platform will be unavailable for up to 20 minutes while we deploy infrastructure updates.",
    audience: "all",
    channels: ["in-app"],
    status: "scheduled",
    scheduledFor: iso(3),
    createdAt: iso(-1),
    createdBy: { id: "u_owner_1", name: "Alex Marlowe" },
  },
];

/* ----------------------------------------------------------------------
   ANALYTICS
---------------------------------------------------------------------- */

export const mockAnalytics: AnalyticsSnapshot = {
  users: {
    total: 8742,
    crew: 5310,
    owners: 2150,
    active30d: 5183,
    newThisWeek: 184,
    verificationRate: 0.74,
    byRole: [
      { role: "captain", count: 4920 },
      { role: "owner", count: 2150 },
      { role: "agent", count: 1240 },
      { role: "admin", count: 432 },
    ],
    growth: [
      { d: "Wk 1", users: 7820 },
      { d: "Wk 2", users: 8014 },
      { d: "Wk 3", users: 8210 },
      { d: "Wk 4", users: 8388 },
      { d: "Wk 5", users: 8530 },
      { d: "Wk 6", users: 8615 },
      { d: "Wk 7", users: 8742 },
    ],
  },
  jobs: {
    active: 412,
    filled: 198,
    expired: 67,
    avgTimeToFillDays: 9.4,
  },
  applications: {
    total: 2104,
    pending: 642,
    accepted: 198,
    rejected: 488,
  },
  engagement: {
    dailyActivity: [
      { d: "Mon", sessions: 1820, applications: 280 },
      { d: "Tue", sessions: 2014, applications: 311 },
      { d: "Wed", sessions: 2330, applications: 342 },
      { d: "Thu", sessions: 2210, applications: 296 },
      { d: "Fri", sessions: 2540, applications: 405 },
      { d: "Sat", sessions: 1980, applications: 251 },
      { d: "Sun", sessions: 1720, applications: 219 },
    ],
  },
};

/* ----------------------------------------------------------------------
   SECURITY
---------------------------------------------------------------------- */

export const mockSecurityEvents: SecurityEvent[] = [
  {
    id: "se_1",
    kind: "login-failed",
    user: {
      id: "u_susp_1",
      name: "Karim Wallach",
      email: "kw@blueocean-charters.com",
    },
    ip: "5.62.144.18",
    device: "Chrome / Windows",
    country: "Lebanon",
    risk: "high",
    createdAt: iso(0, -1),
  },
  {
    id: "se_2",
    kind: "suspicious-login",
    user: {
      id: "crew_2",
      name: "James O'Connor",
      email: "james.o@yachtmail.io",
    },
    ip: "104.28.4.21",
    device: "Safari / iOS",
    country: "Russia",
    risk: "high",
    createdAt: iso(0, -3),
  },
  {
    id: "se_3",
    kind: "login-success",
    user: {
      id: "u_owner_1",
      name: "Alex Marlowe",
      email: "alex@meridian-yachts.com",
    },
    ip: "82.65.220.18",
    device: "Chrome / macOS",
    country: "France",
    risk: "low",
    createdAt: iso(-1),
  },
  {
    id: "se_4",
    kind: "password-reset",
    user: {
      id: "crew_1",
      name: "Sophia Laurent",
      email: "sophia.l@yachtmail.io",
    },
    ip: "188.122.42.18",
    device: "Firefox / Windows",
    country: "France",
    risk: "low",
    createdAt: iso(-2),
  },
  {
    id: "se_5",
    kind: "mfa-enabled",
    user: {
      id: "u_owner_3",
      name: "Henrik Lindqvist",
      email: "henrik@lindqvist-yachting.se",
    },
    ip: "212.85.10.18",
    device: "Chrome / Windows",
    country: "Sweden",
    risk: "low",
    createdAt: iso(-3),
  },
];

export const mockAuditTrail: AdminAuditEntry[] = [
  {
    id: "au_1",
    admin: { id: "u_owner_1", name: "Alex Marlowe", role: "super-admin" },
    action: "Approved crew verification",
    target: { type: "crew", id: "crew_1", label: "Sophia Laurent" },
    createdAt: iso(0, -2),
  },
  {
    id: "au_2",
    admin: { id: "u_owner_1", name: "Alex Marlowe", role: "super-admin" },
    action: "Approved owner verification",
    target: { type: "owner", id: "u_owner_3", label: "Henrik Lindqvist" },
    createdAt: iso(-1, -3),
  },
  {
    id: "au_3",
    admin: { id: "u_owner_1", name: "Alex Marlowe", role: "super-admin" },
    action: "Requested additional info",
    target: { type: "owner", id: "u_owner_4", label: "Karim Wallach" },
    createdAt: iso(-2),
  },
  {
    id: "au_4",
    admin: { id: "u_owner_1", name: "Alex Marlowe", role: "super-admin" },
    action: "Suspended crew account",
    target: { type: "crew", id: "crew_6", label: "Mateo Ríos" },
    createdAt: iso(-3),
  },
];

export const mockActiveSessions: ActiveSession[] = [
  {
    id: "ses_1",
    user: {
      id: "u_owner_1",
      name: "Alex Marlowe",
      email: "alex@meridian-yachts.com",
    },
    ip: "82.65.220.18",
    device: "Chrome / macOS",
    country: "France",
    startedAt: iso(0, -2),
    lastSeenAt: iso(0, -1),
  },
  {
    id: "ses_2",
    user: {
      id: "u_owner_3",
      name: "Henrik Lindqvist",
      email: "henrik@lindqvist-yachting.se",
    },
    ip: "212.85.10.18",
    device: "Chrome / Windows",
    country: "Sweden",
    startedAt: iso(-1),
    lastSeenAt: iso(0, -4),
  },
  {
    id: "ses_3",
    user: {
      id: "moderator_1",
      name: "Sara Khan",
      email: "sara.k@meridian-yachts.com",
    },
    ip: "82.66.18.214",
    device: "Edge / Windows",
    country: "France",
    startedAt: iso(0, -1),
    lastSeenAt: iso(0, 0),
  },
];
