# Print sheets (Phase 3)

## Choice: Letter landscape **8-up** (not 3×3)

UMPS+1 locks **8-up** as the sheet authority for this slice.

| Option | Layout | Why |
|--------|--------|-----|
| **8-up (chosen)** | 4×2 on US Letter **landscape** | Matches legacy KEEP proxy math: full-size 2.5″×3.5″ trim cards, one duplexable front/back pair per page. |
| 3×3 | 3×3 on Letter portrait | Fits nine faces but scales cards below physical size (or needs tighter margins). Slightly simpler grid; not worth abandoning KEEP 8-up. |

## Geometry

| Constant | Value |
|----------|-------|
| Page | US Letter landscape 11″ × 8.5″ |
| Sheet DPI | **300** (lighter compose than the 600 DPI card stage; pHYs tagged to 300) |
| Canvas | 3300 × 2550 px |
| Card slot | 750 × 1050 px (2.5″ × 3.5″) |
| Grid | 4 columns × 2 rows = **8** |
| Marks | Corner cut ticks in gutters |
| Backs | Optional `/assets/print/card-back.png`; columns mirrored per row for duplex |

Source faces in the print queue are **trim, opaque, 600 DPI** PNGs; the sheet scaler draws them into the 750×1050 slots.

## Out of scope here

Mixed official-image sources, decklist batching, and PDF multi-page bundling wait for later phases. This slice downloads one PNG per front (and optional back) page.
