# Frontend Interview Test

Starter project for the frontend interview test.

## Stack

| Concern        | Choice                          | Notes                                                              |
| -------------- | ------------------------------- | ----------------------------------------------------------------- |
| Framework      | React 18                        | `react@^18.3`, Strict Mode enabled in `src/main.tsx`             |
| Language       | TypeScript 5 (strict)           | `strict` + `noUncheckedIndexedAccess` + `exactOptionalPropertyTypes` |
| UI components  | Ant Design 5                    | All UI components come from `antd`                                |
| State          | Redux Toolkit 2                 | `configureStore` + `createSlice` + `createSelector`               |
| Styling/layout | Tailwind CSS 3                  | Layout, spacing, responsive **and dark mode** utilities           |
| Routing        | React Router 6                  | `createBrowserRouter`, nested under the app shell                 |
| Build tool     | Vite 5                          | `@vitejs/plugin-react`, vendor `manualChunks`                     |

## Getting started

```bash
npm install
npm run dev        # start dev server
npm run build      # type-check (tsc -b) + production build
npm run preview    # preview the production build
npm run typecheck  # type-check only
npm run lint       # eslint
npm test           # run the unit tests once
npm run test:watch # watch mode
```

## Testing

Vitest + React Testing Library, configured in `vitest.config.ts`
(JS DOM environment, no globals — each spec imports from `vitest`).

| Spec | Covers |
| --- | --- |
| `store/selectors.test.ts` | stats, filtering, sorting, pagination, memoization |
| `components/StatCard.test.tsx` | title/value/hint/icon, accent colour, loading state |
| `components/BreakdownCard.test.tsx` | legend, stacked-bar widths, empty state |
| `utils/queryParams.test.ts` | query serialisation, parsing, malformed URLs, round trip |
| `hooks/useFiltersQueryParams.test.tsx` | URL ⇄ store hydration, write-back, clearing, no oscillation, StrictMode |
| `store/preloadedState.test.ts` | seeding filters from a URL at startup |
| `store/tasksSlice.test.ts` | pagination/filter actions and page resets |
| `components/TaskTable.test.tsx` | paging must not disturb the sort; sort reporting |
| `pages/TasksPage.test.tsx` | end-to-end paging and the 5/10/15 rows-per-page selector |

Run a single file: `npx vitest run src/features/tasks/store/selectors.test.ts`.

## Features

- **App shell** — collapsible dark sidebar (becomes a drawer on mobile), sticky
  header with search, notifications, theme toggle and a user menu.
- **Dashboard** (`/dashboard`) — four stat tiles, status and priority
  breakdowns (stacked bar + per-row progress), and the 5 most recent tasks.
- **Tasks** (`/tasks`) — full table with text search, status/priority filters,
  due-date range, column sorting, a 5 / 10 / 15 rows-per-page selector, and
  create / edit / delete.
- **Shareable filters** — the active filters are mirrored into the URL query
  string (`/tasks?q=ui&status=done&from=2026-10-01&to=2026-10-31`), so links can
  be shared and the browser back/forward buttons work.
- **Theming** — light/dark switch persisted to `localStorage` and reflected via
  Tailwind's `dark:` variant plus antd's `darkAlgorithm`.
- **Loading & empty states** — `StatCard` and `TaskTable` accept a `loading`
  prop (antd skeleton / table spinner) and `TaskTable` / `BreakdownCard` render
  antd `Empty` placeholders when there is nothing to show. The seed data is
  synchronous, so the spinner stays idle until the data source is async.

## Project structure

```
src/
├── app/
│   ├── hooks.ts           # typed useAppDispatch / useAppSelector
│   ├── router.tsx         # route tree
│   ├── store.ts           # configureStore + RootState / AppDispatch types
│   ├── theme.ts           # antd design tokens
│   ├── ThemeProvider.tsx  # light/dark provider (component only)
│   └── themeContext.ts    # context + useThemeMode hook
├── components/layout/
│   ├── AppLayout.tsx      # shell: sider / drawer + header + <Outlet/>
│   ├── AppSider.tsx       # sidebar content (shared by sider & drawer)
│   ├── AppHeader.tsx      # sticky header
│   ├── PageHeader.tsx     # page heading + action slot
│   └── navigation.ts      # nav config (no JSX, fast-refresh friendly)
├── features/tasks/
│   ├── components/        # presentational + container components
│   ├── hooks/             # useTaskFormModal, useFiltersQueryParams
│   ├── pages/             # DashboardPage, TasksPage
│   ├── store/             # tasksSlice, selectors, seed data
│   ├── types/             # Task, TaskStatus, TaskPriority, …
│   └── utils/             # formatDate, isOverdue, initials, meta maps
├── hooks/                 # useDebouncedCallback
├── test/                  # vitest setup
├── index.css              # Tailwind directives + reset + component layer
└── main.tsx               # Redux + Theme + Router providers
```

## Conventions

- **UI components** — always use Ant Design for components (`Button`, `Card`, `Table`, ...).
- **Layout / spacing / responsive / dark mode** — Tailwind utility classes.
- **State** — one slice per feature under `store/`, derived data via
  `createSelector`, accessed through the typed hooks in `app/hooks.ts`.
- **Presentation data** (labels, colours) lives in `utils/taskMeta.ts` so tags,
  charts and stat cards stay consistent.
- **Fast refresh** — component files export components only; shared constants
  (`navigation.ts`) and hooks (`themeContext.ts`) live in their own modules.

### Tailwind + Ant Design note

Tailwind's `preflight` is disabled (`tailwind.config.js`) so it doesn't fight
Ant Design's own styles; a minimal reset lives in `src/index.css`. `darkMode`
is set to `'class'` and toggled by `ThemeProvider` on `<html>`.
