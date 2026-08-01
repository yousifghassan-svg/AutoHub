# AutoHub UI Standard

**Status:** Normative  
**Apps:** `apps/web`, `apps/admin`, `apps/mobile`  
**Packages:** `@autohub/ui`, `@autohub/mobile-ui`  
**Related:** [`mobile-design-system.md`](./mobile-design-system.md), [`CODING_STANDARD.md`](./CODING_STANDARD.md)

---

## 1. Goals

- Consistent marketplace UX across web and mobile  
- Arabic-primary, RTL-capable interfaces  
- Reuse design-system components — **never duplicate primitives**  
- Keep sell/create flows visually stable while architecture evolves

---

## 2. Platform split (intentional)

| Surface | UI package | Notes |
| --- | --- | --- |
| Web / Admin | `@autohub/ui` + app-local `components/ui` | Next.js + Tailwind |
| Mobile | `@autohub/mobile-ui` | Expo/RN tokens + components |

Do **not** import `@autohub/ui` into React Native or `@autohub/mobile-ui` into Next.js.

---

## 3. Web & Admin

### Layout & styling

- Use existing Tailwind tokens / utility classes already in the apps (`brand`, `ink`, `surface`, `border`, etc.).  
- Prefer composition of existing `Button`, `Input`, `Select`, `TextArea`, `Skeleton` primitives.  
- Page chrome: reuse `SiteHeader` / `SiteFooter` (web) and admin layout shell — do not fork navigation.  
- Cards: follow existing listing/admin patterns; do not invent a second card system.

### Data UI

- Loading → existing skeletons  
- Empty → existing empty copy patterns on list pages  
- Errors → inline `text-error` / established toasts patterns — match neighbors  

### Marketplace specifics

- Prices: `formatMoney` / currency helpers from `@autohub/utils` or app currency feature — always show currency code/symbol.  
- Plates: use `LicensePlate` / `PlateEditor` from `features/plates` — do not redraw plate SVGs ad hoc.  
- Vehicles vs plates IA: keep separate search/detail routes (`/vehicles`, `/plates`).

### Sell wizard (web)

- Host chrome lives in `features/sell` (progress, next/back, publish actions).  
- Domain plugins supply domain steps + Preview.  
- Shared steps: Category, Media, Sale Information, Publish (preview included).  
- Labels: **Vehicle Details**, **Plate Details**, **Sale Information** — do not rename casually.

---

## 4. Mobile design system

Normative details live in [`mobile-design-system.md`](./mobile-design-system.md). Summary rules:

1. **No network / storage / domain imports** inside `@autohub/mobile-ui`.  
2. Prefer theme tokens (`useTheme`) over hard-coded colors/spacing.  
3. Locales `ar` | `ku` | `en` drive RTL (`isRTL`).  
4. Fonts: Outfit (Latin), IBM Plex Sans Arabic (Arabic/Kurdish).  
5. Overlays use RN `Modal` patterns already in DS (`Dialog`, `BottomSheet`).  
6. `Screen` respects content max width / gutters for tablet.

App features compose DS components; business logic stays in feature folders.

---

## 5. Content & i18n UI rules

- Arabic-primary product copy when adding user-facing strings.  
- Listing translations exist in DB (`ListingTranslation`); client i18n packages may still be partial — do not assume a full i18n framework everywhere.  
- RTL: mirrored chrome (back affordances, progress, tab bars) must remain usable.

---

## 6. Media UX

- Image/video uploaders already exist (`MediaUploader` on web; mobile media steps in create feature).  
- Extend those components; do not add a third uploader.  
- Primary image selection behavior must remain obvious before publish when required by the flow.

---

## 7. Admin UI

- Stay inside `(admin)` layout patterns.  
- Tables/forms for vehicles/plates should keep currency visible and filterable (financial foundation).  
- Destructive actions (suspend, remove, reject) require the same confirmation patterns already used nearby.

---

## 8. Accessibility & UX minimums

- Interactive elements must be buttons/links with clear labels (not clickable `div`s for primary actions).  
- Forms mark required fields consistently with existing components.  
- Don’t block the main thread with huge synchronous image work — use existing compression/upload pipelines on mobile.

---

## 9. Inconsistencies → standard

| Finding | Standard |
| --- | --- |
| Web has app-local `components/ui` and `@autohub/ui` | Prefer existing local primitive if that’s what the screen already uses; promote to package only when reused across apps |
| Mobile legacy sell UI vs create feature UI | New screens use create feature + DS components |
| Preview was a separate web step; now inside Publish | Keep preview inside Publish; don’t reintroduce a parallel Preview route |
| Dark mode tokens exist on mobile theme | Don’t force dark marketing aesthetics on web marketplace without a product decision |

---

## 10. Checklist

- [ ] Reused existing components  
- [ ] No new design system  
- [ ] Currency displayed correctly  
- [ ] RTL considered for new chrome  
- [ ] Loading/empty/error states present  
