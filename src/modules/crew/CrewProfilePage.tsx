import {
  ArrowLeftOutlined,
  CheckCircleFilled,
  EnvironmentOutlined,
  GlobalOutlined,
  MessageOutlined,
  StarFilled,
} from "@ant-design/icons";
import { Avatar, Button, Tag, Tabs } from "antd";
import { useNavigate, useParams } from "react-router-dom";

import { CardSkeleton } from "@components/feedback/LoadingSkeleton";
import { GlassPanel } from "@components/common/GlassPanel";
import { useGetCrewQuery } from "@services/baseApi";
import { formatDate, initials, titleCase } from "@utils/format";

const CrewProfilePage = () => {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { data: crew, isLoading } = useGetCrewQuery(id);

  if (isLoading || !crew) {
    return (
      <div className="space-y-4">
        <CardSkeleton lines={4} showAvatar />
        <CardSkeleton lines={5} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-sm text-slate-300 hover:text-white"
      >
        <ArrowLeftOutlined /> Back
      </button>

      <GlassPanel padding="none" className="overflow-hidden">
        <div className="relative h-36 w-full overflow-hidden bg-[#13161A]">
          {crew.coverUrl && (
            <img
              src={crew.coverUrl}
              alt=""
              className="h-full w-full object-cover opacity-50 grayscale"
            />
          )}
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-surface to-transparent" />
        </div>
        <div className="-mt-14 flex flex-col gap-4 px-7 pb-7 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-end">
            <Avatar
              size={128}
              src={crew.avatarUrl}
              className="border-4 border-ink shadow-card"
            >
              {initials(crew.fullName)}
            </Avatar>
            <div className="text-center sm:text-left">
              <div className="flex items-center justify-center gap-2 sm:justify-start">
                <h1 className="font-display text-2xl font-semibold text-white">
                  {crew.fullName}
                </h1>
                {crew.verified && (
                  <CheckCircleFilled
                    className="text-ocean-300"
                    title="Verified"
                  />
                )}
              </div>
              <div className="muted text-sm">{crew.headline}</div>
              <div className="mt-1 flex flex-wrap items-center justify-center gap-3 text-xs text-slate-300 sm:justify-start">
                <span className="inline-flex items-center gap-1">
                  <StarFilled className="text-gold-400" /> {crew.rating.toFixed(1)}
                  <span className="muted">({crew.reviewsCount})</span>
                </span>
                <span className="inline-flex items-center gap-1">
                  <EnvironmentOutlined className="text-ocean-300" />{" "}
                  {crew.location}
                </span>
                <span className="inline-flex items-center gap-1">
                  <GlobalOutlined className="text-ocean-300" />{" "}
                  {crew.languages.map((l) => l.toUpperCase()).join(" · ")}
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-2 sm:justify-end">
            <Button
              size="large"
              icon={<MessageOutlined />}
              className="!rounded-xl"
              onClick={() => navigate("/messages")}
            >
              Message
            </Button>
            <Button
              size="large"
              type="primary"
              className="!rounded-xl !shadow-glow"
            >
              Shortlist
            </Button>
          </div>
        </div>
      </GlassPanel>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <GlassPanel padding="sm">
            <Tabs
              defaultActiveKey="about"
              items={[
                {
                  key: "about",
                  label: "About",
                  children: (
                    <div className="px-2 pb-2">
                      <p className="whitespace-pre-wrap text-sm text-slate-200/90">
                        {crew.bio}
                      </p>
                    </div>
                  ),
                },
                {
                  key: "experience",
                  label: `Experience (${crew.experience.length})`,
                  children: (
                    <ul className="space-y-3 px-2 pb-2">
                      {crew.experience.length === 0 && (
                        <li className="muted text-sm">
                          No experience listed yet.
                        </li>
                      )}
                      {crew.experience.map((e) => (
                        <li
                          key={e.id}
                          className="rounded-2xl border border-white/5 bg-white/[0.03] p-4"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="font-medium text-white">
                                {titleCase(e.position)} · {e.yachtName}
                              </div>
                              <div className="muted text-xs">
                                {e.yachtLength}m
                              </div>
                            </div>
                            <div className="text-xs text-slate-400">
                              {formatDate(e.from)} —{" "}
                              {e.to ? formatDate(e.to) : "present"}
                            </div>
                          </div>
                          {e.description && (
                            <p className="mt-2 text-sm text-slate-200/90">
                              {e.description}
                            </p>
                          )}
                        </li>
                      ))}
                    </ul>
                  ),
                },
                {
                  key: "certs",
                  label: `Certifications (${crew.certifications.length})`,
                  children: (
                    <div className="grid grid-cols-1 gap-3 px-2 pb-2 sm:grid-cols-2">
                      {crew.certifications.map((c) => (
                        <div
                          key={c.id}
                          className="rounded-2xl border border-white/5 bg-white/[0.03] p-4"
                        >
                          <div className="font-medium text-white">{c.name}</div>
                          <div className="muted text-xs">
                            Issued by {c.issuedBy} · {formatDate(c.issuedOn)}
                          </div>
                          {c.expiresOn && (
                            <div className="text-[11px] text-slate-400">
                              Expires {formatDate(c.expiresOn)}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ),
                },
              ]}
            />
          </GlassPanel>
        </div>

        <div className="space-y-6">
          <GlassPanel title="At a glance">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="muted">Position</span>
                <span className="text-white">
                  {titleCase(crew.position)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="muted">Experience</span>
                <span className="text-white">
                  {crew.yearsOfExperience} years
                </span>
              </div>
              <div className="flex justify-between">
                <span className="muted">Nationality</span>
                <span className="text-white">{crew.nationality}</span>
              </div>
              <div className="flex justify-between">
                <span className="muted">Availability</span>
                <span className="text-white">
                  {titleCase(crew.availability)}
                </span>
              </div>
              {crew.hourlyRate && (
                <div className="flex justify-between">
                  <span className="muted">Day rate</span>
                  <span className="text-white">
                    {crew.hourlyRate * 8} {crew.currency}/day
                  </span>
                </div>
              )}
            </div>
          </GlassPanel>

          <GlassPanel title="Languages">
            <div className="flex flex-wrap gap-1.5">
              {crew.languages.map((l) => (
                <Tag
                  key={l}
                  bordered={false}
                  className="!bg-ocean-500/15 !text-ocean-200"
                >
                  {l.toUpperCase()}
                </Tag>
              ))}
            </div>
          </GlassPanel>
        </div>
      </div>
    </div>
  );
};

export default CrewProfilePage;
