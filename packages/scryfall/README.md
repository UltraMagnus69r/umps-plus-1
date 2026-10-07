# @umps-plus-1/scryfall

Typed Scryfall HTTP adapter for UMPS+1.

- Fuzzy / exact name (`/cards/named`)
- Set + collector number
- Scryfall page / API URL resolve
- Print search (`unique=prints`) via `prints_search_uri` or query
- In-memory request gate (~110 ms) so we do not hammer the API
- User-Agent `UMPS-Plus-1/0.1` (honored outside the browser)

Online-only — no local card database. Consumed by `apps/web` through a Vite alias.
