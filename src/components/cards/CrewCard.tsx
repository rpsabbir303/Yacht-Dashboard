import {
  CheckCircleFilled,
  EnvironmentOutlined,
  HeartFilled,
  HeartOutlined,
  StarFilled,
} from "@ant-design/icons";
import { Avatar } from "antd";
import { motion } from "framer-motion";
import { useState } from "react";
import { Link } from "react-router-dom";

import { initials, titleCase } from "@utils/format";
import { cn } from "@utils/cn";
import type { AvailabilityStatus, CrewMember } from "@/types";

const AVAILABILITY: Record<
  AvailabilityStatus,
  { label: string; dot: string; text: string }
> = {
  "available-now": {
    label: "Available now",
    dot: "bg-teal-400",
    text: "text-teal-300",
  },
  "available-soon": {
    label: "Available soon",
    dot: "bg-grey-400",
    text: "text-grey-400",
  },
  "on-board": {
    label: "On-board",
    dot: "bg-gold-500",
    text: "text-gold-400",
  },
  "not-available": {
    label: "Not available",
    dot: "bg-[#AA2727]",
    text: "text-[#C24545]",
  },
};

interface Props {
  crew: CrewMember;
  onMessage?: (crew: CrewMember) => void;
  onSaveToggle?: (crew: CrewMember, next: boolean) => void;
}

export const CrewCard = ({ crew, onMessage, onSaveToggle }: Props) => {
  const [saved, setSaved] = useState(!!crew.saved);
  const a = AVAILABILITY[crew.availability];

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="surface-card glass-card-hover group relative p-6"
    >
      <button
        onClick={() => {
          const next = !saved;
          setSaved(next);
          onSaveToggle?.(crew, next);
        }}
        className={cn(
          "absolute right-5 top-5 grid h-9 w-9 place-items-center rounded-xl text-[15px] transition",
          saved
            ? "text-[#C24545] hover:bg-white/[0.04]"
            : "text-grey-500 hover:bg-white/[0.04] hover:text-white",
        )}
        aria-label={saved ? "Unsave crew" : "Save crew"}
      >
        {saved ? <HeartFilled /> : <HeartOutlined />}
      </button>

      <div className="flex items-start gap-4">
        <Avatar
          size={64}
          src={crew.avatarUrl}
          className="!bg-white/[0.04] !text-grey-400 ring-1 ring-white/[0.06]"
        >
          {initials(crew.fullName)}
        </Avatar>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <h3 className="truncate text-[16px] font-semibold leading-tight text-white">
              {crew.fullName}
            </h3>
            {crew.verified && (
              <CheckCircleFilled
                className="text-gold-500 text-[12px]"
                title="Verified"
              />
            )}
          </div>
          <div className="mt-0.5 truncate text-[12px] text-grey-400">
            {titleCase(crew.position)} · {crew.yearsOfExperience} yrs
          </div>
          <div className="mt-2 inline-flex items-center gap-1.5 text-[12px] text-grey-400">
            <span className={cn("h-1.5 w-1.5 rounded-full", a.dot)} />
            <span className={a.text}>{a.label}</span>
          </div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3 border-y border-white/[0.04] py-4 text-[12px]">
        <div>
          <div className="text-[10px] uppercase tracking-[0.18em] text-grey-500">
            Rating
          </div>
          <div className="mt-1 inline-flex items-center gap-1 text-white">
            <StarFilled className="text-gold-500 text-[10px]" />
            <span className="font-semibold">{crew.rating.toFixed(1)}</span>
            <span className="text-grey-500">({crew.reviewsCount})</span>
          </div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-[0.18em] text-grey-500">
            Location
          </div>
          <div className="mt-1 inline-flex items-center gap-1 truncate text-white">
            <EnvironmentOutlined className="text-grey-500 text-[10px]" />
            <span className="truncate">{crew.location.split(",")[0]}</span>
          </div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-[0.18em] text-grey-500">
            Lang
          </div>
          <div className="mt-1 truncate text-white">
            {crew.languages.map((l) => l.toUpperCase()).join(" · ")}
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <Link
          to={`/crew/${crew.id}`}
          className="rounded-xl border border-white/[0.06] py-2 text-center text-[13px] font-medium text-white transition hover:border-white/15 hover:bg-white/[0.02]"
        >
          View profile
        </Link>
        <button
          onClick={() => onMessage?.(crew)}
          className="rounded-xl bg-teal-500 py-2 text-center text-[13px] font-semibold text-[#06241f] transition hover:bg-teal-400"
        >
          Message
        </button>
      </div>
    </motion.div>
  );
};
