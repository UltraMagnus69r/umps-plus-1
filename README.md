# UMPS+1

Greenfield, ground-up rebuild of UMPS. This repository holds the directory skeleton only — no application implementation, packages, or assets yet.

Legacy UMPS is archive-only and is not carried forward into this tree.

## Folder map

```
apps/
  web/                 Vite/React web app (future)
    public/assets/     frames, borders, mana, fonts, print, card-parts
    public/icons/
    src/app/
    src/domain/        card, layout, geometry, export
    src/features/      editor, scryfall, print, custom-card, offline
    src/shared/        ui, lib
    src/renderer/
    src/store/
    src/styles/
  desktop/             Tauri shell (future)
  mobile/              Capacitor shell (future)
packages/
  geometry/
  scryfall/
  export/
assets-incoming/       Staging for artwork before public/assets
docs/
  architecture/
  layouts/
scripts/
.github/workflows/
```

No implementation yet.
