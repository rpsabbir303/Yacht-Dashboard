import { Input, Select } from "antd";
import { Controller, useFormContext } from "react-hook-form";

import { Field } from "@components/form/Field";
import {
  CERTIFICATION_OPTIONS,
  LANGUAGE_OPTIONS,
} from "@utils/constants";
import type { JobFormValues } from "../schema";

export const StepRequirements = () => {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<JobFormValues>();

  return (
    <div className="grid grid-cols-1 gap-5">
      <Field
        label="Job description"
        required
        error={errors.description?.message}
      >
        <Input.TextArea
          rows={5}
          placeholder="Describe the program, owner expectations and overall culture..."
          {...register("description")}
        />
      </Field>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <Field
          label="Key responsibilities"
          required
          hint="Press Enter to add"
          error={errors.responsibilities?.message}
        >
          <Controller
            control={control}
            name="responsibilities"
            render={({ field }) => (
              <Select
                size="large"
                mode="tags"
                placeholder="Add a responsibility..."
                value={field.value}
                onChange={field.onChange}
                tokenSeparators={[","]}
              />
            )}
          />
        </Field>

        <Field
          label="Requirements"
          required
          hint="Press Enter to add"
          error={errors.requirements?.message}
        >
          <Controller
            control={control}
            name="requirements"
            render={({ field }) => (
              <Select
                size="large"
                mode="tags"
                placeholder="Add a requirement..."
                value={field.value}
                onChange={field.onChange}
                tokenSeparators={[","]}
              />
            )}
          />
        </Field>

        <Field label="Certifications" hint="Optional">
          <Controller
            control={control}
            name="certifications"
            render={({ field }) => (
              <Select
                size="large"
                mode="multiple"
                options={CERTIFICATION_OPTIONS}
                placeholder="Select certifications"
                value={field.value}
                onChange={field.onChange}
                maxTagCount="responsive"
              />
            )}
          />
        </Field>

        <Field
          label="Languages"
          required
          error={errors.languages?.message}
        >
          <Controller
            control={control}
            name="languages"
            render={({ field }) => (
              <Select
                size="large"
                mode="multiple"
                options={LANGUAGE_OPTIONS}
                placeholder="Select languages"
                value={field.value}
                onChange={field.onChange}
                maxTagCount="responsive"
              />
            )}
          />
        </Field>
      </div>
    </div>
  );
};
