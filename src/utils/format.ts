import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

export const formatCurrency = (
  amount: number,
  currency: "EUR" | "USD" | "GBP" = "EUR",
): string =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);

export const formatDate = (iso: string, fmt = "MMM D, YYYY"): string =>
  dayjs(iso).format(fmt);

export const formatDateTime = (iso: string): string =>
  dayjs(iso).format("MMM D, YYYY · HH:mm");

export const fromNow = (iso: string): string => dayjs(iso).fromNow();

export const initials = (name: string): string =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

export const titleCase = (input: string): string =>
  input
    .replace(/[-_]/g, " ")
    .replace(/\w\S*/g, (w) => w[0].toUpperCase() + w.slice(1).toLowerCase());

export const truncate = (value: string, max = 80): string =>
  value.length > max ? value.slice(0, max - 1) + "…" : value;
