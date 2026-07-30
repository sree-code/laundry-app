# Weekend Cricket v2

Admin + player portal for weekend cricket groups (50+ members).

## Admin Login Credentials

| Field | Value |
|-------|-------|
| **Username** | `cricketadmin` |
| **Password** | `WkndCricket@Admin2026` |

> Change these in production via environment variables `ADMIN_USERNAME` and `ADMIN_PASSWORD`.

---

## Features

### Admin (you)
- Login with admin credentials above
- **Schedule matches** — Saturday, Sunday & holidays only
- **Assign ground blocker** — see who booked the ground
- **Generate teams** — auto-balance two teams by skill
- **Manage holidays** — add public holidays for weekday matches
- **View all players** — everyone who registered

### Players (your group)
- Register at `/register` with their own username & password
- Login and update profile (name, role, skill)
- Mark availability for scheduled matches
- View generated teams

---

## Quick Start (Local)

```bash
npm install
npm run dev
```

- App: http://localhost:3000
- API: http://localhost:3001/api

Login as admin with credentials above.

---

## Deploy to Vercel (Get Public URL)

### Step 1 — Turso Database (free)

```bash
# Install: https://docs.turso.tech/cli/installation
turso auth login
turso db create weekend-cricket
turso db show weekend-cricket --url
turso db tokens create weekend-cricket
```

### Step 2 — Push to GitHub

```bash
git init
git add .
git commit -m "Weekend Cricket"
gh repo create weekend-cricket --public --source=. --push
```

### Step 3 — Deploy on Vercel

1. Go to https://vercel.com/new
2. Import your repo
3. Add environment variables:

| Variable | Value |
|----------|-------|
| `TURSO_DATABASE_URL` | Your Turso URL |
| `TURSO_AUTH_TOKEN` | Your Turso token |
| `JWT_SECRET` | Any long random string |
| `ADMIN_USERNAME` | `cricketadmin` |
| `ADMIN_PASSWORD` | `WkndCricket@Admin2026` |

4. Click **Deploy**

Your final URL: `https://your-app-name.vercel.app`

Share this URL with your 50 players on WhatsApp.

---

## Project Structure

```
api/          → Vercel serverless API
server/       → Express backend + auth + database
src/          → React frontend (dark modern UI)
vercel.json   → Deployment config
```

## Tech Stack

- React + Vite (frontend)
- Express + JWT auth (backend)
- libSQL / Turso (database)
- Vercel (hosting)
