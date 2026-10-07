# UMPS+1

Greenfield custom card editor. Print-ready Magic proxies from Scryfall + custom cards.

Phase 1: Vite/React web app with a card-first responsive shell, 600 DPI stage math, and flattened PNG export (pHYs tagged).

Phase 2: Scryfall import (online) + IndexedDB vault helpers (no auto-restore on refresh).

Phase 3: Bleed/trim export, transparent layer packs, Letter 8-up print sheets, in-app print queue.

Legacy UMPS is archive-only and is not part of this tree.

## Run the web app

```bash
cd apps/web
npm install
npm run dev
```

Open the URL Vite prints (default `http://localhost:43129`).

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

## Export & print (Phase 3)

Open **Export** in the top mode chips. Sub-tabs:

### File

1. Pick **Bleed** (1650×2250) or **Trim** (1500×2100).
2. **Export PNG** — default print-ready flatten with pHYs @ 600 DPI (opaque).
3. **Transparent PNG** — same size, no opaque bleed backplate.
4. **Layer pack (ZIP)** — lossless `art.png` / `frame.png` / `text.png` (transparent; matches the renderer stack).

### Print

1. **Add current card** — queues a trim, opaque print-ready face.
2. Reorder with Up/Down or Remove.
3. Optionally enable **Include card-back sheet** when `public/assets/print/card-back.png` is present.
4. **Generate sheet(s)** — Letter landscape **8-up** @ 300 DPI with cut marks (see [`docs/architecture/print-sheets.md`](docs/architecture/print-sheets.md)).

## Scryfall (Phase 2)

Scryfall lookup is **online-only**. The typed client lives in [`packages/scryfall`](packages/scryfall) and is used from the **Scryfall** mode chip in the editor.

- Fuzzy name, optional set code, `SET 123` collector shortcut, or paste a Scryfall card URL
- Loads printings (`unique=prints`) so you can pick a print, then **Apply to card** (name, mana, type, oracle, P/T, `art_crop` art)
- Requests are lightly rate-gated (~110 ms); UA identifies as `UMPS-Plus-1/0.1` when the runtime allows it
- Needs a network path to `api.scryfall.com` / `cards.scryfall.io` — there is no offline card database in this slice

A browser refresh starts from a blank card: the vault is cleared on load and does not auto-hydrate. Explicit “save last card” can come later. Scryfall search itself still requires the network.

## Phase scope

**Phase 1**

- Custom card fields: name, mana, type line, rules, P/T
- Art upload + basic placement (scale / pan)
- Live canvas stage preview @ KEEP geometry: **600 DPI**, full bleed **1650×2250**, bleed **75px**/side, trim **1500×2100**
- PNG export with **pHYs 600 DPI** (flattened)
- Responsive editor shell — see [`docs/architecture/editor-shell.md`](docs/architecture/editor-shell.md)

**Phase 2**

- Scryfall client + UI apply flow
- Vault helpers (IndexedDB); refresh wipes — no auto-restore

**Phase 3 (this)**

- Bleed vs trim export modes
- Transparent flatten + layer-pack ZIP
- Print queue + Letter 8-up sheets with cut marks / optional backs

Not yet: official-image mixed queue sources, bulk Scryfall DB, Tauri/Capacitor, multi-user, Warframe.

## Folder map

```
apps/
  web/                 Vite + React + TypeScript app
    public/assets/     frames, borders, mana, fonts, print, card-parts
    src/app/           app entry shell
    src/domain/        card, layout, geometry, export
    src/features/      editor, scryfall, …
    src/renderer/      canvas stage
    src/store/         zustand slices (card + print queue)
    src/styles/
  desktop/             Tauri shell (future)
  mobile/              Capacitor shell (future)
packages/
  geometry/            shared math (future; constants still in apps/web)
  scryfall/            typed Scryfall HTTP adapter
  export/              future shared export (logic in apps/web for now)
assets-incoming/       curated ports from legacy
docs/
  architecture/        editor-shell, print-sheets, …
  layouts/
scripts/
.github/workflows/
```
