# Helm — Yacht Crew Hiring Dashboard

A production-ready frontend for a luxury superyacht crew hiring platform.
Built for **Owners**, **Captains** and **Agents** to post jobs, discover crew,
manage applications, chat in real time, schedule interviews and run yacht
company profiles.

## Stack

| Concern             | Library                                       |
| ------------------- | --------------------------------------------- |
| Framework           | React 18 + TypeScript + Vite                  |
| Styling             | Tailwind CSS 3 + Ant Design 5 (hybrid)        |
| State               | Redux Toolkit                                 |
| Data fetching       | RTK Query                                     |
| Forms               | React Hook Form + Zod                         |
| Realtime            | Socket.io-client                              |
| Routing             | React Router DOM 6                            |
| Charts              | Recharts                                      |
| Animations          | Framer Motion                                 |

## Quick start

```bash
npm install
cp .env.example .env       # optional — pre-set in code
npm run dev                # opens on http://localhost:5173
```

Demo credentials are pre-filled on the login screen — just click **Sign in**.
The dashboard runs against an in-memory mock API so it's fully usable without
a backend.

### Scripts

| Command           | Purpose                                  |
| ----------------- | ---------------------------------------- |
| `npm run dev`     | Vite dev server with HMR                 |
| `npm run build`   | Type-check & production build            |
| `npm run preview` | Preview the production build locally     |
| `npm run type-check` | `tsc --noEmit` (CI-friendly)          |

## Project layout

```
src/
├── app/                  # Bootstrapping (App, AuthProvider)
├── routes/               # Route table & protected-route gate
├── layouts/              # DashboardLayout (sidebar + topbar)
├── pages/                # Standalone pages (Login, NotFound)
├── modules/              # Domain modules (one per feature)
│   ├── dashboard/
│   ├── jobs/
│   ├── crew/
│   ├── applications/
│   ├── messaging/
│   ├── notifications/
│   ├── schedule/
│   └── settings/
├── components/           # Reusable presentational components
│   ├── cards/            # StatCard, JobCard, CrewCard
│   ├── common/           # Sidebar, Topbar, GlassPanel, Modal, Drawer
│   ├── feedback/         # PageLoader, EmptyState, Skeletons
│   ├── form/             # Field
│   └── tables/           # ApplicationsTable
├── redux/                # Store + slices (auth, ui, chat, notifications)
├── services/             # baseApi.ts (RTK Query) + mockData.ts
├── socket/               # SocketProvider + events
├── hooks/                # useAuth, useMediaQuery, useTypingIndicator, …
├── types/                # Cross-cutting TypeScript types
├── utils/                # cn, format, constants
└── assets/
```

## Architecture notes

### RTK Query base API

`src/services/baseApi.ts` defines every endpoint the app needs and uses a
`mockBaseQuery` to resolve against in-memory fixtures. To wire to a real
backend, swap that for `fetchBaseQuery({ baseUrl: API_BASE_URL })` — every
endpoint definition stays the same.

### Realtime

`SocketProvider` connects to `VITE_SOCKET_URL` and exposes:

- `chat:typing`, `message:new`, `message:seen`, `presence:update`
- `notification:new` (auto-prepended to the dropdown)

Reconnects are retried 5 times with a 2s backoff. Connection failures are
silent so the dashboard is fully usable offline.

### Role-based routing

`ProtectedRoute` supports an optional `allow` prop with a `UserRole[]` list.
The `/jobs/new` route, for example, requires `owner | agent | captain | admin`.
You can decorate any nested route the same way.

### Theming

Tailwind's `corePlugins.preflight` is disabled so Ant Design's reset wins.
Custom tokens for colour, radii, shadows, and animations live in
`tailwind.config.js`. The dark Ant Design theme is configured in `main.tsx`.

## Switching from mock to real backend

1. Add real values to `.env`:
   ```
   VITE_API_BASE_URL=https://api.yourdomain.com/v1
   VITE_SOCKET_URL=wss://api.yourdomain.com
   ```
2. In `src/services/baseApi.ts`, replace `mockBaseQuery` with
   `fetchBaseQuery({ baseUrl: API_BASE_URL, prepareHeaders: ... })`.
3. Delete `src/services/mockData.ts`.

That's it — the rest of the app keeps working because every component reads
through the RTK Query hooks.
