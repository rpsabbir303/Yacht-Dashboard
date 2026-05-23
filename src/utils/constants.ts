import type { CrewPosition, SelectOption } from "@/types";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000/api";

export const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ?? "http://localhost:4000";

export const ACCESS_TOKEN_KEY = "helm.accessToken";
export const REFRESH_TOKEN_KEY = "helm.refreshToken";
export const SESSION_USER_KEY = "helm.user";

export const CREW_POSITION_OPTIONS: SelectOption<CrewPosition>[] = [
  { label: "Captain", value: "captain" },
  { label: "Chief Officer", value: "chief-officer" },
  { label: "Second Officer", value: "second-officer" },
  { label: "Deckhand", value: "deckhand" },
  { label: "Bosun", value: "bosun" },
  { label: "Engineer", value: "engineer" },
  { label: "Chef", value: "chef" },
  { label: "Sous Chef", value: "sous-chef" },
  { label: "Stewardess", value: "stewardess" },
  { label: "Chief Stewardess", value: "chief-stewardess" },
  { label: "Purser", value: "purser" },
  { label: "Spa Therapist", value: "spa-therapist" },
  { label: "Nurse", value: "nurse" },
  { label: "Security", value: "security" },
];

export const CERTIFICATION_OPTIONS: SelectOption[] = [
  { label: "STCW Basic Safety", value: "stcw" },
  { label: "ENG1 Medical", value: "eng1" },
  { label: "Yachtmaster Ocean", value: "yachtmaster-ocean" },
  { label: "Yachtmaster Offshore", value: "yachtmaster-offshore" },
  { label: "AEC 1 & 2", value: "aec" },
  { label: "PYA GUEST Programme", value: "pya-guest" },
  { label: "WSET Level 2", value: "wset-2" },
  { label: "Food Hygiene Level 3", value: "food-hygiene-3" },
  { label: "Powerboat Level 2", value: "powerboat-2" },
  { label: "Tender Operator", value: "tender" },
];

export const LANGUAGE_OPTIONS: SelectOption[] = [
  { label: "English", value: "en" },
  { label: "French", value: "fr" },
  { label: "Spanish", value: "es" },
  { label: "Italian", value: "it" },
  { label: "German", value: "de" },
  { label: "Portuguese", value: "pt" },
  { label: "Russian", value: "ru" },
  { label: "Greek", value: "el" },
  { label: "Croatian", value: "hr" },
  { label: "Turkish", value: "tr" },
];
