/**
 * Mock fixtures used by the RTK Query base API in lieu of a real backend.
 * Centralising them keeps every module wired against realistic data shapes,
 * so swapping in real HTTP endpoints later is a one-file change in
 * `services/baseApi.ts`.
 */
import type {
  Application,
  AppNotification,
  ChatMessage,
  Conversation,
  CrewMember,
  Job,
  ScheduleEvent,
  User,
} from "@/types";

const now = new Date();
const iso = (offsetDays = 0, offsetHours = 0): string => {
  const d = new Date(now);
  d.setDate(d.getDate() + offsetDays);
  d.setHours(d.getHours() + offsetHours);
  return d.toISOString();
};

/* ---------------- USER ---------------- */
/**
 * Demo user — owner persona that also holds the highest admin tier so the
 * dashboard demonstrates both the consumer and admin flows out of the box.
 */
export const mockUser: User = {
  id: "u_owner_1",
  email: "alex@meridian-yachts.com",
  fullName: "Alex Marlowe",
  role: "owner",
  adminRole: "super-admin",
  avatarUrl:
    "https://images.unsplash.com/photo-1607746882042-944635dfe10e?auto=format&fit=facearea&w=256&h=256&q=80",
  companyName: "Meridian Yachting Group",
  phone: "+33 6 12 34 56 78",
  countryCode: "FR",
  createdAt: iso(-180),
};

/* ---------------- JOBS ---------------- */
export const mockJobs: Job[] = [
  {
    id: "job_1",
    title: "Chief Stewardess — M/Y Aurora Borealis",
    position: "chief-stewardess",
    status: "open",
    contractType: "permanent",
    yacht: {
      name: "M/Y Aurora Borealis",
      length: 72,
      type: "motor",
      flag: "Cayman Islands",
      imageUrl:
        "https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?auto=format&fit=crop&w=1200&q=80",
    },
    description:
      "We are seeking an exceptional Chief Stewardess to lead an interior team of five on a private 72m motor yacht based in the Western Mediterranean.",
    responsibilities: [
      "Lead and mentor the interior team",
      "Oversee provisioning, service and guest experience",
      "Manage budgets and supplier relationships",
    ],
    requirements: [
      "Minimum 5 years on yachts above 50m",
      "Previous role as Chief or 2nd Stewardess",
      "Impeccable English communication",
    ],
    certifications: ["stcw", "eng1", "pya-guest", "wset-2"],
    languages: ["en", "fr"],
    salary: { currency: "EUR", min: 6500, max: 7500, period: "monthly" },
    location: "Antibes, France",
    startDate: iso(21),
    applicationsCount: 24,
    shortlistedCount: 6,
    postedById: mockUser.id,
    createdAt: iso(-12),
    updatedAt: iso(-2),
  },
  {
    id: "job_2",
    title: "Captain — S/Y Equinox",
    position: "captain",
    status: "open",
    contractType: "rotational",
    yacht: {
      name: "S/Y Equinox",
      length: 48,
      type: "sail",
      flag: "Malta",
      imageUrl:
        "https://images.unsplash.com/photo-1559825481-12a05cc00344?auto=format&fit=crop&w=1200&q=80",
    },
    description:
      "Experienced sailing yacht Captain wanted for a Mediterranean & Caribbean program. Rotational position with 2:2 schedule.",
    responsibilities: [
      "Full safe operation of vessel",
      "Crew leadership and development",
      "Owner & guest liaison",
    ],
    requirements: [
      "Master 3000GT or higher",
      "10+ years on sailing yachts",
      "Spotless safety record",
    ],
    certifications: ["yachtmaster-ocean", "stcw", "eng1"],
    languages: ["en", "it"],
    salary: { currency: "EUR", min: 12000, max: 14000, period: "monthly" },
    location: "Palma de Mallorca, Spain",
    startDate: iso(35),
    applicationsCount: 11,
    shortlistedCount: 3,
    postedById: mockUser.id,
    createdAt: iso(-8),
    updatedAt: iso(-1),
  },
  {
    id: "job_3",
    title: "Sous Chef — M/Y Black Pearl",
    position: "sous-chef",
    status: "paused",
    contractType: "seasonal",
    yacht: {
      name: "M/Y Black Pearl",
      length: 56,
      type: "motor",
      flag: "Marshall Islands",
      imageUrl:
        "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&w=1200&q=80",
    },
    description:
      "Looking for a creative Sous Chef to support our Head Chef during the summer Mediterranean season.",
    responsibilities: [
      "Mise en place & service",
      "Crew meals on rotation",
      "Provisioning support",
    ],
    requirements: [
      "Culinary school diploma",
      "3+ years yacht experience preferred",
      "Allergen & dietary fluency",
    ],
    certifications: ["stcw", "eng1", "food-hygiene-3"],
    languages: ["en"],
    salary: { currency: "EUR", min: 4800, max: 5500, period: "monthly" },
    location: "Monaco",
    startDate: iso(10),
    endDate: iso(150),
    applicationsCount: 7,
    shortlistedCount: 2,
    postedById: mockUser.id,
    createdAt: iso(-20),
    updatedAt: iso(-5),
  },
  {
    id: "job_4",
    title: "Deckhand — M/Y Sea Cadence",
    position: "deckhand",
    status: "closed",
    contractType: "permanent",
    yacht: {
      name: "M/Y Sea Cadence",
      length: 42,
      type: "motor",
      flag: "British Virgin Islands",
      imageUrl:
        "https://images.unsplash.com/photo-1488376739369-1003a1f59ca5?auto=format&fit=crop&w=1200&q=80",
    },
    description:
      "Entry-level deckhand position on a private 42m yacht with a busy Mediterranean program.",
    responsibilities: [
      "Exterior maintenance",
      "Tender driving",
      "Water sports support",
    ],
    requirements: ["STCW Basic Safety", "ENG1", "Powerboat Level 2"],
    certifications: ["stcw", "eng1", "powerboat-2", "tender"],
    languages: ["en"],
    salary: { currency: "EUR", min: 2800, max: 3200, period: "monthly" },
    location: "Genoa, Italy",
    startDate: iso(-15),
    applicationsCount: 32,
    shortlistedCount: 8,
    postedById: mockUser.id,
    createdAt: iso(-45),
    updatedAt: iso(-15),
  },
];

