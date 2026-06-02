/**
 * Mock support tickets for the admin Support Center.
 *
 * API paths mirror the future backend contract:
 *   GET    /support/tickets
 *   GET    /support/tickets/:id
 *   PATCH  /support/tickets/:id/status
 *   POST   /support/tickets/:id/reply
 */
import type { SupportTicket } from "@/types";

const now = new Date();
const iso = (offsetDays = 0, offsetHours = 0): string => {
  const d = new Date(now);
  d.setDate(d.getDate() + offsetDays);
  d.setHours(d.getHours() + offsetHours);
  return d.toISOString();
};

const isToday = (dateIso: string) => {
  const d = new Date(dateIso);
  const t = new Date();
  return (
    d.getFullYear() === t.getFullYear() &&
    d.getMonth() === t.getMonth() &&
    d.getDate() === t.getDate()
  );
};

export const mockSupportTickets: SupportTicket[] = [
  {
    id: "tkt_1",
    ticketNumber: "TKT-1042",
    userName: "Sophia Laurent",
    userRole: "crew",
    email: "sophia.l@yachtmail.io",
    subject: "Cannot upload STCW certificate",
    category: "verification-issue",
    priority: "high",
    status: "open",
    createdAt: iso(-2, -4),
    updatedAt: iso(0, -1),
    attachments: [
      {
        id: "att_1",
        fileName: "stcw-error-screenshot.png",
        fileSize: 248_000,
        mimeType: "image/png",
        url: "#",
      },
    ],
    messages: [
      {
        id: "msg_1",
        authorType: "user",
        authorName: "Sophia Laurent",
        body: "<p>Hi, I keep getting an error when uploading my STCW certificate. The file is under 5MB and in PDF format.</p>",
        createdAt: iso(-2, -4),
        attachments: [
          {
            id: "att_1",
            fileName: "stcw-error-screenshot.png",
            fileSize: 248_000,
            mimeType: "image/png",
            url: "#",
          },
        ],
      },
    ],
  },
  {
    id: "tkt_2",
    ticketNumber: "TKT-1041",
    userName: "Marcus Webb",
    userRole: "owner",
    email: "marcus@azurevessels.com",
    subject: "Billing discrepancy on last invoice",
    category: "payment-issue",
    priority: "urgent",
    status: "pending",
    createdAt: iso(-3),
    updatedAt: iso(-1, -6),
    attachments: [
      {
        id: "att_2",
        fileName: "invoice-march-2026.pdf",
        fileSize: 412_000,
        mimeType: "application/pdf",
        url: "#",
      },
    ],
    messages: [
      {
        id: "msg_2",
        authorType: "user",
        authorName: "Marcus Webb",
        body: "<p>Our March invoice shows a duplicate crew listing charge. Please review and adjust.</p>",
        createdAt: iso(-3),
        attachments: [
          {
            id: "att_2",
            fileName: "invoice-march-2026.pdf",
            fileSize: 412_000,
            mimeType: "application/pdf",
            url: "#",
          },
        ],
      },
      {
        id: "msg_3",
        authorType: "admin",
        authorName: "Alex Marlowe",
        body: "<p>Thanks Marcus — I've escalated this to our billing team and will update you within 24 hours.</p>",
        createdAt: iso(-2, -2),
      },
    ],
  },
  {
    id: "tkt_3",
    ticketNumber: "TKT-1040",
    userName: "Elena Vasquez",
    userRole: "crew",
    email: "elena.v@crewmail.com",
    subject: "Application stuck in pending review",
    category: "job-application-issue",
    priority: "medium",
    status: "open",
    createdAt: iso(-4),
    updatedAt: iso(-2),
    attachments: [],
    messages: [
      {
        id: "msg_4",
        authorType: "user",
        authorName: "Elena Vasquez",
        body: "<p>I applied for a Chief Stewardess role on M/Y Serenity five days ago. Status still shows pending. Is this normal?</p>",
        createdAt: iso(-4),
      },
    ],
  },
  {
    id: "tkt_4",
    ticketNumber: "TKT-1039",
    userName: "James Hartley",
    userRole: "crew",
    email: "jhartley@yachtpro.io",
    subject: "Password reset email not arriving",
    category: "account-issue",
    priority: "medium",
    status: "resolved",
    createdAt: iso(-5),
    updatedAt: iso(0, -3),
    attachments: [],
    messages: [
      {
        id: "msg_5",
        authorType: "user",
        authorName: "James Hartley",
        body: "<p>I've requested a password reset three times but never receive the email. Checked spam folder.</p>",
        createdAt: iso(-5),
      },
      {
        id: "msg_6",
        authorType: "admin",
        authorName: "Alex Marlowe",
        body: "<p>Your email was on a suppression list from a previous bounce. I've cleared it — please try again now.</p>",
        createdAt: iso(-4, -8),
      },
      {
        id: "msg_7",
        authorType: "user",
        authorName: "James Hartley",
        body: "<p>That worked, thank you!</p>",
        createdAt: iso(0, -3),
      },
    ],
  },
  {
    id: "tkt_5",
    ticketNumber: "TKT-1038",
    userName: "Charlotte Duval",
    userRole: "owner",
    email: "c.duval@rivierayachts.fr",
    subject: "How to post a seasonal contract role?",
    category: "general-inquiry",
    priority: "low",
    status: "closed",
    createdAt: iso(-8),
    updatedAt: iso(-6),
    attachments: [],
    messages: [
      {
        id: "msg_8",
        authorType: "user",
        authorName: "Charlotte Duval",
        body: "<p>Is there a way to mark a job as seasonal contract rather than permanent?</p>",
        createdAt: iso(-8),
      },
      {
        id: "msg_9",
        authorType: "admin",
        authorName: "Support Team",
        body: "<p>Yes — under Job Type when creating a listing, select <strong>Seasonal Contract</strong>. Happy hiring!</p>",
        createdAt: iso(-7),
      },
    ],
  },
  {
    id: "tkt_6",
    ticketNumber: "TKT-1037",
    userName: "Tomás Rivera",
    userRole: "crew",
    email: "tomas.r@seavcrew.com",
    subject: "App crashes on job search filter",
    category: "technical-issue",
    priority: "high",
    status: "pending",
    createdAt: iso(-1, -8),
    updatedAt: iso(0, -2),
    attachments: [
      {
        id: "att_3",
        fileName: "crash-log.txt",
        fileSize: 12_400,
        mimeType: "text/plain",
        url: "#",
      },
    ],
    messages: [
      {
        id: "msg_10",
        authorType: "user",
        authorName: "Tomás Rivera",
        body: "<p>Every time I filter jobs by Mediterranean region the app closes immediately. iOS 18, latest app version.</p>",
        createdAt: iso(-1, -8),
        attachments: [
          {
            id: "att_3",
            fileName: "crash-log.txt",
            fileSize: 12_400,
            mimeType: "text/plain",
            url: "#",
          },
        ],
      },
      {
        id: "msg_11",
        authorType: "admin",
        authorName: "Alex Marlowe",
        body: "<p>Thanks Tomás — engineering is investigating. As a workaround, try filtering by country instead of region.</p>",
        createdAt: iso(0, -2),
      },
    ],
  },
  {
    id: "tkt_7",
    ticketNumber: "TKT-1036",
    userName: "Amelia Chen",
    userRole: "crew",
    email: "amelia.chen@maritime.io",
    subject: "Profile photo not saving",
    category: "technical-issue",
    priority: "low",
    status: "open",
    createdAt: iso(-1, -2),
    updatedAt: iso(-1, -2),
    attachments: [],
    messages: [
      {
        id: "msg_12",
        authorType: "user",
        authorName: "Amelia Chen",
        body: "<p>After uploading a new profile photo it reverts to the old one when I refresh.</p>",
        createdAt: iso(-1, -2),
      },
    ],
  },
  {
    id: "tkt_8",
    ticketNumber: "TKT-1035",
    userName: "Richard Okonkwo",
    userRole: "owner",
    email: "r.okonkwo@atlanticyachts.com",
    subject: "Owner verification documents rejected",
    category: "verification-issue",
    priority: "urgent",
    status: "open",
    createdAt: iso(0, -5),
    updatedAt: iso(0, -4),
    attachments: [
      {
        id: "att_4",
        fileName: "company-registration.pdf",
        fileSize: 890_000,
        mimeType: "application/pdf",
        url: "#",
      },
    ],
    messages: [
      {
        id: "msg_13",
        authorType: "user",
        authorName: "Richard Okonkwo",
        body: "<p>My company registration was rejected but I wasn't told why. We are a registered UK yacht management company.</p>",
        createdAt: iso(0, -5),
        attachments: [
          {
            id: "att_4",
            fileName: "company-registration.pdf",
            fileSize: 890_000,
            mimeType: "application/pdf",
            url: "#",
          },
        ],
      },
    ],
  },
  {
    id: "tkt_9",
    ticketNumber: "TKT-1034",
    userName: "Isabelle Moreau",
    userRole: "crew",
    email: "isabelle.m@yachtlife.fr",
    subject: "Withdraw application request",
    category: "job-application-issue",
    priority: "low",
    status: "resolved",
    createdAt: iso(-2),
    updatedAt: iso(0, -8),
    attachments: [],
    messages: [
      {
        id: "msg_14",
        authorType: "user",
        authorName: "Isabelle Moreau",
        body: "<p>Please withdraw my application for M/Y Horizon — I've accepted another position.</p>",
        createdAt: iso(-2),
      },
      {
        id: "msg_15",
        authorType: "admin",
        authorName: "Support Team",
        body: "<p>Your application has been withdrawn. Best of luck in your new role!</p>",
        createdAt: iso(0, -8),
      },
    ],
  },
  {
    id: "tkt_10",
    ticketNumber: "TKT-1033",
    userName: "David Falkner",
    userRole: "owner",
    email: "david@falkneryachts.co.uk",
    subject: "Subscription renewal question",
    category: "payment-issue",
    priority: "medium",
    status: "closed",
    createdAt: iso(-12),
    updatedAt: iso(-10),
    attachments: [],
    messages: [
      {
        id: "msg_16",
        authorType: "user",
        authorName: "David Falkner",
        body: "<p>When does our annual subscription renew? We want to add more job slots before then.</p>",
        createdAt: iso(-12),
      },
      {
        id: "msg_17",
        authorType: "admin",
        authorName: "Alex Marlowe",
        body: "<p>Your renewal date is 15 July 2026. You can upgrade slots anytime from Billing in settings.</p>",
        createdAt: iso(-11),
      },
    ],
  },
];

/** Dashboard KPIs derived from the full ticket store. */
export const computeSupportSummary = (
  tickets: SupportTicket[],
): import("@/types").SupportTicketDashboardSummary => ({
  open: tickets.filter((t) => t.status === "open").length,
  pending: tickets.filter((t) => t.status === "pending").length,
  resolvedToday: tickets.filter(
    (t) => t.status === "resolved" && isToday(t.updatedAt),
  ).length,
  highPriority: tickets.filter(
    (t) =>
      (t.priority === "high" || t.priority === "urgent") &&
      t.status !== "closed" &&
      t.status !== "resolved",
  ).length,
});
