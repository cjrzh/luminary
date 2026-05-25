# Repository Guidelines

## Project Structure & Module Organization

Luminary is a self-hosted entertainment tracker. The repository is currently in its initial scaffold state: `README.md` documents the intended stack, `.env.example` is the configuration template, and `start.*` / `stop.*` scripts are placeholders for local orchestration. As the implementation lands, keep the layout predictable:

- `app/` or `src/`: Next.js 15 TypeScript frontend code.
- `components/`: shared React and shadcn/ui components.
- `prisma/`: SQLite schema, migrations, and seed data.
- `services/scraper/`: Python FastAPI metadata scraper.
- `tests/` or colocated `*.test.ts(x)` / `test_*.py`: automated tests.
- `docs/`: setup, architecture, and operational notes.

Keep media assets and UI fixtures close to the feature that uses them unless they are shared globally.

## Build, Test, and Development Commands

Use the root scripts as the stable entry points once they are implemented:

- `./start.sh` or `start.bat`: start the local app stack.
- `./stop.sh` or `stop.bat`: stop local services.
- `cp .env.example .env`: create local configuration before running services.

When package manifests are added, prefer standard commands such as `npm run dev`, `npm run build`, `npm test`, and scraper commands like `pytest` from the service directory. Update this file when those commands become available.

## Coding Style & Naming Conventions

Use TypeScript for the frontend and Python for the scraper. Prefer 2-space indentation in TypeScript, 4-space indentation in Python, PascalCase for React components, camelCase for variables/functions, and snake_case for Python modules/functions. Keep shadcn/ui components consistent with Tailwind utility patterns. Add formatters and linters through project scripts rather than one-off commands.

## Testing Guidelines

Add tests with each behavioral change. Use `*.test.ts` or `*.test.tsx` for frontend units and `test_*.py` for Python scraper tests. Cover metadata parsing, status transitions, database access, and integration boundaries. Keep fixture data small and deterministic.

## Commit & Pull Request Guidelines

The existing history uses Conventional Commit style, for example `chore: initial project structure`. Continue with short imperative subjects such as `feat: add media library schema` or `fix: handle missing TMDB matches`.

Pull requests should include a concise summary, linked issue when applicable, test results, configuration or migration notes, and screenshots for UI changes. Call out any new environment variables or external API requirements.

## Security & Configuration Tips

Never commit `.env` or API keys. Document required keys in `.env.example` and keep self-hosted defaults safe for local development.