/* ---------------- CREW ---------------- */
export const mockCrew: CrewMember[] = [
  {
    id: "crew_1",
    fullName: "Sophia Laurent",
    headline: "Chief Stewardess · 8 yrs · 60–80m",
    position: "chief-stewardess",
    secondaryPositions: ["purser"],
    yearsOfExperience: 8,
    availability: "available-now",
    availableFrom: iso(2),
    location: "Antibes, France",
    nationality: "French",
    languages: ["en", "fr", "es"],
    certifications: [
      {
        id: "c1",
        name: "STCW Basic Safety",
        issuedBy: "MCA",
        issuedOn: iso(-1200),
      },
      {
        id: "c2",
        name: "PYA GUEST Programme",
        issuedBy: "PYA",
        issuedOn: iso(-800),
      },
      { id: "c3", name: "WSET Level 2", issuedBy: "WSET", issuedOn: iso(-400) },
    ],
    experience: [
      {
        id: "e1",
        yachtName: "M/Y Tranquility",
        yachtLength: 78,
        position: "chief-stewardess",
        from: iso(-900),
        to: iso(-90),
      },
    ],
    rating: 4.9,
    reviewsCount: 14,
    avatarUrl:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=facearea&w=256&h=256&q=80",
    bio: "Service-driven Chief Stewardess with a passion for elevated guest experience and team development.",
    hourlyRate: 45,
    currency: "EUR",
    verified: true,
    saved: true,
  },
  {
    id: "crew_2",
    fullName: "James O'Connor",
    headline: "Captain · 200GT · 15 yrs",
    position: "captain",
    secondaryPositions: ["chief-officer"],
    yearsOfExperience: 15,
    availability: "available-soon",
    availableFrom: iso(28),
    location: "Palma de Mallorca, Spain",
    nationality: "Irish",
    languages: ["en", "es"],
    certifications: [
      {
        id: "c4",
        name: "Yachtmaster Ocean",
        issuedBy: "RYA",
        issuedOn: iso(-2400),
      },
    ],
    experience: [
      {
        id: "e2",
        yachtName: "S/Y Wind Spirit",
        yachtLength: 52,
        position: "captain",
        from: iso(-1800),
        to: iso(-60),
      },
    ],
    rating: 4.8,
    reviewsCount: 22,
    avatarUrl:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&w=256&h=256&q=80",
    bio: "Safety-first Captain with a calm command style and strong owner relationships.",
    verified: true,
  },
  {
    id: "crew_3",
    fullName: "Marco Bianchi",
    headline: "Chef · Michelin background · 6 yrs",
    position: "chef",
    secondaryPositions: ["sous-chef"],
    yearsOfExperience: 6,
    availability: "available-now",
    availableFrom: iso(5),
    location: "Genoa, Italy",
    nationality: "Italian",
    languages: ["en", "it", "fr"],
    certifications: [
      {
        id: "c5",
        name: "Food Hygiene Level 3",
        issuedBy: "RSPH",
        issuedOn: iso(-700),
      },
    ],
    experience: [
      {
        id: "e3",
        yachtName: "M/Y Aria",
        yachtLength: 65,
        position: "chef",
        from: iso(-1100),
        to: iso(-30),
      },
    ],
    rating: 4.7,
    reviewsCount: 9,
    avatarUrl:
      "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=facearea&w=256&h=256&q=80",
    bio: "Mediterranean and Asian cuisine specialist with a Michelin two-star background.",
    verified: true,
  },
  {
    id: "crew_4",
    fullName: "Hannah Pierce",
    headline: "Second Stewardess · 4 yrs",
    position: "stewardess",
    secondaryPositions: [],
    yearsOfExperience: 4,
    availability: "on-board",
    location: "Fort Lauderdale, USA",
    nationality: "American",
    languages: ["en"],
    certifications: [
      {
        id: "c6",
        name: "PYA GUEST Programme",
        issuedBy: "PYA",
        issuedOn: iso(-300),
      },
    ],
    experience: [],
    rating: 4.6,
    reviewsCount: 5,
    avatarUrl:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=facearea&w=256&h=256&q=80",
    bio: "Detail-obsessed interior crew with mixology and floral arrangement skills.",
    verified: false,
  },
  {
    id: "crew_5",
    fullName: "Dimitri Volkov",
    headline: "Chief Engineer · Y2 · 12 yrs",
    position: "engineer",
    secondaryPositions: [],
    yearsOfExperience: 12,
    availability: "available-soon",
    availableFrom: iso(45),
    location: "Athens, Greece",
    nationality: "Greek",
    languages: ["en", "el", "ru"],
    certifications: [
      { id: "c7", name: "AEC 1 & 2", issuedBy: "MCA", issuedOn: iso(-2000) },
    ],
    experience: [],
    rating: 4.9,
    reviewsCount: 18,
    avatarUrl:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=facearea&w=256&h=256&q=80",
    bio: "Engineer with hybrid propulsion and refit project experience.",
    verified: true,
  },
  {
    id: "crew_6",
    fullName: "Isabella Costa",
    headline: "Stewardess / Masseuse · 3 yrs",
    position: "spa-therapist",
    secondaryPositions: ["stewardess"],
    yearsOfExperience: 3,
    availability: "available-now",
    availableFrom: iso(0),
    location: "Lisbon, Portugal",
    nationality: "Portuguese",
    languages: ["en", "pt", "es"],
    certifications: [],
    experience: [],
    rating: 4.8,
    reviewsCount: 11,
    avatarUrl:
      "https://images.unsplash.com/photo-1542740348-39501cd6e2b4?auto=format&fit=facearea&w=256&h=256&q=80",
    bio: "Dual-role spa therapist & service crew, trained in deep tissue and Thai massage.",
    verified: true,
  },
];

