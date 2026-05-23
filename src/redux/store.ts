import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";

import { baseApi } from "@services/baseApi";
import { adminApi } from "@services/adminApi";
import authReducer from "./slices/authSlice";
import uiReducer from "./slices/uiSlice";
import chatReducer from "./slices/chatSlice";
import notificationReducer from "./slices/notificationSlice";

export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
    [adminApi.reducerPath]: adminApi.reducer,
    auth: authReducer,
    ui: uiReducer,
    chat: chatReducer,
    notifications: notificationReducer,
  },
  middleware: (getDefault) =>
    getDefault({
      serializableCheck: {
        ignoredActions: ["socket/connected", "socket/disconnected"],
      },
    })
      .concat(baseApi.middleware)
      .concat(adminApi.middleware),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
