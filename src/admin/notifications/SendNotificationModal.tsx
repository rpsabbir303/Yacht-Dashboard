import {
  BellOutlined,
  GlobalOutlined,
  MailOutlined,
  NotificationOutlined,
  ShopOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Button, DatePicker, Input, message } from "antd";
import { Controller, useForm } from "react-hook-form";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import dayjs, { type Dayjs } from "dayjs";

import { Modal } from "@components/common/Modal";
import { Field } from "@components/form/Field";
import { useSendAnnouncementMutation } from "@services/adminApi";
import { cn } from "@utils/cn";
import type { AnnouncementAudience, AnnouncementChannel } from "@/types";

interface Props {
  open: boolean;
  onClose: () => void;
}

const schema = z.object({
  title: z.string().min(4, "Title must be at least 4 characters"),
  body: z.string().min(10, "Body must be at least 10 characters"),
});

type FormValues = z.infer<typeof schema>;

const AUDIENCE: {
  value: AnnouncementAudience;
  label: string;
  icon: React.ReactNode;
}[] = [
  { value: "all", label: "All users", icon: <GlobalOutlined /> },
  { value: "crew", label: "Crew members", icon: <UserOutlined /> },
  { value: "owners-captains", label: "Owners & Captains", icon: <ShopOutlined /> },
  { value: "agents", label: "Agents", icon: <TeamOutlined /> },
];

const CHANNELS: {
  value: AnnouncementChannel;
  label: string;
  icon: React.ReactNode;
}[] = [
  { value: "in-app", label: "In-app", icon: <BellOutlined /> },
  { value: "email", label: "Email", icon: <MailOutlined /> },
  { value: "push", label: "Push", icon: <NotificationOutlined /> },
];

export const SendNotificationModal = ({ open, onClose }: Props) => {
  const [audience, setAudience] = useState<AnnouncementAudience>("all");
  const [channels, setChannels] = useState<AnnouncementChannel[]>(["in-app"]);
  const [scheduleFor, setScheduleFor] = useState<Dayjs | null>(null);

  const { control, handleSubmit, reset, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { title: "", body: "" },
  });

  const [send, { isLoading }] = useSendAnnouncementMutation();

  const toggleChannel = (c: AnnouncementChannel) => {
    setChannels((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c],
    );
  };

  const submit = handleSubmit(async (values) => {
    if (channels.length === 0) {
      message.warning("Select at least one delivery channel");
      return;
    }
    try {
      await send({
        title: values.title,
        body: values.body,
        audience,
        channels,
        scheduledFor: scheduleFor?.toISOString(),
      }).unwrap();
      message.success(
        scheduleFor
          ? `Scheduled for ${scheduleFor.format("MMM D · HH:mm")}`
          : "Notification sent",
      );
      reset();
      setAudience("all");
      setChannels(["in-app"]);
      setScheduleFor(null);
      onClose();
    } catch {
      message.error("Failed to send notification");
    }
  });

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title="New notification"
      width={560}
      footer={
        <div className="flex items-center justify-between">
          <div className="text-[12px] text-grey-500">
            {scheduleFor ? "Will be scheduled" : "Will be sent now"}
          </div>
          <div className="flex gap-2">
            <Button onClick={onClose}>Cancel</Button>
            <Button type="primary" loading={isLoading} onClick={submit}>
              {scheduleFor ? "Schedule" : "Send notification"}
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-5">
        <Controller
          control={control}
          name="title"
          render={({ field }) => (
            <Field label="Title" error={formState.errors.title?.message}>
              <Input
                {...field}
                placeholder="e.g. New verification requirements for owners"
              />
            </Field>
          )}
        />

        <Controller
          control={control}
          name="body"
          render={({ field }) => (
            <Field
              label="Body"
              error={formState.errors.body?.message}
              hint="Markdown is not supported in this mock — newlines preserved."
            >
              <Input.TextArea
                {...field}
                rows={5}
                placeholder="Write the notification content…"
              />
            </Field>
          )}
        />

        <div>
          <div className="mb-2 text-[10px] uppercase tracking-[0.18em] text-grey-500">
            Audience
          </div>
          <div className="grid grid-cols-2 gap-2">
            {AUDIENCE.map((a) => (
              <button
                key={a.value}
                type="button"
                onClick={() => setAudience(a.value)}
                className={cn(
                  "flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-[13px] transition",
                  audience === a.value
                    ? "border-teal-500/30 bg-teal-500/[0.06] text-white"
                    : "border-white/[0.05] bg-white/[0.015] text-grey-400 hover:border-white/[0.1] hover:text-white",
                )}
              >
                <span
                  className={cn(
                    audience === a.value ? "text-teal-300" : "text-grey-500",
                  )}
                >
                  {a.icon}
                </span>
                {a.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-2 text-[10px] uppercase tracking-[0.18em] text-grey-500">
            Channels
          </div>
          <div className="flex flex-wrap gap-2">
            {CHANNELS.map((c) => {
              const active = channels.includes(c.value);
              return (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => toggleChannel(c.value)}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[12.5px] transition",
                    active
                      ? "border-teal-500/30 bg-teal-500/[0.06] text-teal-300"
                      : "border-white/[0.05] bg-white/[0.015] text-grey-400 hover:border-white/[0.1] hover:text-white",
                  )}
                >
                  {c.icon}
                  {c.label}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <div className="mb-2 text-[10px] uppercase tracking-[0.18em] text-grey-500">
            Schedule (optional)
          </div>
          <DatePicker
            showTime
            value={scheduleFor}
            onChange={setScheduleFor}
            placeholder="Send immediately"
            disabledDate={(d) => d.isBefore(dayjs().startOf("day"))}
            className="w-full"
          />
        </div>
      </div>
    </Modal>
  );
};
