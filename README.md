# Luminary

> Personal entertainment tracker — movies, TV, games, anime, manga & books in one place.

A self-hosted web app to manage your entire entertainment life. Track what you've watched, rate what you loved, and plan what's next — independent of any media server.

## Features

- **Unified library** — 7 media types in one place
- **Full lifecycle tracking** — from wishlist to completed, with ratings and reviews
- **Smart scraping** — auto-fetch metadata from TMDB, Bangumi, IGDB, Google Books
- **Plex integration** (optional) — see which items you have locally, without depending on it
- **Self-hosted** — your data stays on your machine

## Status

🚧 Under active development

## Tech Stack

- **Frontend**: Next.js 15 + TypeScript + Tailwind CSS + shadcn/ui
- **Database**: SQLite via Prisma ORM
- **Scraper Service**: Python FastAPI

## Getting Started

```bash
cp .env.example .env
# Edit .env with your settings
./start.sh #for unix-like systems
./start.bat #for windows
```

See [docs/setup.md](docs/setup.md) for full setup instructions.
