# Iraqi Plate Formats

## Strategy

Plate formats are stored in `PlateFormat` and validated by `PlateFormatRegistry` in the API. Admins can adjust masks/regex without redeploying.

## v1: Erbil (`IQ_ERBIL`)

- Strictness: `STRICT`
- Example: `A 12345`
- Regex (initial): `^[A-Zء-ي]{1,3}[\s-]?\d{4,6}$`
- Normalized form: uppercase, spaces collapsed

## Other formats

`IQ_BAGHDAD`, `IQ_BASRA`, `IQ_MOSUL`, `IQ_GENERIC` ship with `SOFT` validation so sellers can list while formats are refined.

## Storage

`PlateDetails` stores `plateDisplay`, `plateNormalized`, `formatCode`, and optional structured fields (`series`, `number`, `regionCode`).
