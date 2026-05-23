import { DatePicker, Input, Select } from "antd";
import dayjs from "dayjs";
import { Controller, useFormContext } from "react-hook-form";

import { Field } from "@components/form/Field";
import { CREW_POSITION_OPTIONS } from "@utils/constants";
import type { JobFormValues } from "../schema";

const CONTRACT_OPTIONS = [
  { label: "Permanent", value: "permanent" },
  { label: "Rotational", value: "rotational" },
  { label: "Seasonal", value: "seasonal" },
  { label: "Delivery", value: "delivery" },
  { label: "Day work", value: "day-work" },
];

export const StepBasics = () => {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<JobFormValues>();

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
      <Field
        label="Job title"
        required
        error={errors.title?.message}
        className="md:col-span-2"
      >
        <Input
          size="large"
          placeholder="e.g. Chief Stewardess — M/Y Aurora Borealis"
          {...register("title")}
        />
      </Field>

      <Field label="Position" required error={errors.position?.message}>
        <Controller
          control={control}
          name="position"
          render={({ field }) => (
            <Select
              size="large"
              options={CREW_POSITION_OPTIONS}
              value={field.value}
              onChange={field.onChange}
              placeholder="Select position"
              showSearch
              optionFilterProp="label"
            />
          )}
        />
      </Field>

      <Field
        label="Contract type"
        required
        error={errors.contractType?.message}
      >
        <Controller
          control={control}
          name="contractType"
          render={({ field }) => (
            <Select
              size="large"
              options={CONTRACT_OPTIONS}
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />
      </Field>

      <Field
        label="Location"
        required
        error={errors.location?.message}
        className="md:col-span-2"
      >
        <Input
          size="large"
          placeholder="e.g. Antibes, France"
          {...register("location")}
        />
      </Field>

      <Field label="Start date" required error={errors.startDate?.message}>
        <Controller
          control={control}
          name="startDate"
          render={({ field }) => (
            <DatePicker
              size="large"
              className="!w-full"
              value={field.value ? dayjs(field.value) : null}
              onChange={(d) =>
                field.onChange(d ? d.format("YYYY-MM-DD") : "")
              }
            />
          )}
        />
      </Field>

      <Field label="End date" hint="Optional" error={errors.endDate?.message}>
        <Controller
          control={control}
          name="endDate"
          render={({ field }) => (
            <DatePicker
              size="large"
              className="!w-full"
              value={field.value ? dayjs(field.value) : null}
              onChange={(d) =>
                field.onChange(d ? d.format("YYYY-MM-DD") : undefined)
              }
            />
          )}
        />
      </Field>
    </div>
  );
};
