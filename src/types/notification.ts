import type { ID, ISODateString } from "./common";

export type NotificationCategory =
  | "application"
  | "message"
  | "interview"
  | "job"
  | "system";

export interface AppNotification {
  id: ID;
  category: NotificationCategory;
  title: string;
  body?: string;
  read: boolean;
  createdAt: ISODateString;
  actionUrl?: string;
  meta?: Record<string, string | number | boolean>;
}
