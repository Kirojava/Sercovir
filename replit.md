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
- **Command Center Dashboard** — global threat level, active conflicts, metrics, intelligence briefings, live news ticker & live press feed panels
- **Live World News** — real-time RSS aggregation from Reuters, BBC, CNN, Al Jazeera, The Guardian, Sky News, FT, WSJ, ABC, NBC, NPR, DW, France24 — auto-refreshes every 90s with source filtering, search, and live ticker
- **Political Press & Analysis** — live feeds from Foreign Affairs, POLITICO, Reuters Politics, BBC Politics, Sky News Politics, The Guardian, DW, France24 — auto-refreshes every 120s
- **Country Intelligence Profiles** — full country data with threat levels, stability index, alliances
- **Conflict Tracker** — active/escalating/frozen/resolved conflicts with severity indicators
- **Committee Management** — MUN committees with delegates and linked resolutions
- **Resolution Workspace** — draft, edit and track resolutions with clauses and vote counts
- **Alliance & Bloc Map** — geopolitical alliances with member countries and strength
- **Delegate Roster** — delegates by committee, country, bloc
- **Intelligence Feed** — live briefings with priority/category coding
- **World Leaders** — profiles with statements
- **Interpol Notices** — active red/blue/green notice tracking
- **ICJ Cases** — International Court of Justice case tracking
- **Treaties** — international treaty database

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
- `/api/live-feed` — real-time RSS news aggregation (Reuters, BBC, CNN, AJ, Guardian, Sky, FT, WSJ, ABC, NBC, NPR, DW, France24), 5-min cache
- `/api/live-feed/sources` — list of available news sources
- `/api/press-releases` — live political press & analysis feeds (Foreign Affairs, POLITICO, Reuters Politics, BBC Politics, etc.), 5-min cache
- `/api/countries` + `/api/countries/summary`
- `/api/conflicts` + `/api/conflicts/summary`
- `/api/committees`
- `/api/resolutions`
- `/api/alliances`
- `/api/intelligence/feed` + `/api/intelligence/briefings/:id`
- `/api/delegates`
- `/api/leaders`, `/api/statements`
- `/api/interpol`, `/api/icj`, `/api/treaties`
- `/api/parliamentary`, `/api/legislation`, `/api/criminal-cases`
- `/api/media-events`, `/api/country-intel`
- `/api/economics/data` — Economic intelligence: GDP history (2013–2023), growth rates, inflation, unemployment, military spend, trade balance, debt/GDP for 15 major economies; OLS regression forecasts + Monte Carlo risk scores

### Economic Intelligence Module (added 2026-04)
- **Economic Analysis** (`/economics`) — GDP trajectory area chart (top 8 economies, 2013–2023), GDP ranking bar chart, GDP growth rate line chart, full indicators matrix table (15 economies: GDP, growth, inflation, unemployment, military spending, debt, trade balance, growth trend)
- **Trade & Sanctions** (`/trade`) — Current account balance diverging bar chart, bilateral trade flows, commodity markets table, active sanctions regimes tracker with intensity scoring
- **Geopolitical Forecasting** (`/forecasting`) — Regional risk gauges (4 highest-risk regions), multi-dimensional radar chart (conflict/economic/military), US GDP growth OLS regression with 95% CI bands, GDP trajectory forecast 2018–2027 for top 4 economies, Monte Carlo risk scores (N=2,000), Predictive Event Probability Matrix (10 events with mathematical basis and probability %)
