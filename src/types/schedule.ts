import type { ID, ISODateString } from "./common";

export type ScheduleEventType =
  | "interview"
  | "joining"
  | "contract-start"
  | "contract-end"
  | "delivery";

export interface ScheduleEvent {
  id: ID;
  type: ScheduleEventType;
  title: string;
  description?: string;
  startAt: ISODateString;
  endAt?: ISODateString;
  participants: { id: ID; name: string; avatarUrl?: string }[];
  jobId?: ID;
  applicationId?: ID;
  location?: string;
  meetingUrl?: string;
}
