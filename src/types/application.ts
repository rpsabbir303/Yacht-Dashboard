import type { ID, ISODateString } from "./common";
import type { CrewMember } from "./crew";
import type { Job } from "./job";

export type ApplicationStatus =
  | "new"
  | "shortlisted"
  | "interview"
  | "accepted"
  | "rejected"
  | "withdrawn";

export interface Application {
  id: ID;
  job: Pick<Job, "id" | "title" | "position" | "yacht">;
  crew: Pick<
    CrewMember,
    "id" | "fullName" | "position" | "avatarUrl" | "rating" | "location"
  >;
  status: ApplicationStatus;
  message?: string;
  appliedAt: ISODateString;
  updatedAt: ISODateString;
  expectedSalary?: number;
  availableFrom?: ISODateString;
}
