# UMPS+1 curated asset port — MANIFEST

Generated: 2026-10-07T16:44:17-05:00
Total copied: 79M (320 files)
Budget target: ≤80–100MB (actual under cap).

## Destination layout

\`apps/web/public/assets/{borders,frames,mana,fonts,print,card-parts}/\`

## Copied (KEEP)

| Dest | Source | Size |
|------|--------|------|
| `borders/outer-border-solid/` | `~/Desktop/UMPS/UMPS/public/card-parts/outer-border-solid/` | 96K |
| `frames/textures/` | `~/Desktop/UMPS/UMPS/public/assets/textures/` | 20M |
| `frames/layouts/tarot/` | `~/Desktop/UMPS/UMPS/public/assets/layouts/tarot/` | 228K |
| `frames/layouts/warframe/ (wf-standard-*)` | `~/Desktop/UMPS/UMPS/public/assets/layouts/warframe/` | 15M |
| `frames/crowns/` | `~/Desktop/UMPS/UMPS/public/crown/` | 1.9M |
| `mana/alt/` | `~/Desktop/UMPS/UMPS/public/mana-alt/` | 820K |
| `mana/custom/` | `~/Desktop/UMPS/UMPS/public/mana-custom/` | 4.6M |
| `print/card-back.png` | `~/Desktop/UMPS/UMPS/public/features/print/card-back.png` | 5.6M |
| `fonts/ (essential card set)` | `~/Desktop/UMPS/UMPS/public/fonts/{beleren,matrix,mplantin,Plantin*,phy*,Magic*,DIN-Next*}` | 1.2M |
| `card-parts/planeswalker-symbols/` | `~/Desktop/UMPS/UMPS/public/planeswalker-symbols/ + New Assets/Planeswalker Symbols/` | 496K |
| `card-parts/outer-border-solid/` | `~/Desktop/UMPS/UMPS/New Assets/Outer Border Solid Colors/` | 96K |
| `card-parts/pt-box/` | `~/Desktop/UMPS/UMPS/New Assets/PT Box by color/` | 308K |
| `card-parts/holo-stamps/` | `~/Desktop/UMPS/UMPS/New Assets/holo stamps/` | 84K |
| `card-parts/rarity/` | `~/Desktop/UMPS/UMPS/New Assets/rarity indicator/` | 84K |
| `card-parts/typal/` | `~/Desktop/UMPS/UMPS/New Assets/Typal/ + public/watermarks/` | 320K |
| `card-parts/text-box-art/` | `~/Desktop/UMPS/UMPS/New Assets/Text box art/` | 2.0M |
| `card-parts/mana-and-symbols/` | `~/Desktop/UMPS/UMPS/New Assets/Mana and Symbols/` | 120K |
| `card-parts/expansion-symbol/` | `~/Desktop/UMPS/UMPS/New Assets/Expansion Symbol/` | 584K |
| `card-parts/inner-border/ (9 mono PNGs)` | `~/Desktop/UMPS/UMPS/New Assets/Inner Border/{white,blue,black,red,green,gold,artifact,land}.png (+ white night)` | 27M |

## Deferred (not copied — size / junk / dumps)

| Path | Approx size | Reason |
|------|-------------|--------|
| `public/card-parts/outer-border-texture/` | 405M | Exceeds budget; textured border dump |
| `public/assets/layouts/warframe/` (full set) | 43M | Kept only wf-standard-creature/spell |
| `public/armor/` | 35M | Non-essential armor overlays |
| `public/land-panels/`, `public/spell-panels/` | ~15M | Defer until layout wiring |
| `public/premodern-rules-textbox/` | 11M | Defer |
| `New Assets/Inner Border/{Dual,Land,Poster,Abstract,Modern,Space}/` | ~150M | Unorganized texture dumps |
| `New Assets/_old-chatgpt-exports/` | 68M | Export junk |
| `New Assets/Tarot_Layout_Assets.zip` | 13M | Zip archive; tarot already in public |
| `New Assets/Crown/_batches/` | 1.9M | Intermediate batch junk |
| Large fonts (NudMotoya*, 2012c*, Gill Sans*, etc.) | ~10M+ | Non-essential for M15 core |
| `.local-history/`, `dist/`, `node_modules/` | multi-GB | Explicitly excluded |

## Exclusions enforced

- Never copied: `.local-history`, `dist`, `node_modules`

## Theme

- Googled tokens applied in `apps/web/src/styles/global.css`
- Shell sets `data-app-theme="googled"` in `EditorShell.tsx`
- Cloud extract: store `internal/umps-googled-theme.css` + `.md`

## Fonts included

- beleren-bsc.ttf
- beleren-b.ttf
- DIN-Next-Bold.otf
- DIN-Next-Medium.otf
- DIN-Next-Regular.otf
- Magic-Fomalhaut.woff2
- Matrix Bold Small Caps.ttf
- Matrix Bold.ttf
- matrix-b.ttf
- matrix.ttf
- mplantin-i.ttf
- mplantin.ttf
- phyrexian.ttf
- phy.ttf
- phy.woff2
- PlantinMTProBold.woff2
- PlantinMTProRgIt.woff2
- PlantinMTProRg.woff2
- PlantinMTProSemiBdIt.woff2
- Plantin-SemiboldItalic.otf
- plantin-semibold.otf
