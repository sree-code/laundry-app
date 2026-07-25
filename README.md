# Weekend Cricket

A simple web app to manage your weekend cricket group — add members, mark who's playing each weekend, and auto-generate two balanced teams.

Supports **50+ members**. Includes a **React frontend** and **Express API backend** in one repo, ready to deploy on **Vercel**.

## Project structure

```
weekend-cricket/
├── api/              # Vercel serverless API entry point
├── server/           # Express backend (routes, database, team logic)
│   ├── app.js        # API routes
│   ├── db.js         # Database layer (libSQL / Turso)
│   ├── index.js      # Local dev server
│   └── teamGenerator.js
├── src/              # React frontend (Vite)
├── vercel.json       # Vercel deployment config
└── package.json
```

## Features

- **Members** — Add everyone with name, phone, role, and skill level (1–5)
- **This Weekend** — Each player taps to mark availability for the upcoming Saturday
- **Teams** — One-click generation of two skill-balanced teams with full player details

## Quick Start (local)

```bash
npm install
npm run dev
```

- Frontend: http://localhost:3000
- API: http://localhost:3001/api

Local dev uses a SQLite file at `data/cricket.db` (no external database needed).

## Deploy to Vercel

### 1. Create a free Turso database

Vercel serverless functions need a cloud database (local files don't persist).

1. Sign up at [turso.tech](https://turso.tech)
2. Create a database: `turso db create weekend-cricket`
3. Get credentials:
   ```bash
   turso db show weekend-cricket --url
   turso db tokens create weekend-cricket
   ```

### 2. Deploy

**Option A — Vercel CLI**

```bash
npm i -g vercel
vercel
```

**Option B — GitHub + Vercel Dashboard**

1. Push this repo to GitHub
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import the repo
4. Add environment variables:
   - `TURSO_DATABASE_URL` — your Turso database URL
   - `TURSO_AUTH_TOKEN` — your Turso auth token
5. Deploy

### 3. Share with your group

Send the Vercel URL to your cricket group. Everyone can add their details each weekend.

## Production (self-hosted)

```bash
npm run build
npm start
```

Runs on port **3001** by default. Set `PORT` to change it.

## Environment variables

| Variable | Required on Vercel | Description |
|----------|-------------------|-------------|
| `TURSO_DATABASE_URL` | Yes | Turso/libSQL database URL |
| `TURSO_AUTH_TOKEN` | Yes | Turso auth token |
| `PORT` | No | Local server port (default 3001) |

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/members` | List all members |
| POST | `/api/members` | Add a member |
| PATCH | `/api/members/:id` | Update a member |
| DELETE | `/api/members/:id` | Remove a member |
| POST | `/api/weekends` | Create/get weekend session |
| POST | `/api/weekends/:id/availability` | Toggle player availability |
| POST | `/api/weekends/:id/generate-teams` | Generate balanced teams |
| GET | `/api/weekends/:id/teams` | View generated teams |

## Team balancing

1. Wicket keepers are distributed evenly across teams
2. Remaining players are assigned using a snake draft sorted by skill
3. Team sizes are kept as equal as possible

## Tech stack

- **Frontend:** React + Vite
- **Backend:** Express (serverless on Vercel via `api/index.js`)
- **Database:** libSQL (local SQLite file for dev, Turso for production)
