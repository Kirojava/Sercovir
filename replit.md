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

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## Project: Sercovir

Sercovir is a Palantir-inspired geopolitical intelligence platform for MUN (Model United Nations) delegates.

### Artifacts
- `artifacts/sercovir` — React + Vite frontend (previewPath: `/`)
- `artifacts/api-server` — Express 5 API server (previewPath: `/api`)

### Features
- **Command Center Dashboard** — global threat level, active conflicts, metrics, intelligence briefings feed
- **Country Intelligence Profiles** — full country data with threat levels, stability index, alliances
- **Conflict Tracker** — active/escalating/frozen/resolved conflicts with severity indicators
- **Committee Management** — MUN committees with delegates and linked resolutions
- **Resolution Workspace** — draft, edit and track resolutions with clauses and vote counts
- **Alliance & Bloc Map** — geopolitical alliances with member countries and strength
- **Delegate Roster** — delegates by committee, country, bloc
- **Intelligence Feed** — live briefings with priority/category coding

### DB Schema (lib/db/src/schema/)
- `countries` — country intelligence profiles
- `conflicts` — active geopolitical conflicts
- `committees` — MUN committees
- `resolutions` — resolution drafts
- `alliances` — geopolitical alliances and blocs
- `intelligence_briefings` — intelligence briefings feed
- `delegates` — MUN delegates

### API Routes (artifacts/api-server/src/routes/)
- `/api/dashboard` — global dashboard overview
- `/api/countries` + `/api/countries/summary`
- `/api/conflicts` + `/api/conflicts/summary`
- `/api/committees`
- `/api/resolutions`
- `/api/alliances`
- `/api/intelligence/feed` + `/api/intelligence/briefings/:id`
- `/api/delegates`
