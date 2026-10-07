# @umps-plus-1/export

Shared export package (future extract).

Phase 3 export logic still lives in the web app:

- `apps/web/src/domain/export/png.ts` — PNG + pHYs
- `apps/web/src/domain/export/zip.ts` — STORE zip (layer packs)
- `apps/web/src/domain/export/render.ts` — bleed/trim flatten + layers
- `apps/web/src/domain/export/sheets.ts` — Letter 8-up compose

Promote here when a second app needs the same pipeline.
