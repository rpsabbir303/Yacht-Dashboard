import {
  ArrowRightOutlined,
  EnvironmentOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

import { cn } from "@utils/cn";
import { formatCurrency, titleCase } from "@utils/format";
import type { Job, JobStatus } from "@/types";

const STATUS_STYLE: Record<JobStatus, { dot: string; label: string; text: string }> = {
  open: { dot: "bg-teal-400", label: "Open", text: "text-teal-300" },
  paused: { dot: "bg-grey-500", label: "Paused", text: "text-grey-400" },
  closed: { dot: "bg-[#AA2727]", label: "Closed", text: "text-[#C24545]" },
  filled: { dot: "bg-gold-500", label: "Filled", text: "text-gold-400" },
  draft: { dot: "bg-grey-600", label: "Draft", text: "text-grey-500" },
};

interface Props {
  job: Job;
}

export const JobCard = ({ job }: Props) => {
  const status = STATUS_STYLE[job.status];

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 240, damping: 24 }}
      className="surface-card glass-card-hover group overflow-hidden"
    >
      <Link to={`/jobs/${job.id}`} className="block">
        <div className="relative aspect-[16/8] w-full overflow-hidden">
          {job.yacht.imageUrl ? (
            <img
              src={job.yacht.imageUrl}
              alt={job.yacht.name}
              loading="lazy"
              className="h-full w-full object-cover grayscale-[15%] transition-transform duration-[600ms] ease-out group-hover:scale-[1.03] group-hover:grayscale-0"
            />
          ) : (
            <div className="h-full w-full bg-white/[0.03]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-surface/95 via-surface/30 to-transparent" />

          <span className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-black/40 px-2.5 py-1 text-[11px] font-medium backdrop-blur-md">
            <span className={cn("h-1.5 w-1.5 rounded-full", status.dot)} />
            <span className={status.text}>{status.label}</span>
          </span>
        </div>

        <div className="space-y-4 px-6 pb-6 pt-5">
          <div className="space-y-1.5">
            <div className="eyebrow">{titleCase(job.position)}</div>
            <h3 className="text-[17px] font-semibold leading-tight tracking-tight text-white">
              {job.title}
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px] text-grey-400">
            <span className="inline-flex items-center gap-1.5">
              <EnvironmentOutlined className="text-grey-500" /> {job.location}
            </span>
            <span className="text-white">
              {formatCurrency(job.salary.min, job.salary.currency)} –{" "}
              {formatCurrency(job.salary.max, job.salary.currency)}
              <span className="ml-1 text-grey-500">/{job.salary.period}</span>
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            <span className="chip">{titleCase(job.contractType)}</span>
            <span className="chip">
              {job.yacht.length}m · {titleCase(job.yacht.type)}
            </span>
            {job.languages.slice(0, 2).map((l) => (
              <span key={l} className="chip">
                {l.toUpperCase()}
              </span>
            ))}
          </div>

          <div className="flex items-center justify-between border-t border-white/[0.04] pt-4 text-[12px]">
            <span className="inline-flex items-center gap-1.5 text-grey-400">
              <TeamOutlined className="text-grey-500" />
              <strong className="font-semibold text-white">
                {job.applicationsCount}
              </strong>
              <span className="text-grey-500">applicants</span>
            </span>
            <span className="inline-flex items-center gap-1.5 text-teal-300 transition-transform group-hover:translate-x-0.5">
              View <ArrowRightOutlined className="text-[10px]" />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};
