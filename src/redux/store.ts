import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";

import { baseApi } from "@services/baseApi";
import { adminApi } from "@services/adminApi";
import authReducer from "./slices/authSlice";
import authFlowReducer from "./slices/authFlowSlice";
import uiReducer from "./slices/uiSlice";

export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
    [adminApi.reducerPath]: adminApi.reducer,
    auth: authReducer,
    authFlow: authFlowReducer,
    ui: uiReducer,
  },
  middleware: (getDefault) =>
    getDefault()
      .concat(baseApi.middleware)
      .concat(adminApi.middleware),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
