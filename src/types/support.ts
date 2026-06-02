import type { ID, ISODateString } from "./common";

/** Platform user role that opened the ticket. */
export type SupportUserRole = "crew" | "owner";

export type SupportTicketStatus = "open" | "pending" | "resolved" | "closed";

export type SupportTicketPriority = "low" | "medium" | "high" | "urgent";

export type SupportTicketCategory =
  | "account-issue"
  | "verification-issue"
  | "job-application-issue"
  | "payment-issue"
  | "technical-issue"
  | "general-inquiry";

export interface SupportTicketAttachment {
  id: ID;
  fileName: string;
  fileSize: number;
  mimeType: string;
  url: string;
}

export interface SupportTicketMessage {
  id: ID;
  authorType: "user" | "admin";
  authorName: string;
  body: string;
  createdAt: ISODateString;
  attachments?: SupportTicketAttachment[];
}

/** List-row shape returned by GET /support/tickets */
export interface SupportTicketSummary {
  id: ID;
  ticketNumber: string;
  userName: string;
  userRole: SupportUserRole;
  email: string;
  subject: string;
  category: SupportTicketCategory;
  priority: SupportTicketPriority;
  status: SupportTicketStatus;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

/** Full ticket with conversation thread — GET /support/tickets/:id */
export interface SupportTicket extends SupportTicketSummary {
  messages: SupportTicketMessage[];
  attachments: SupportTicketAttachment[];
}

export interface SupportTicketListParams {
  search?: string;
  status?: SupportTicketStatus | "all";
  userRole?: SupportUserRole | "all";
  priority?: SupportTicketPriority | "all";
  category?: SupportTicketCategory | "all";
}

export interface SupportTicketListResponse {
  tickets: SupportTicketSummary[];
  summary: SupportTicketDashboardSummary;
}

export interface SupportTicketDashboardSummary {
  open: number;
  pending: number;
  resolvedToday: number;
  highPriority: number;
}

export interface UpdateSupportTicketStatusRequest {
  id: ID;
  status: SupportTicketStatus;
}

export interface ReplySupportTicketRequest {
  id: ID;
  message: string;
}

export const SUPPORT_CATEGORY_LABEL: Record<SupportTicketCategory, string> = {
  "account-issue": "Account Issue",
  "verification-issue": "Verification Issue",
  "job-application-issue": "Job Application Issue",
  "payment-issue": "Payment Issue",
  "technical-issue": "Technical Issue",
  "general-inquiry": "General Inquiry",
};

export const SUPPORT_PRIORITY_LABEL: Record<SupportTicketPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

export const SUPPORT_STATUS_LABEL: Record<SupportTicketStatus, string> = {
  open: "Open",
  pending: "Pending",
  resolved: "Resolved",
  closed: "Closed",
};

export const SUPPORT_ROLE_LABEL: Record<SupportUserRole, string> = {
  crew: "Crew",
  owner: "Owner",
};
