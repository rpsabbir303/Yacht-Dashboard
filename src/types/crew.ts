import type { ID, ISODateString } from "./common";
import type { CrewPosition } from "./job";

export type AvailabilityStatus =
  | "available-now"
  | "available-soon"
  | "on-board"
  | "not-available";

export interface CrewCertification {
  id: ID;
  name: string;
  issuedBy: string;
  issuedOn: ISODateString;
  expiresOn?: ISODateString;
}

export interface CrewExperience {
  id: ID;
  yachtName: string;
  yachtLength: number;
  position: CrewPosition;
  from: ISODateString;
  to?: ISODateString;
  description?: string;
}

export interface CrewMember {
  id: ID;
  fullName: string;
  headline: string;
  position: CrewPosition;
  secondaryPositions: CrewPosition[];
  yearsOfExperience: number;
  availability: AvailabilityStatus;
  availableFrom?: ISODateString;
  location: string;
  nationality: string;
  languages: string[];
  certifications: CrewCertification[];
  experience: CrewExperience[];
  rating: number; // 0-5
  reviewsCount: number;
  avatarUrl?: string;
  coverUrl?: string;
  bio: string;
  hourlyRate?: number;
  currency?: "EUR" | "USD" | "GBP";
  verified: boolean;
  saved?: boolean;
}

export interface CrewFilters {
  search?: string;
  position?: CrewPosition;
  certifications?: string[];
  availability?: AvailabilityStatus;
  minExperience?: number;
  location?: string;
  page?: number;
  pageSize?: number;
}
