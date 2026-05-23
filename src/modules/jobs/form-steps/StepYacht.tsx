import { Input, InputNumber, Select } from "antd";
import { Controller, useFormContext } from "react-hook-form";

import { Field } from "@components/form/Field";
import type { JobFormValues } from "../schema";

const YACHT_TYPES = [
  { label: "Motor yacht", value: "motor" },
  { label: "Sailing yacht", value: "sail" },
  { label: "Explorer", value: "explorer" },
  { label: "Catamaran", value: "catamaran" },
];

export const StepYacht = () => {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<JobFormValues>();

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
      <Field
        label="Yacht name"
        required
        error={errors.yacht?.name?.message}
        className="md:col-span-2"
      >
        <Input
          size="large"
          placeholder="e.g. M/Y Aurora Borealis"
          {...register("yacht.name")}
        />
      </Field>

      <Field
        label="Length (meters)"
        required
        error={errors.yacht?.length?.message}
      >
        <Controller
          control={control}
          name="yacht.length"
          render={({ field }) => (
            <InputNumber
              size="large"
              min={10}
              max={200}
              className="!w-full"
              value={field.value}
              onChange={(v) => field.onChange(v ?? 0)}
              placeholder="e.g. 72"
            />
          )}
        />
      </Field>

      <Field label="Type" required error={errors.yacht?.type?.message}>
        <Controller
          control={control}
          name="yacht.type"
          render={({ field }) => (
            <Select
              size="large"
              options={YACHT_TYPES}
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />
      </Field>

      <Field label="Flag" hint="Optional" error={errors.yacht?.flag?.message}>
        <Input
          size="large"
          placeholder="e.g. Cayman Islands"
          {...register("yacht.flag")}
        />
      </Field>

      <Field
        label="Image URL"
        hint="Optional preview"
        error={errors.yacht?.imageUrl?.message}
      >
        <Input
          size="large"
          placeholder="https://..."
          {...register("yacht.imageUrl")}
        />
      </Field>
    </div>
  );
};
