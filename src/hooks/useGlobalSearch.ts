import { useEffect } from "react";

import { useAppDispatch, useAppSelector } from "@redux/hooks";
import { useLazyGlobalSearchQuery } from "@services/adminApi";
import { toggleCommandPalette, setCommandPaletteOpen } from "@redux/slices/uiSlice";
import { useDebouncedValue } from "@hooks/useDebouncedValue";

/**
 * Wires the ⌘K / Ctrl+K shortcut to the command palette and exposes a
 * debounced search trigger. Designed to be called from a single mounted
 * `<CommandPalette />` component at the layout level.
 */
export const useGlobalSearch = (query: string) => {
  const dispatch = useAppDispatch();
  const open = useAppSelector((s) => s.ui.commandPaletteOpen);
  const debounced = useDebouncedValue(query, 220);

  const [trigger, state] = useLazyGlobalSearchQuery();

  useEffect(() => {
    if (open && debounced.trim().length > 0) {
      trigger(debounced);
    }
  }, [open, debounced, trigger]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey;
      if (meta && e.key.toLowerCase() === "k") {
        e.preventDefault();
        dispatch(toggleCommandPalette());
      }
      if (e.key === "Escape" && open) {
        dispatch(setCommandPaletteOpen(false));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dispatch, open]);

  return {
    open,
    close: () => dispatch(setCommandPaletteOpen(false)),
    results: state.data?.results ?? [],
    isFetching: state.isFetching,
  };
};