/* ---------------- APPLICATIONS ---------------- */
export const mockApplications: Application[] = [
  {
    id: "app_1",
    job: {
      id: mockJobs[0].id,
      title: mockJobs[0].title,
      position: mockJobs[0].position,
      yacht: mockJobs[0].yacht,
    },
    crew: {
      id: mockCrew[0].id,
      fullName: mockCrew[0].fullName,
      position: mockCrew[0].position,
      avatarUrl: mockCrew[0].avatarUrl,
      rating: mockCrew[0].rating,
      location: mockCrew[0].location,
    },
    status: "shortlisted",
    message:
      "Available within 2 weeks. References from M/Y Tranquility available on request.",
    appliedAt: iso(-3),
    updatedAt: iso(-1),
    expectedSalary: 7000,
    availableFrom: iso(14),
  },
  {
    id: "app_2",
    job: {
      id: mockJobs[1].id,
      title: mockJobs[1].title,
      position: mockJobs[1].position,
      yacht: mockJobs[1].yacht,
    },
    crew: {
      id: mockCrew[1].id,
      fullName: mockCrew[1].fullName,
      position: mockCrew[1].position,
      avatarUrl: mockCrew[1].avatarUrl,
      rating: mockCrew[1].rating,
      location: mockCrew[1].location,
    },
    status: "interview",
    appliedAt: iso(-6),
    updatedAt: iso(-2),
    expectedSalary: 13000,
    availableFrom: iso(30),
  },
  {
    id: "app_3",
    job: {
      id: mockJobs[2].id,
      title: mockJobs[2].title,
      position: mockJobs[2].position,
      yacht: mockJobs[2].yacht,
    },
    crew: {
      id: mockCrew[2].id,
      fullName: mockCrew[2].fullName,
      position: mockCrew[2].position,
      avatarUrl: mockCrew[2].avatarUrl,
      rating: mockCrew[2].rating,
      location: mockCrew[2].location,
    },
    status: "new",
    appliedAt: iso(0, -2),
    updatedAt: iso(0, -2),
    expectedSalary: 5200,
  },
  {
    id: "app_4",
    job: {
      id: mockJobs[0].id,
      title: mockJobs[0].title,
      position: mockJobs[0].position,
      yacht: mockJobs[0].yacht,
    },
    crew: {
      id: mockCrew[3].id,
      fullName: mockCrew[3].fullName,
      position: mockCrew[3].position,
      avatarUrl: mockCrew[3].avatarUrl,
      rating: mockCrew[3].rating,
      location: mockCrew[3].location,
    },
    status: "new",
    appliedAt: iso(0, -5),
    updatedAt: iso(0, -5),
    expectedSalary: 4200,
  },
  {
    id: "app_5",
    job: {
      id: mockJobs[1].id,
      title: mockJobs[1].title,
      position: mockJobs[1].position,
      yacht: mockJobs[1].yacht,
    },
    crew: {
      id: mockCrew[4].id,
      fullName: mockCrew[4].fullName,
      position: mockCrew[4].position,
      avatarUrl: mockCrew[4].avatarUrl,
      rating: mockCrew[4].rating,
      location: mockCrew[4].location,
    },
    status: "accepted",
    appliedAt: iso(-12),
    updatedAt: iso(-3),
    expectedSalary: 11500,
  },
  {
    id: "app_6",
    job: {
      id: mockJobs[3].id,
      title: mockJobs[3].title,
      position: mockJobs[3].position,
      yacht: mockJobs[3].yacht,
    },
    crew: {
      id: mockCrew[5].id,
      fullName: mockCrew[5].fullName,
      position: mockCrew[5].position,
      avatarUrl: mockCrew[5].avatarUrl,
      rating: mockCrew[5].rating,
      location: mockCrew[5].location,
    },
    status: "rejected",
    appliedAt: iso(-25),
    updatedAt: iso(-10),
  },
];

