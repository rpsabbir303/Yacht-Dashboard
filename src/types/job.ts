import type { ID, ISODateString } from "./common";

export type JobStatus = "draft" | "open" | "paused" | "closed" | "filled";

export type ContractType =
  | "permanent"
  | "rotational"
  | "seasonal"
  | "delivery"
  | "day-work";

export type CrewPosition =
  | "captain"
  | "chief-officer"
  | "second-officer"
  | "deckhand"
  | "bosun"
  | "engineer"
  | "chef"
  | "sous-chef"
  | "stewardess"
  | "chief-stewardess"
  | "purser"
  | "spa-therapist"
  | "nurse"
  | "security";

export interface JobSalary {
  currency: "EUR" | "USD" | "GBP";
  min: number;
  max: number;
  period: "monthly" | "weekly" | "daily";
}

export interface YachtSnapshot {
  name: string;
  length: number; // in meters
  type: "motor" | "sail" | "explorer" | "catamaran";
  flag?: string;
  imageUrl?: string;
}

export interface Job {
  id: ID;
  title: string;
  position: CrewPosition;
  status: JobStatus;
  contractType: ContractType;
  yacht: YachtSnapshot;
  description: string;
  responsibilities: string[];
  requirements: string[];
  certifications: string[];
  languages: string[];
  salary: JobSalary;
  location: string;
  startDate: ISODateString;
  endDate?: ISODateString;
  applicationsCount: number;
  shortlistedCount: number;
  postedById: ID;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export type JobFormStep =
  | "basics"
  | "yacht"
  | "compensation"
  | "requirements"
  | "review";

export interface JobDraft
  extends Partial<Omit<Job, "id" | "createdAt" | "updatedAt" | "postedById">> {
  step?: JobFormStep;
}
