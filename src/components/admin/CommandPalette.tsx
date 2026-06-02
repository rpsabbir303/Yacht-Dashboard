import { Input, Spin } from "antd";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useGlobalSearch } from "@hooks/useGlobalSearch";
import { cn } from "@utils/cn";
import type { SearchResult, SearchResultKind } from "@/types";

const KIND_LABEL: Record<SearchResultKind, string> = {
  crew: "Crew",
  owner: "Owner",
  job: "Job",
  application: "Application",
};

const KIND_TONE: Record<SearchResultKind, string> = {
  crew: "text-teal-300 bg-teal-500/10 ring-teal-500/20",
  owner: "text-gold-400 bg-gold-500/10 ring-gold-500/20",
  job: "text-white bg-white/[0.05] ring-white/[0.08]",
  application: "text-grey-300 bg-white/[0.05] ring-white/[0.08]",
};

/**
 * Global ⌘K / Ctrl+K command palette. Mounted once at the layout level —
 * keystrokes are wired up by `useGlobalSearch` so any page can trigger it.
 */
export const CommandPalette = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const { open, close, results, isFetching } = useGlobalSearch(query);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  useEffect(() => setActiveIndex(0), [results]);

  const grouped = useMemo(() => {
    const map = new Map<SearchResultKind, SearchResult[]>();
    results.forEach((r) => {
      const list = map.get(r.kind) ?? [];
      list.push(r);
      map.set(r.kind, list);
    });
    return Array.from(map.entries());
  }, [results]);

  const onSelect = (r: SearchResult) => {
    close();
    navigate(r.href);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, Math.max(results.length - 1, 0)));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
      }
      if (e.key === "Enter" && results[activeIndex]) {
        e.preventDefault();
        onSelect(results[activeIndex]);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, results, activeIndex]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[1100] flex items-start justify-center bg-black/60 backdrop-blur-sm px-4 pt-[14vh]"
          onClick={close}
        >
          <motion.div
            initial={{ y: -12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -12, opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[680px] overflow-hidden rounded-3xl border border-white/[0.08] bg-surface shadow-elevated"
          >
            <div className="border-b border-white/[0.08] px-5 py-3.5">
              <Input
                autoFocus
                size="large"
                placeholder="Search crew, owners, jobs, applications…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                bordered={false}
                className="!bg-transparent !text-white placeholder:!text-grey-500"
                suffix={
                  <kbd className="hidden rounded-md border border-white/[0.08] bg-white/[0.05] px-1.5 py-0.5 text-[10px] font-medium text-grey-500 sm:inline-block">
                    ESC
                  </kbd>
                }
              />
            </div>

            <div className="max-h-[60vh] overflow-y-auto">
              {isFetching && (
                <div className="flex items-center justify-center py-8">
                  <Spin size="small" />
                </div>
              )}

              {!isFetching && results.length === 0 && (
                <div className="px-6 py-12 text-center">
                  <div className="text-sm text-grey-400">
                    {query.trim()
                      ? "No results found"
                      : "Search across crew, owners, jobs and applications."}
                  </div>
                  {!query.trim() && (
                    <div className="mt-3 flex items-center justify-center gap-2 text-[11px] uppercase tracking-[0.18em] text-grey-500">
                      <kbd className="rounded-md border border-white/[0.08] bg-white/[0.05] px-1.5 py-0.5 normal-case tracking-normal text-grey-400">
                        ↑↓
                      </kbd>
                      <span>Navigate</span>
                      <span className="text-grey-600">·</span>
                      <kbd className="rounded-md border border-white/[0.08] bg-white/[0.05] px-1.5 py-0.5 normal-case tracking-normal text-grey-400">
                        Enter
                      </kbd>
                      <span>Open</span>
                    </div>
                  )}
                </div>
              )}

              {!isFetching && results.length > 0 && (
                <div className="py-2">
                  {grouped.map(([kind, items]) => (
                    <div key={kind} className="mb-2">
                      <div className="px-5 pb-1.5 pt-3 text-[10px] uppercase tracking-[0.2em] text-grey-500">
                        {KIND_LABEL[kind]}
                      </div>
                      {items.map((r) => {
                        const globalIndex = results.indexOf(r);
                        const isActive = globalIndex === activeIndex;
                        return (
                          <button
                            key={`${r.kind}-${r.id}`}
                            type="button"
                            onMouseEnter={() => setActiveIndex(globalIndex)}
                            onClick={() => onSelect(r)}
                            className={cn(
                              "flex w-full items-center gap-3 px-5 py-2.5 text-left transition-colors",
                              isActive
                                ? "bg-teal-500/[0.08]"
                                : "hover:bg-white/[0.05]",
                            )}
                          >
                            <span
                              className={cn(
                                "rounded-md px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider ring-1",
                                KIND_TONE[r.kind],
                              )}
                            >
                              {KIND_LABEL[r.kind]}
                            </span>
                            <div className="min-w-0 flex-1">
                              <div className="truncate text-[13.5px] font-medium text-white">
                                {r.title}
                              </div>
                              {r.subtitle && (
                                <div className="truncate text-[12px] text-grey-500">
                                  {r.subtitle}
                                </div>
                              )}
                            </div>
                            {r.meta && (
                              <span className="ml-3 shrink-0 text-[11px] uppercase tracking-wider text-grey-500">
                                {r.meta}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
