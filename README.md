# Numi's Idle

A minimal browser idle game starter built with plain HTML, CSS, and JavaScript.

## Features

- Manual gather button (+1 coin)
- Passive income from upgrades
- Cost scaling for upgrades
- Auto-save and load via localStorage
- Simple offline progression (capped)

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

## Next ideas

- Add more upgrade tiers
- Add achievements and milestones
- Add prestige/rebirth loop
- Replace in-memory balancing constants with JSON config
