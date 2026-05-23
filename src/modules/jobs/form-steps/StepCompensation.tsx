import { InputNumber, Select } from "antd";
import { Controller, useFormContext } from "react-hook-form";

import { Field } from "@components/form/Field";
import type { JobFormValues } from "../schema";

const CURRENCY = [
  { label: "EUR €", value: "EUR" },
  { label: "USD $", value: "USD" },
  { label: "GBP £", value: "GBP" },
];

const PERIODS = [
  { label: "per month", value: "monthly" },
  { label: "per week", value: "weekly" },
  { label: "per day", value: "daily" },
];

export const StepCompensation = () => {
  const {
    control,
    formState: { errors },
  } = useFormContext<JobFormValues>();

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
      <Field
        label="Currency"
        required
        error={errors.salary?.currency?.message}
      >
        <Controller
          control={control}
          name="salary.currency"
          render={({ field }) => (
            <Select
              size="large"
              options={CURRENCY}
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />
      </Field>

      <Field label="Period" required error={errors.salary?.period?.message}>
        <Controller
          control={control}
          name="salary.period"
          render={({ field }) => (
            <Select
              size="large"
              options={PERIODS}
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />
      </Field>

      <Field label="Minimum" required error={errors.salary?.min?.message}>
        <Controller
          control={control}
          name="salary.min"
          render={({ field }) => (
            <InputNumber
              size="large"
              min={0}
              step={100}
              className="!w-full"
              value={field.value}
              onChange={(v) => field.onChange(v ?? 0)}
            />
          )}
        />
      </Field>

      <Field label="Maximum" required error={errors.salary?.max?.message}>
        <Controller
          control={control}
          name="salary.max"
          render={({ field }) => (
            <InputNumber
              size="large"
              min={0}
              step={100}
              className="!w-full"
              value={field.value}
              onChange={(v) => field.onChange(v ?? 0)}
            />
          )}
        />
      </Field>

      <div className="rounded-2xl border border-ocean-400/20 bg-ocean-500/10 p-4 text-sm text-ocean-200 md:col-span-2">
        <strong className="block text-white">Pay band visibility</strong>
        Showing a salary band increases application quality by an average of 38%.
      </div>
    </div>
  );
};
