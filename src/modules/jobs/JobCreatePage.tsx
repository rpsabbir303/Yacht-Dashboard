import { zodResolver } from "@hookform/resolvers/zod";
import {
  CheckCircleOutlined,
  CompassOutlined,
  EuroCircleOutlined,
  FileTextOutlined,
  ProfileOutlined,
} from "@ant-design/icons";
import { App as AntApp, Button, Steps } from "antd";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

import { GlassPanel } from "@components/common/GlassPanel";
import { PageHeader } from "@components/common/PageHeader";
import { useCreateJobMutation } from "@services/baseApi";
import type { CrewPosition, JobSalary, YachtSnapshot } from "@/types";

import { defaultJobValues, jobSchema, type JobFormValues } from "./schema";
import { StepBasics } from "./form-steps/StepBasics";
import { StepYacht } from "./form-steps/StepYacht";
import { StepCompensation } from "./form-steps/StepCompensation";
import { StepRequirements } from "./form-steps/StepRequirements";
import { StepReview } from "./form-steps/StepReview";

const STEPS = [
  { title: "Basics", icon: <ProfileOutlined /> },
  { title: "Yacht", icon: <CompassOutlined /> },
  { title: "Compensation", icon: <EuroCircleOutlined /> },
  { title: "Requirements", icon: <FileTextOutlined /> },
  { title: "Review", icon: <CheckCircleOutlined /> },
];

const STEP_FIELDS: (keyof JobFormValues)[][] = [
  ["title", "position", "contractType", "location", "startDate"],
  ["yacht"],
  ["salary"],
  ["description", "responsibilities", "requirements", "languages"],
  [],
];

const JobCreatePage = () => {
  const navigate = useNavigate();
  const { message } = AntApp.useApp();
  const [step, setStep] = useState(0);
  const [createJob, { isLoading }] = useCreateJobMutation();

  const methods = useForm<JobFormValues>({
    resolver: zodResolver(jobSchema),
    defaultValues: defaultJobValues,
    mode: "onTouched",
  });

  const next = async () => {
    const valid = await methods.trigger(STEP_FIELDS[step]);
    if (!valid) return;
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const prev = () => setStep((s) => Math.max(s - 1, 0));

  const onSubmit = async (values: JobFormValues) => {
    try {
      await createJob({
        title: values.title,
        position: values.position as CrewPosition,
        contractType: values.contractType,
        location: values.location,
        startDate: new Date(values.startDate).toISOString(),
        endDate: values.endDate
          ? new Date(values.endDate).toISOString()
          : undefined,
        description: values.description,
        responsibilities: values.responsibilities,
        requirements: values.requirements,
        certifications: values.certifications,
        languages: values.languages,
        salary: values.salary as JobSalary,
        yacht: values.yacht as YachtSnapshot,
        status: "open",
      }).unwrap();
      message.success("Job posted successfully");
      navigate("/jobs");
    } catch (e) {
      message.error("Failed to post job");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Hiring"
        title="Post a new job"
        subtitle="Walk through the wizard — your draft is auto-saved at each step."
      />

      <GlassPanel padding="lg">
        <Steps
          current={step}
          items={STEPS.map((s) => ({ title: s.title, icon: s.icon }))}
          className="!mb-8"
          responsive
        />

        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                {step === 0 && <StepBasics />}
                {step === 1 && <StepYacht />}
                {step === 2 && <StepCompensation />}
                {step === 3 && <StepRequirements />}
                {step === 4 && <StepReview />}
              </motion.div>
            </AnimatePresence>

            <div className="flex items-center justify-between border-t border-white/5 pt-5">
              <Button
                onClick={prev}
                disabled={step === 0}
                size="large"
                className="!rounded-xl"
              >
                Back
              </Button>
              {step < STEPS.length - 1 ? (
                <Button
                  type="primary"
                  size="large"
                  onClick={next}
                  className="!rounded-xl !shadow-glow"
                >
                  Continue
                </Button>
              ) : (
                <Button
                  type="primary"
                  size="large"
                  htmlType="submit"
                  loading={isLoading}
                  className="!rounded-xl !shadow-glow"
                >
                  Publish job
                </Button>
              )}
            </div>
          </form>
        </FormProvider>
      </GlassPanel>
    </div>
  );
};

export default JobCreatePage;
