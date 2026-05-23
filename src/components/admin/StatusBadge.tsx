import { cn } from "@utils/cn";
import type {
  AdminAccountStatus,
  DisputeStatus,
  ReportSeverity,
  ReportStatus,
  VerificationStatus,
} from "@/types";

type Tone = "teal" | "gold" | "danger" | "neutral" | "white";

const TONE_CLASS: Record<Tone, { dot: string; text: string; chipBg: string }> = {
  teal: {
    dot: "bg-teal-400",
    text: "text-teal-300",
    chipBg: "bg-teal-500/10 text-teal-300 ring-1 ring-teal-500/20",
  },
  gold: {
    dot: "bg-gold-500",
    text: "text-gold-400",
    chipBg: "bg-gold-500/10 text-gold-400 ring-1 ring-gold-500/20",
  },
  danger: {
    dot: "bg-[#AA2727]",
    text: "text-[#C24545]",
    chipBg: "bg-[#AA2727]/10 text-[#C24545] ring-1 ring-[#AA2727]/30",
  },
  neutral: {
    dot: "bg-grey-500",
    text: "text-grey-400",
    chipBg: "bg-white/[0.03] text-grey-400 ring-1 ring-white/[0.06]",
  },
  white: {
    dot: "bg-white",
    text: "text-white",
    chipBg: "bg-white/[0.05] text-white ring-1 ring-white/[0.08]",
  },
};

/* ---- Mappings per domain ---- */

const VERIFICATION: Record<
  VerificationStatus,
  { label: string; tone: Tone }
> = {
  pending: { label: "Pending", tone: "neutral" },
  "in-review": { label: "In review", tone: "white" },
  approved: { label: "Approved", tone: "teal" },
  rejected: { label: "Rejected", tone: "danger" },
  "additional-info": { label: "Info requested", tone: "gold" },
};

const ACCOUNT: Record<
  AdminAccountStatus,
  { label: string; tone: Tone }
> = {
  active: { label: "Active", tone: "teal" },
  warned: { label: "Warned", tone: "gold" },
  suspended: { label: "Suspended", tone: "danger" },
  banned: { label: "Banned", tone: "danger" },
  "pending-verification": { label: "Pending verification", tone: "neutral" },
};

const REPORT_STATUS: Record<ReportStatus, { label: string; tone: Tone }> = {
  open: { label: "Open", tone: "white" },
  investigating: { label: "Investigating", tone: "gold" },
  resolved: { label: "Resolved", tone: "teal" },
  dismissed: { label: "Dismissed", tone: "neutral" },
};

const REPORT_SEVERITY: Record<ReportSeverity, { label: string; tone: Tone }> = {
  low: { label: "Low", tone: "neutral" },
  medium: { label: "Medium", tone: "gold" },
  high: { label: "High", tone: "danger" },
  critical: { label: "Critical", tone: "danger" },
};

const DISPUTE: Record<DisputeStatus, { label: string; tone: Tone }> = {
  open: { label: "Open", tone: "white" },
  "under-review": { label: "Under review", tone: "gold" },
  resolved: { label: "Resolved", tone: "teal" },
  rejected: { label: "Rejected", tone: "danger" },
};

/* ---- Component ---- */

type Variant = "dot" | "chip";

type Props =
  | {
      kind: "verification";
      value: VerificationStatus;
      variant?: Variant;
      className?: string;
    }
  | {
      kind: "account";
      value: AdminAccountStatus;
      variant?: Variant;
      className?: string;
    }
  | {
      kind: "report-status";
      value: ReportStatus;
      variant?: Variant;
      className?: string;
    }
  | {
      kind: "report-severity";
      value: ReportSeverity;
      variant?: Variant;
      className?: string;
    }
  | {
      kind: "dispute";
      value: DisputeStatus;
      variant?: Variant;
      className?: string;
    };

const resolve = (props: Props): { label: string; tone: Tone } => {
  switch (props.kind) {
    case "verification":
      return VERIFICATION[props.value];
    case "account":
      return ACCOUNT[props.value];
    case "report-status":
      return REPORT_STATUS[props.value];
    case "report-severity":
      return REPORT_SEVERITY[props.value];
    case "dispute":
      return DISPUTE[props.value];
  }
};

export const StatusBadge = (props: Props) => {
  const { label, tone } = resolve(props);
  const styles = TONE_CLASS[tone];
  const variant = props.variant ?? "dot";

  if (variant === "chip") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium",
          styles.chipBg,
          props.className,
        )}
      >
        <span className={cn("h-1.5 w-1.5 rounded-full", styles.dot)} />
        {label}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-[12px]",
        props.className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", styles.dot)} />
      <span className={styles.text}>{label}</span>
    </span>
  );
};