/* ---------------- CHAT ---------------- */
export const mockConversations: Conversation[] = [
  {
    id: "conv_1",
    participants: [
      {
        id: mockCrew[0].id,
        name: mockCrew[0].fullName,
        avatarUrl: mockCrew[0].avatarUrl,
        role: "Chief Stewardess",
        online: true,
      },
    ],
    unreadCount: 2,
    pinned: true,
    jobId: mockJobs[0].id,
    updatedAt: iso(0, -1),
    lastMessage: {
      id: "msg_1_last",
      conversationId: "conv_1",
      senderId: mockCrew[0].id,
      text: "Thanks Alex — I'll send my updated CV today.",
      createdAt: iso(0, -1),
      status: "seen",
    },
  },
  {
    id: "conv_2",
    participants: [
      {
        id: mockCrew[1].id,
        name: mockCrew[1].fullName,
        avatarUrl: mockCrew[1].avatarUrl,
        role: "Captain",
        online: false,
        lastSeenAt: iso(0, -5),
      },
    ],
    unreadCount: 0,
    jobId: mockJobs[1].id,
    updatedAt: iso(-1),
    lastMessage: {
      id: "msg_2_last",
      conversationId: "conv_2",
      senderId: mockUser.id,
      text: "Confirmed — interview Thursday 10am CET.",
      createdAt: iso(-1),
      status: "delivered",
    },
  },
  {
    id: "conv_3",
    participants: [
      {
        id: mockCrew[2].id,
        name: mockCrew[2].fullName,
        avatarUrl: mockCrew[2].avatarUrl,
        role: "Chef",
        online: true,
      },
    ],
    unreadCount: 1,
    jobId: mockJobs[2].id,
    updatedAt: iso(-2),
    lastMessage: {
      id: "msg_3_last",
      conversationId: "conv_3",
      senderId: mockCrew[2].id,
      text: "I've sent some sample menus over for your review.",
      createdAt: iso(-2),
      status: "delivered",
    },
  },
  {
    id: "conv_4",
    participants: [
      {
        id: mockCrew[4].id,
        name: mockCrew[4].fullName,
        avatarUrl: mockCrew[4].avatarUrl,
        role: "Chief Engineer",
        online: false,
      },
    ],
    unreadCount: 0,
    updatedAt: iso(-4),
    lastMessage: {
      id: "msg_4_last",
      conversationId: "conv_4",
      senderId: mockUser.id,
      text: "Looking forward to working with you on the refit.",
      createdAt: iso(-4),
      status: "seen",
    },
  },
];

