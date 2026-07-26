-- Sprint 24: Financial foundation — Currency catalog + listing price backfill

ALTER TABLE "Currency" ADD COLUMN IF NOT EXISTS "isDefault" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Currency" ADD COLUMN IF NOT EXISTS "sortOrder" INTEGER NOT NULL DEFAULT 0;

-- Ensure Phase-1 currencies exist (idempotent)
INSERT INTO "Currency" ("id", "code", "nameEn", "nameAr", "nameKu", "symbol", "decimalPlaces", "active", "isDefault", "sortOrder", "createdAt", "updatedAt")
VALUES
  ('curr_iqd', 'IQD', 'Iraqi Dinar', 'الدينار العراقي', 'دیناری عێراقی', 'د.ع', 0, true, true, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('curr_usd', 'USD', 'US Dollar', 'الدولار الأمريكي', 'دۆلاری ئەمریکی', '$', 2, true, false, 20, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("code") DO UPDATE SET
  "nameEn" = EXCLUDED."nameEn",
  "nameAr" = EXCLUDED."nameAr",
  "nameKu" = EXCLUDED."nameKu",
  "symbol" = EXCLUDED."symbol",
  "decimalPlaces" = EXCLUDED."decimalPlaces",
  "active" = true,
  "isDefault" = EXCLUDED."isDefault",
  "sortOrder" = EXCLUDED."sortOrder",
  "updatedAt" = CURRENT_TIMESTAMP;

-- Exactly one default currency (IQD)
UPDATE "Currency" SET "isDefault" = false WHERE "code" <> 'IQD';
UPDATE "Currency" SET "isDefault" = true, "sortOrder" = 10, "active" = true WHERE "code" = 'IQD';
UPDATE "Currency" SET "sortOrder" = 20, "active" = true, "isDefault" = false WHERE "code" = 'USD';

-- Backfill listings missing primary currency → IQD (no price invention)
UPDATE "Listing" AS l
SET "primaryCurrencyId" = c."id",
    "updatedAt" = CURRENT_TIMESTAMP
FROM "Currency" AS c
WHERE c."code" = 'IQD'
  AND l."primaryCurrencyId" IS NULL
  AND l."deletedAt" IS NULL;
