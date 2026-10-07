# UMPS+1

Greenfield ground-up custom card editor. Phase 1: Vite/React web app with a card-first responsive shell, 600 DPI stage math, and flattened PNG export (pHYs tagged).

Legacy UMPS is archive-only and is not part of this tree.

## Run the web app

```bash
cd apps/web
npm install
npm run dev
```

Open the URL Vite prints (default `http://localhost:5173`).

```bash
npm run build    # production build → apps/web/dist
npm run preview  # serve the build locally
```

Requires Node 20+ (Node 22/24 fine) with `npm` on your PATH.

If `npm: command not found`, install Node via [nvm](https://github.com/nvm-sh/nvm) (user-space; no sudo):

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
# open a new terminal, or: source ~/.bashrc
nvm install 22
```

Then `node -v` / `npm -v` should work. On Fedora you can also use `sudo dnf install nodejs npm` if you prefer system packages.

## Phase 1 scope

- Custom card fields: name, mana, type line, rules, P/T
- Art upload + basic placement (scale / pan)
- Live canvas stage preview @ KEEP geometry: **600 DPI**, full bleed **1650×2250**, bleed **75px**/side, trim **1500×2100**
- PNG export with **pHYs 600 DPI** (flattened)
- Responsive editor shell — see [`docs/architecture/editor-shell.md`](docs/architecture/editor-shell.md)

Not in Phase 1: Scryfall, asset library copy, print sheets, Tauri/Capacitor, multi-user, layered export, Warframe.

## Folder map

```
apps/
  web/                 Vite + React + TypeScript app
    public/assets/     frames, borders, mana, fonts, print, card-parts (future)
    src/app/           app entry shell
    src/domain/        card, layout, geometry, export
    src/features/      editor (+ future scryfall, print, …)
    src/renderer/      canvas stage
    src/store/         tiny zustand slice
    src/styles/
  desktop/             Tauri shell (future)
  mobile/              Capacitor shell (future)
packages/
  geometry/            shared math (future; Phase 1 in apps/web)
  scryfall/            future
  export/              future
assets-incoming/       curated ports from legacy (empty for now)
docs/
  architecture/        editor-shell IA, etc.
  layouts/
scripts/
.github/workflows/
```
