import { App as AntApp, Button, DatePicker, Input } from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";

import { Modal } from "@components/common/Modal";
import { Field } from "@components/form/Field";
import {
  useCreateScheduleEventMutation,
  useUpdateApplicationStatusMutation,
} from "@services/baseApi";
import type { Application } from "@/types";

interface Props {
  open: boolean;
  application: Application | null;
  onClose: () => void;
}

export const ScheduleInterviewModal = ({
  open,
  application,
  onClose,
}: Props) => {
  const { message } = AntApp.useApp();
  const [createEvent, { isLoading }] = useCreateScheduleEventMutation();
  const [updateStatus] = useUpdateApplicationStatusMutation();

  const [startAt, setStartAt] = useState<string>(
    dayjs().add(1, "day").hour(10).minute(0).second(0).toISOString(),
  );
  const [endAt, setEndAt] = useState<string>(
    dayjs().add(1, "day").hour(11).minute(0).second(0).toISOString(),
  );
  const [meetingUrl, setMeetingUrl] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (open) {
      setStartAt(dayjs().add(1, "day").hour(10).minute(0).toISOString());
      setEndAt(dayjs().add(1, "day").hour(11).minute(0).toISOString());
      setMeetingUrl("");
      setNotes("");
    }
  }, [open]);

  const submit = async () => {
    if (!application) return;
    try {
      await createEvent({
        type: "interview",
        title: `Interview · ${application.crew.fullName}`,
        description: notes || undefined,
        startAt,
        endAt,
        participants: [
          {
            id: application.crew.id,
            name: application.crew.fullName,
            avatarUrl: application.crew.avatarUrl,
          },
        ],
        jobId: application.job.id,
        applicationId: application.id,
        meetingUrl: meetingUrl || undefined,
      }).unwrap();
      await updateStatus({ id: application.id, status: "interview" }).unwrap();
      message.success("Interview scheduled");
      onClose();
    } catch {
      message.error("Failed to schedule interview");
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={
        application
          ? `Schedule interview · ${application.crew.fullName}`
          : "Schedule interview"
      }
      width={520}
      footer={
        <div className="flex justify-end gap-2">
          <Button onClick={onClose} className="!rounded-xl">
            Cancel
          </Button>
          <Button
            type="primary"
            loading={isLoading}
            onClick={submit}
            className="!rounded-xl !shadow-glow"
          >
            Schedule
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <Field label="Start" required>
          <DatePicker
            showTime
            className="!w-full"
            value={dayjs(startAt)}
            onChange={(d) => setStartAt(d ? d.toISOString() : startAt)}
          />
        </Field>
        <Field label="End">
          <DatePicker
            showTime
            className="!w-full"
            value={dayjs(endAt)}
            onChange={(d) => setEndAt(d ? d.toISOString() : endAt)}
          />
        </Field>
        <Field label="Meeting link" hint="Zoom, Meet, Teams…">
          <Input
            placeholder="https://meet..."
            value={meetingUrl}
            onChange={(e) => setMeetingUrl(e.target.value)}
          />
        </Field>
        <Field label="Notes">
          <Input.TextArea
            rows={3}
            placeholder="Topics to cover, references to discuss..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </Field>
      </div>
    </Modal>
  );
};
