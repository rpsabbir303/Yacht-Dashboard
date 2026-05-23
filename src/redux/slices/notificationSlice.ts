import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type { AppNotification } from "@/types";

interface NotificationState {
  realtime: AppNotification[]; // pushed by socket, prepended to the dropdown
}

const initialState: NotificationState = {
  realtime: [],
};

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    pushNotification: (state, action: PayloadAction<AppNotification>) => {
      state.realtime = [action.payload, ...state.realtime].slice(0, 20);
    },
    clearRealtime: (state) => {
      state.realtime = [];
    },
  },
});

export const { pushNotification, clearRealtime } = notificationSlice.actions;
export default notificationSlice.reducer;
