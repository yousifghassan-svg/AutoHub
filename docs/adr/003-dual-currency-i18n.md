# ADR 003: Dual Currency & i18n

## Status

Accepted (revised)

## Context

Iraq market prices commonly in IQD and USD; the product must also support future countries and additional currencies. UI must be Arabic-primary with Kurdish and English.

## Decision

1. **Currency table** — store currencies (`code`, localized names, `symbol`, `decimalPlaces`) instead of hard-coding IQD/USD columns forever.
2. **Listing dual price** — `primaryPrice` + `primaryCurrencyId` and optional `secondaryPrice` + `secondaryCurrencyId`, plus optional `fxRateSnapshot`.
3. **Country default** — `Country.defaultCurrencyId` points at the preferred currency for that market (Iraq → IQD in seed).
4. **i18n** — locales `ar` (default, RTL), `ku` (RTL), `en` (LTR) via listing translation rows (`ListingTranslation`).

## Consequences

- Clients display prices using the referenced currency rows; dual-price UI remains supported.
- Adding a new country/currency is a data change, not a schema rewrite of price columns.
- Product i18n packages may arrive in a later sprint; translation rows are ready now.
