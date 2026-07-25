# Weekend Cricket

A simple web app to manage your weekend cricket group — add members, mark who's playing each weekend, and auto-generate two balanced teams.

Built for groups of **50+ players** with a lightweight SQLite backend.

## Features

- **Members** — Add everyone with name, phone, role (batsman/bowler/all-rounder/wicket-keeper), and skill level (1–5)
- **This Weekend** — Each player taps to mark availability for the upcoming Saturday
- **Teams** — One-click generation of two skill-balanced teams with full player details

## Quick Start

```bash
npm install
npm run dev
```

Open **http://localhost:3000** in your browser. Share the link with your group on match day.

## Production

```bash
npm run build
npm start
```

The server runs on port **3001** by default (serves the built frontend + API). Set `PORT` to change it.

## How team balancing works

1. Wicket keepers are distributed evenly across teams
2. Remaining players are assigned using a snake draft sorted by skill
3. Team sizes are kept as equal as possible

## Tech Stack

- React + Vite (frontend)
- Express + SQLite (backend)
- No login required — everyone in your group can add and update details

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/members` | List all members |
| POST | `/api/members` | Add a member |
| PATCH | `/api/members/:id` | Update a member |
| DELETE | `/api/members/:id` | Remove a member |
| POST | `/api/weekends` | Create/get weekend session |
| POST | `/api/weekends/:id/availability` | Toggle player availability |
| POST | `/api/weekends/:id/generate-teams` | Generate balanced teams |
| GET | `/api/weekends/:id/teams` | View generated teams |
