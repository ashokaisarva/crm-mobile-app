# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Mobile**: Expo (React Native) — artifacts/mobile

## Artifacts

- **CRM Mobile App** (`artifacts/mobile`) — Expo React Native app
  - Dashboard, Leads, Deals Pipeline, Tasks, Profile tabs
  - Backend API: `https://crm-demo.isarva.in/api/mobile` (Bearer token auth)
  - Real API integrations: Dashboard (`/dashboard`), Leads list (`/leads`)
  - Screens: Home, Leads, Deals, Tasks, Profile, Lead Details, Add Lead, Add Deal, Add Task
  - Blue & white color theme, Poppins font, Lucide SVG icons
  - Icons: `components/Icon.tsx` (lucide-react-native v0.475.0)
  - Lead store: `stores/leadStore.ts` (bridges list→detail navigation)
  - Leads: paginated, searchable, filterable by status, pull-to-refresh, infinite scroll

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally
- `pnpm --filter @workspace/mobile run dev` — run Expo mobile app

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
