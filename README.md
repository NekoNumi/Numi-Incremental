# Numi's Idle

A minimal browser idle game starter built with plain HTML, CSS, and JavaScript.

## Features

- Manual gather button (+1 coin)
- Passive income from upgrades
- Cost scaling for upgrades
- Auto-save and load via localStorage
- Simple offline progression (capped)
- Versioned dev log modal that appears on first launch of a new release
- PWA update check with one-time focus/open detection and reload prompt

## Dev logs

- Add one JSON file per release in `devlogs/` (example: `devlogs/0.3.0.json`).
- Register the new file in `devlogs.ts` so it appears in the in-game dev log accordion.

## Setup (Windows)

1. Install Node.js LTS from https://nodejs.org/
2. In this project folder, run:

```powershell
npm install
```

## Run

Start the local dev server with hot reload:

```powershell
npm run dev
```

Vite will print a local URL (usually http://localhost:5173).

## Optional build commands

```powershell
npm run build
npm run preview
```

## Deploy to GitHub Pages

This repo is configured to auto-deploy on pushes to `main` using GitHub Actions.

1. Push this project to a GitHub repository.
2. In GitHub, open **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to **GitHub Actions**.
4. Push to `main` (or run the **Deploy to GitHub Pages** workflow manually from **Actions**).

After deployment completes, your game will be available at:

- `https://<your-username>.github.io/<your-repo-name>/`

## Install on phone (PWA)

After the site is deployed, you can install it like an app.

- iPhone (Safari): Open your game URL → Share → Add to Home Screen.
- Android (Chrome): Open your game URL → menu (⋮) → Install app (or Add to Home screen).

The app uses standalone display mode, so it opens without normal browser navigation bars.

## Next ideas

- Add more upgrade tiers
- Add achievements and milestones
- Add prestige/rebirth loop
- Replace in-memory balancing constants with JSON config
