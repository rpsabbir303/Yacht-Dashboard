import type { ID, ISODateString } from "./common";

export type NotificationCategory =
  | "verification"
  | "crew"
  | "owner"
  | "job"
  | "application"
  | "security"
  | "announcement"
  | "system";

export interface AppNotification {
  id: ID;
  category: NotificationCategory;
  title: string;
  body?: string;
  href?: string;
  read: boolean;
  createdAt: ISODateString;
  meta?: Record<string, string | number | boolean>;
}
