# Editor shell IA (Phase 1)

## Chosen layout

**Single-stage focus** with the card preview as the hero. Chrome is a slim top bar: **UMPS+1** brand + compact **Edit / Art / Export** segmented control. Editing controls live in one inspector that changes with the mode — never a permanent left/right sidebar pair and never a bottom tool strip competing with the stage.

## Breakpoints

| Viewport | Behavior |
|----------|----------|
| **&lt; 960px** (phone / small tablet) | Stage fills the viewport under the top bar. Inspector is a **bottom sheet** (peek/open via Controls or by picking a mode). Scrim dismisses it. Full task parity — same fields as desktop. |
| **≥ 960px** | Stage remains the visual center; a **slim right inspector** stays docked. No left rail. |

## Modes

- **Edit** — name, mana, type line, rules, P/T, face color
- **Art** — upload, scale, pan, clear
- **Export** — flattened PNG @ 600 DPI (pHYs), geometry notes, reset

## Why not legacy

Legacy `SidebarLeft | Konva | SidebarRight | BottomBar` densifies chrome and fails mobile parity. This shell keeps hierarchy: brand → mode → card → fields on demand.
