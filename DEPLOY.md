# Weekend Cricket — Vercel Deployment Guide

## What's in this project

| Folder | Purpose |
|--------|---------|
| `src/` | React frontend |
| `server/` | Express API backend |
| `api/` | Vercel serverless entry point |

## Deploy in 5 minutes

### Step 1: Turso database (free)

```bash
# Install Turso CLI: https://docs.turso.tech/cli/installation
turso auth login
turso db create weekend-cricket
turso db show weekend-cricket --url
turso db tokens create weekend-cricket
```

Save the **URL** and **token**.

### Step 2: Push to GitHub

```bash
git init
git add .
git commit -m "Weekend Cricket app"
git remote add origin https://github.com/YOUR_USERNAME/weekend-cricket.git
git push -u origin main
```

### Step 3: Deploy on Vercel

1. Go to https://vercel.com/new
2. Import your `weekend-cricket` repo
3. Framework preset: **Vite**
4. Add environment variables:
   - `TURSO_DATABASE_URL` = your Turso URL
   - `TURSO_AUTH_TOKEN` = your Turso token
5. Click **Deploy**

### Step 4: Share

Your app will be live at `https://your-app.vercel.app`. Share with your cricket group!

## Local development

```bash
npm install
npm run dev
```

No Turso needed locally — uses `data/cricket.db` automatically.

## Troubleshooting

| Issue | Fix |
|-------|-----|
| API returns 500 on Vercel | Check Turso env vars are set |
| Blank page after deploy | Ensure build succeeded (`npm run build` works locally) |
| Teams not saving | Turso database must be configured on Vercel |
