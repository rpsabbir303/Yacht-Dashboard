import type { ID, ISODateString } from "./common";
import type { AdminRole } from "./admin";

export type UserRole = "owner" | "captain" | "agent" | "admin";

export interface User {
  id: ID;
  email: string;
  fullName: string;
  role: UserRole;
  /** Optional admin tier — coexists with the consumer role. */
  adminRole?: AdminRole;
  avatarUrl?: string;
  companyName?: string;
  phone?: string;
  countryCode?: string;
  createdAt: ISODateString;
}

export interface AuthSession {
  user: User;
  accessToken: string;
  refreshToken?: string;
  expiresAt: ISODateString;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload extends LoginPayload {
  fullName: string;
  role: UserRole;
  companyName?: string;
}
