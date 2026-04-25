# Community Marketplace

A standalone marketplace web app that runs locally in your browser (no Facebook dependency).

## Features

- Create, browse, and delete listings
- Search, category filtering, and price/date sorting
- Contact seller dialog (stubbed message flow)
- Demo listing seeding
- Local persistence with `localStorage`

## Run locally

Since this is a static app, you can run it with any simple web server.

### Option 1: Python

```bash
python3 -m http.server 4173
```

Then open: `http://localhost:4173`

### Option 2: Open directly

Open `index.html` in your browser.

## Files

- `index.html` - UI structure
- `styles.css` - App styling
- `app.js` - Marketplace behavior and state
