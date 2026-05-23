import { Tag } from "antd";
import { useFormContext } from "react-hook-form";

import { formatCurrency, formatDate, titleCase } from "@utils/format";
import type { JobFormValues } from "../schema";

const Row = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex items-start justify-between gap-3 border-b border-white/5 py-2.5 text-sm last:border-b-0">
    <span className="text-slate-400">{label}</span>
    <span className="max-w-[60%] text-right text-white">{value}</span>
  </div>
);

export const StepReview = () => {
  const { watch } = useFormContext<JobFormValues>();
  const v = watch();

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <h3 className="mb-3 font-display text-base font-semibold text-white">
          Job summary
        </h3>
        <Row label="Title" value={v.title || "—"} />
        <Row label="Position" value={titleCase(v.position)} />
        <Row label="Contract" value={titleCase(v.contractType)} />
        <Row label="Location" value={v.location || "—"} />
        <Row
          label="Start"
          value={v.startDate ? formatDate(v.startDate) : "—"}
        />
        {v.endDate && <Row label="End" value={formatDate(v.endDate)} />}
        <Row
          label="Salary"
          value={`${formatCurrency(v.salary.min, v.salary.currency)} — ${formatCurrency(v.salary.max, v.salary.currency)} / ${v.salary.period}`}
        />
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <h3 className="mb-3 font-display text-base font-semibold text-white">
          Yacht
        </h3>
        <Row label="Name" value={v.yacht.name || "—"} />
        <Row label="Length" value={`${v.yacht.length} m`} />
        <Row label="Type" value={titleCase(v.yacht.type)} />
        {v.yacht.flag && <Row label="Flag" value={v.yacht.flag} />}
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:col-span-2">
        <h3 className="mb-3 font-display text-base font-semibold text-white">
          Description
        </h3>
        <p className="text-sm text-slate-200/90 whitespace-pre-wrap">
          {v.description || "—"}
        </p>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <div className="mb-2 text-xs uppercase tracking-[0.18em] text-slate-300/80">
              Responsibilities
            </div>
            <ul className="list-disc pl-5 text-sm text-slate-200/90">
              {v.responsibilities.length === 0 ? (
                <li className="muted">None</li>
              ) : (
                v.responsibilities.map((r, i) => <li key={i}>{r}</li>)
              )}
            </ul>
          </div>
          <div>
            <div className="mb-2 text-xs uppercase tracking-[0.18em] text-slate-300/80">
              Requirements
            </div>
            <ul className="list-disc pl-5 text-sm text-slate-200/90">
              {v.requirements.length === 0 ? (
                <li className="muted">None</li>
              ) : (
                v.requirements.map((r, i) => <li key={i}>{r}</li>)
              )}
            </ul>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {v.certifications.map((c) => (
            <Tag key={c} bordered={false} className="!bg-white/[0.05] !text-slate-200">
              {c}
            </Tag>
          ))}
          {v.languages.map((l) => (
            <Tag
              key={l}
              bordered={false}
              className="!bg-ocean-500/15 !text-ocean-200"
            >
              {l.toUpperCase()}
            </Tag>
          ))}
        </div>
      </div>
    </div>
  );
};