export const mockMessages: Record<string, ChatMessage[]> = {
  conv_1: [
    {
      id: "m1_1",
      conversationId: "conv_1",
      senderId: mockUser.id,
      text: "Hi Sophia, are you still available for our Aurora Borealis position?",
      createdAt: iso(0, -4),
      status: "seen",
    },
    {
      id: "m1_2",
      conversationId: "conv_1",
      senderId: mockCrew[0].id,
      text: "Hi Alex — yes, I can join in two weeks. Would love to learn more about the program.",
      createdAt: iso(0, -3),
      status: "seen",
    },
    {
      id: "m1_3",
      conversationId: "conv_1",
      senderId: mockUser.id,
      text: "Perfect. Med season then crossing to the Caribbean. Salary band 6500–7500 EUR.",
      createdAt: iso(0, -2),
      status: "seen",
    },
    {
      id: "m1_4",
      conversationId: "conv_1",
      senderId: mockCrew[0].id,
      text: "Thanks Alex — I'll send my updated CV today.",
      createdAt: iso(0, -1),
      status: "seen",
    },
  ],
  conv_2: [
    {
      id: "m2_1",
      conversationId: "conv_2",
      senderId: mockUser.id,
      text: "James, can we lock the interview for this week?",
      createdAt: iso(-2),
      status: "seen",
    },
    {
      id: "m2_2",
      conversationId: "conv_2",
      senderId: mockCrew[1].id,
      text: "Thursday morning works best for me.",
      createdAt: iso(-1, -2),
      status: "seen",
    },
    {
      id: "m2_3",
      conversationId: "conv_2",
      senderId: mockUser.id,
      text: "Confirmed — interview Thursday 10am CET.",
      createdAt: iso(-1),
      status: "delivered",
    },
  ],
  conv_3: [
    {
      id: "m3_1",
      conversationId: "conv_3",
      senderId: mockCrew[2].id,
      text: "I've sent some sample menus over for your review.",
      createdAt: iso(-2),
      status: "delivered",
    },
  ],
  conv_4: [
    {
      id: "m4_1",
      conversationId: "conv_4",
      senderId: mockUser.id,
      text: "Looking forward to working with you on the refit.",
      createdAt: iso(-4),
      status: "seen",
    },
  ],
};

