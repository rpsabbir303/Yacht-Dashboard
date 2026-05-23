import { z } from "zod";

export const jobSchema = z.object({
  /* Step 1 — basics */
  title: z.string().min(4, "Title must be at least 4 characters"),
  position: z.string().min(1, "Position is required"),
  contractType: z.enum([
    "permanent",
    "rotational",
    "seasonal",
    "delivery",
    "day-work",
  ]),
  location: z.string().min(2, "Location is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),

  /* Step 2 — yacht */
  yacht: z.object({
    name: z.string().min(2, "Yacht name is required"),
    length: z.number().min(10, "Length must be at least 10m"),
    type: z.enum(["motor", "sail", "explorer", "catamaran"]),
    flag: z.string().optional(),
    imageUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  }),

  /* Step 3 — compensation */
  salary: z
    .object({
      currency: z.enum(["EUR", "USD", "GBP"]),
      min: z.number().min(0),
      max: z.number().min(0),
      period: z.enum(["monthly", "weekly", "daily"]),
    })
    .refine((s) => s.max >= s.min, {
      message: "Maximum must be greater than minimum",
      path: ["max"],
    }),

  /* Step 4 — requirements */
  description: z
    .string()
    .min(40, "Description must be at least 40 characters"),
  responsibilities: z.array(z.string().min(2)).min(1, "Add at least one"),
  requirements: z.array(z.string().min(2)).min(1, "Add at least one"),
  certifications: z.array(z.string()).default([]),
  languages: z.array(z.string()).min(1, "Pick at least one language"),
});

export type JobFormValues = z.infer<typeof jobSchema>;

export const defaultJobValues: JobFormValues = {
  title: "",
  position: "stewardess",
  contractType: "permanent",
  location: "",
  startDate: "",
  endDate: undefined,
  yacht: { name: "", length: 30, type: "motor", flag: "", imageUrl: "" },
  salary: { currency: "EUR", min: 3000, max: 5000, period: "monthly" },
  description: "",
  responsibilities: [],
  requirements: [],
  certifications: [],
  languages: ["en"],
};
