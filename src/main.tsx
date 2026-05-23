import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { ConfigProvider, App as AntApp, theme as antTheme } from "antd";

import { store } from "@redux/store";
import { AuthProvider } from "@app/AuthProvider";
import { SocketProvider } from "@socket/SocketProvider";
import App from "@app/App";

import "antd/dist/reset.css";
import "./index.css";

/**
 * Minimal luxury theme.
 * - Single accent (teal) for actions & active states.
 * - Surfaces match Tailwind tokens precisely so visual edges align.
 */
const antdTheme = {
  algorithm: antTheme.darkAlgorithm,
  token: {
    colorPrimary: "#14B8A6",
    colorInfo: "#14B8A6",
    colorSuccess: "#14B8A6",
    colorWarning: "#C6A75E",
    colorError: "#AA2727",
    colorBgBase: "#0D0F12",
    colorBgContainer: "#171A1F",
    colorBgElevated: "#171A1F",
    colorTextBase: "#FFFFFF",
    colorBorder: "rgba(255,255,255,0.06)",
    colorBorderSecondary: "rgba(255,255,255,0.04)",
    borderRadius: 12,
    borderRadiusLG: 16,
    borderRadiusSM: 8,
    controlHeight: 40,
    controlHeightLG: 44,
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
    boxShadow:
      "0 1px 0 0 rgba(255,255,255,0.03) inset, 0 10px 30px -18px rgba(0,0,0,0.6)",
    boxShadowSecondary:
      "0 1px 0 0 rgba(255,255,255,0.03) inset, 0 10px 30px -18px rgba(0,0,0,0.6)",
  },
  components: {
    Button: {
      primaryShadow: "none",
      defaultShadow: "none",
    },
    Tag: { borderRadiusSM: 999, fontSizeSM: 11 },
    Modal: { paddingContentHorizontalLG: 24 },
    Card: { colorBgContainer: "#171A1F" },
    Table: { headerBg: "transparent", rowHoverBg: "rgba(255,255,255,0.02)" },
    Tabs: { itemSelectedColor: "#FFFFFF", inkBarColor: "#14B8A6" },
  },
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <ConfigProvider theme={antdTheme}>
        <AntApp>
          <BrowserRouter>
            <AuthProvider>
              <SocketProvider>
                <App />
              </SocketProvider>
            </AuthProvider>
          </BrowserRouter>
        </AntApp>
      </ConfigProvider>
    </Provider>
  </React.StrictMode>,
);