/* ---------------- NOTIFICATIONS ---------------- */
export const mockNotifications: AppNotification[] = [
  {
    id: "n_1",
    category: "application",
    title: "New application",
    body: "Marco Bianchi applied for Sous Chef — M/Y Black Pearl.",
    read: false,
    createdAt: iso(0, -2),
    actionUrl: "/applications",
  },
  {
    id: "n_2",
    category: "message",
    title: "New message",
    body: "Sophia Laurent: Thanks Alex — I'll send my updated CV today.",
    read: false,
    createdAt: iso(0, -1),
    actionUrl: "/messages/conv_1",
  },
  {
    id: "n_3",
    category: "interview",
    title: "Interview scheduled",
    body: "Thursday 10:00 CET with James O'Connor for Captain — S/Y Equinox.",
    read: true,
    createdAt: iso(-1),
    actionUrl: "/schedule",
  },
  {
    id: "n_4",
    category: "job",
    title: "Job almost full",
    body: "Chief Stewardess — Aurora Borealis has 24 applications.",
    read: true,
    createdAt: iso(-2),
    actionUrl: "/jobs/job_1",
  },
  {
    id: "n_5",
    category: "system",
    title: "Profile verified",
    body: "Your company profile has been verified.",
    read: true,
    createdAt: iso(-7),
  },
];

/* ---------------- SCHEDULE ---------------- */
export const mockSchedule: ScheduleEvent[] = [
  {
    id: "sch_1",
    type: "interview",
    title: "Interview · James O'Connor",
    description: "Captain position for S/Y Equinox",
    startAt: iso(2, 10),
    endAt: iso(2, 11),
    participants: [
      { id: mockCrew[1].id, name: mockCrew[1].fullName, avatarUrl: mockCrew[1].avatarUrl },
    ],
    jobId: mockJobs[1].id,
    applicationId: "app_2",
    meetingUrl: "https://meet.example.com/abc",
  },
  {
    id: "sch_2",
    type: "joining",
    title: "Joining · Dimitri Volkov",
    description: "Chief Engineer onboard M/Y Aurora Borealis",
    startAt: iso(28, 9),
    participants: [
      { id: mockCrew[4].id, name: mockCrew[4].fullName, avatarUrl: mockCrew[4].avatarUrl },
    ],
    jobId: mockJobs[0].id,
    location: "Antibes, France",
  },
  {
    id: "sch_3",
    type: "contract-end",
    title: "Contract end · Sea Cadence deckhand",
    startAt: iso(60),
    participants: [],
  },
  {
    id: "sch_4",
    type: "delivery",
    title: "Delivery · Genoa → Palma",
    description: "Crew delivery passage",
    startAt: iso(8, 6),
    endAt: iso(11, 18),
    participants: [
      { id: mockCrew[2].id, name: mockCrew[2].fullName, avatarUrl: mockCrew[2].avatarUrl },
    ],
  },
];
