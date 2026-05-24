/**
 * Mock fixtures used by the consumer RTK Query API in lieu of a real backend.
 * After the platform was converted into an admin-only console, this file now
 * holds only the fixtures the admin surface still needs:
 *
 *   - `mockUser`       — the signed-in administrator
 *   - `mockJobs`       — used by the Job Moderation page
 *   - `mockNotifications` — admin-style notifications in the bell dropdown
 *
 * Admin-specific fixtures live in `adminMockData.ts`.
 */
import type {
  AppNotification,
  Job,
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
export const mockUser: User = {
  id: "u_admin_1",
  email: "alex@meridian-yachts.com",
  fullName: "Alex Marlowe",
  role: "admin",
  adminRole: "super-admin",
  avatarUrl:
    "https://images.unsplash.com/photo-1607746882042-944635dfe10e?auto=format&fit=facearea&w=256&h=256&q=80",
  companyName: "Meridian Platform Operations",
  phone: "+33 6 12 34 56 78",
  countryCode: "FR",
  createdAt: iso(-180),
};

/* ---------------- JOBS (read-only — surfaced in Job Moderation) ---------------- */
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
      "Lead the interior team of an award-winning 72m motor yacht with a global cruising programme.",
    responsibilities: ["Manage interior crew", "Owner & guest service", "Inventory & budgets"],
    requirements: ["8+ years interior experience", "Charter & private trip exposure"],
    certifications: ["STCW", "ENG1", "Food Safety Level 3"],
    languages: ["English", "French"],
    salary: { currency: "EUR", min: 7000, max: 8500, period: "monthly" },
    location: "Antibes, France",
    startDate: iso(20),
    endDate: iso(380),
    applicationsCount: 18,
    shortlistedCount: 4,
    postedById: "u_owner_1",
    createdAt: iso(-2, -3),
    updatedAt: iso(0, -1),
  },
  {
    id: "job_2",
    title: "Second Engineer — Rotational",
    position: "engineer",
    status: "open",
    contractType: "rotational",
    yacht: {
      name: "M/Y Cassiopeia",
      length: 88,
      type: "motor",
      flag: "Marshall Islands",
      imageUrl:
        "https://images.unsplash.com/photo-1610631066894-62452ccb927c?auto=format&fit=crop&w=1200&q=80",
    },
    description: "Join a rotational engineering team aboard an 88m world-cruising motor yacht.",
    responsibilities: ["Daily watchkeeping", "Maintenance planning", "Engineering reports"],
    requirements: ["MEOL (Y) minimum", "Caterpillar & MTU experience"],
    certifications: ["STCW", "ENG1", "MEOL (Y)"],
    languages: ["English"],
    salary: { currency: "EUR", min: 7800, max: 9200, period: "monthly" },
    location: "Palma de Mallorca, Spain",
    startDate: iso(35),
    applicationsCount: 9,
    shortlistedCount: 2,
    postedById: "u_owner_2",
    createdAt: iso(-5, -2),
    updatedAt: iso(-1, 1),
  },
  {
    id: "job_3",
    title: "Sole Chef — Charter Season",
    position: "chef",
    status: "paused",
    contractType: "seasonal",
    yacht: {
      name: "S/Y Northern Crown",
      length: 46,
      type: "sail",
      flag: "Malta",
      imageUrl:
        "https://images.unsplash.com/photo-1599839952773-eb20df8b8c92?auto=format&fit=crop&w=1200&q=80",
    },
    description: "Plan and deliver high-end menus for a 46m charter sail yacht in the Mediterranean.",
    responsibilities: ["Menu design", "Provisioning & budgets", "Allergen management"],
    requirements: ["Charter experience", "Wine pairing knowledge"],
    certifications: ["Food Safety Level 3", "HACCP", "STCW", "ENG1"],
    languages: ["English", "Italian"],
    salary: { currency: "EUR", min: 6500, max: 7500, period: "monthly" },
    location: "Naples, Italy",
    startDate: iso(60),
    endDate: iso(180),
    applicationsCount: 14,
    shortlistedCount: 3,
    postedById: "u_owner_3",
    createdAt: iso(-7, 0),
    updatedAt: iso(-2, -3),
  },
  {
    id: "job_4",
    title: "Deckhand — Day work, Antibes",
    position: "deckhand",
    status: "closed",
    contractType: "day-work",
    yacht: {
      name: "M/Y Atlas",
      length: 38,
      type: "motor",
      flag: "France",
      imageUrl:
        "https://images.unsplash.com/photo-1505739679850-7adf8385f88c?auto=format&fit=crop&w=1200&q=80",
    },
    description: "Two weeks of intensive day work as the yacht prepares for the summer charter season.",
    responsibilities: ["Exterior detailing", "Tender ops", "Provisioning runs"],
    requirements: ["STCW", "Driver's license", "Tender experience"],
    certifications: ["STCW", "ENG1", "Powerboat L2"],
    languages: ["English"],
    salary: { currency: "EUR", min: 170, max: 220, period: "daily" },
    location: "Antibes, France",
    startDate: iso(2),
    endDate: iso(16),
    applicationsCount: 6,
    shortlistedCount: 2,
    postedById: "u_owner_4",
    createdAt: iso(-12, -2),
    updatedAt: iso(-3, 0),
  },
];

/* ---------------- NOTIFICATIONS (admin-focused) ---------------- */
export const mockNotifications: AppNotification[] = [
  {
    id: "n_1",
    category: "verification",
    title: "4 owner verifications pending review",
    body: "Nora Castellan, Karim Wallach and 2 others are waiting on a decision.",
    href: "/admin/owners",
    read: false,
    createdAt: iso(0, -1),
  },
  {
    id: "n_2",
    category: "crew",
    title: "New crew profile submitted",
    body: "Anya Volkov submitted MEOL (Y) certification for verification.",
    href: "/admin/crew",
    read: false,
    createdAt: iso(0, -3),
  },
  {
    id: "n_3",
    category: "security",
    title: "Suspicious login attempt detected",
    body: "3 failed attempts from an unknown IP in the last hour.",
    href: "/admin/security",
    read: false,
    createdAt: iso(0, -5),
  },
  {
    id: "n_4",
    category: "application",
    title: "12 new applications this morning",
    body: "Across 4 active jobs — pipeline rebuilt on the Applications page.",
    href: "/admin/applications",
    read: true,
    createdAt: iso(-1, 0),
  },
  {
    id: "n_5",
    category: "announcement",
    title: "Announcement delivered",
    body: "“New verification requirements” reached 1,284 recipients.",
    href: "/admin/notifications",
    read: true,
    createdAt: iso(-2, 0),
  },
];
