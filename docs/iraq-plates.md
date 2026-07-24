# Iraqi Plate Formats

## Strategy

Plate formats are stored in `PlateFormat`. The web app renders original AutoHub SVG artwork (not official seals) via `<LicensePlate />`.

## Formats

| Code | Governorate | Strictness |
|------|-------------|------------|
| `IQ_ERBIL` | Erbil | STRICT |
| `IQ_BAGHDAD` | Baghdad | SOFT |
| `IQ_DUHOK` | Duhok | SOFT |
| `IQ_SULAYMANIYAH` | Sulaymaniyah | SOFT |
| `IQ_BASRA` | Basra | SOFT |
| `IQ_MOSUL` | Mosul | SOFT |
| `IQ_KIRKUK` | Kirkuk | SOFT |

## Storage

`PlateDetails` stores `plateDisplay`, `plateNormalized`, `formatCode`, optional `series` / `number` / `regionCode`, and `plateType` (`Private` · `Taxi` · `Government` · `Commercial` · `Diplomatic`).

## Web generator

- Feature: `apps/web/src/features/plates`
- Component: `<LicensePlate governorate="Erbil" code="22" letter="X" number="60000" type="Private" />`
- Final design: flat white face, thin black outer + inner borders, bold condensed black type
- Fixed layout: Code **20%** · Letter **15%** · Number **65%** (same proportions everywhere)
- No logos, badges, gradients, shadows, or metallic effects
- SVG strings are LRU-cached; PNG/PDF export is client-side
- Used in Sell Wizard preview, Listing Cards, Listing Details (plate detail), and PlateEditor
