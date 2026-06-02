import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { ConfigProvider, App as AntApp, theme as antTheme } from "antd";

import { store } from "@redux/store";
import { AuthProvider } from "@app/AuthProvider";
import App from "@app/App";

import "antd/dist/reset.css";
import "./index.css";

/**
 * Minimal luxury theme.
 * - Single accent (teal) for actions & active states.
 * - Surfaces match Tailwind tokens precisely so visual edges align.
 */
/**
 * Strict design tokens — Meridian admin (cool-dark palette).
 *
 *   bg            #050B14   page background
 *   card          #0F1724   container / panel
 *   surface high  #151E2D   elevated / secondary surface
 *   accent        #22C7B8   single accent
 *   text primary  #FFFFFF
 *   text secondary#94A3B8
 *   text muted    #64748B
 *   border        rgba(255,255,255,0.08)
 *   border hover  rgba(34,199,184,0.35)
 *   hover overlay rgba(255,255,255,0.05)
 */
const antdTheme = {
  algorithm: antTheme.darkAlgorithm,
  token: {
    colorPrimary: "#22C7B8",
    colorInfo: "#22C7B8",
    colorSuccess: "#22C7B8",
    colorWarning: "#D4B25F",
    colorError: "#AA2727",
    colorBgBase: "#050B14",
    colorBgContainer: "#0F1724",
    colorBgElevated: "#0F1724",
    colorTextBase: "#FFFFFF",
    colorText: "#FFFFFF",
    colorTextSecondary: "#94A3B8",
    colorTextTertiary: "#64748B",
    colorTextQuaternary: "#64748B",
    colorTextDescription: "#94A3B8",
    colorTextPlaceholder: "#64748B",
    colorTextDisabled: "#475569",
    colorBorder: "rgba(255,255,255,0.08)",
    colorBorderSecondary: "rgba(255,255,255,0.05)",
    colorSplit: "rgba(255,255,255,0.08)",
    colorFill: "rgba(255,255,255,0.05)",
    colorFillSecondary: "rgba(255,255,255,0.05)",
    colorFillTertiary: "rgba(255,255,255,0.03)",
    colorFillQuaternary: "rgba(255,255,255,0.02)",
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
    Card: { colorBgContainer: "#0F1724" },
    Table: { headerBg: "transparent", rowHoverBg: "rgba(255,255,255,0.03)" },
    Tabs: { itemSelectedColor: "#FFFFFF", inkBarColor: "#22C7B8" },
  },
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <ConfigProvider theme={antdTheme}>
        <AntApp>
          <BrowserRouter>
            <AuthProvider>
              <App />
            </AuthProvider>
          </BrowserRouter>
        </AntApp>
      </ConfigProvider>
    </Provider>
  </React.StrictMode>,
);
