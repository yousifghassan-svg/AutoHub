-- CreateTable
CREATE TABLE "SavedSearch" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT,
    "query" TEXT,
    "filters" JSONB NOT NULL,
    "sort" TEXT NOT NULL DEFAULT 'NEWEST',
    "notify" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "SavedSearch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SearchEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "sessionId" TEXT,
    "keyword" TEXT,
    "categoryId" TEXT,
    "brandId" TEXT,
    "modelId" TEXT,
    "cityId" TEXT,
    "governorateId" TEXT,
    "filters" JSONB,
    "resultCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SearchEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PopularKeyword" (
    "id" TEXT NOT NULL,
    "keyword" TEXT NOT NULL,
    "hitCount" INTEGER NOT NULL DEFAULT 0,
    "lastHitAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PopularKeyword_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SavedSearch_userId_deletedAt_idx" ON "SavedSearch"("userId", "deletedAt");

-- CreateIndex
CREATE INDEX "SavedSearch_createdAt_idx" ON "SavedSearch"("createdAt");

-- CreateIndex
CREATE INDEX "SearchEvent_createdAt_idx" ON "SearchEvent"("createdAt");

-- CreateIndex
CREATE INDEX "SearchEvent_userId_createdAt_idx" ON "SearchEvent"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "SearchEvent_keyword_createdAt_idx" ON "SearchEvent"("keyword", "createdAt");

-- CreateIndex
CREATE INDEX "SearchEvent_brandId_createdAt_idx" ON "SearchEvent"("brandId", "createdAt");

-- CreateIndex
CREATE INDEX "SearchEvent_modelId_createdAt_idx" ON "SearchEvent"("modelId", "createdAt");

-- CreateIndex
CREATE INDEX "SearchEvent_categoryId_createdAt_idx" ON "SearchEvent"("categoryId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "PopularKeyword_keyword_key" ON "PopularKeyword"("keyword");

-- CreateIndex
CREATE INDEX "PopularKeyword_hitCount_idx" ON "PopularKeyword"("hitCount" DESC);

-- CreateIndex
CREATE INDEX "PopularKeyword_active_hitCount_idx" ON "PopularKeyword"("active", "hitCount");

-- CreateIndex
CREATE INDEX "CarDetails_mileageKm_idx" ON "CarDetails"("mileageKm");

-- CreateIndex
CREATE INDEX "CarDetails_fuelTypeId_idx" ON "CarDetails"("fuelTypeId");

-- CreateIndex
CREATE INDEX "CarDetails_transmissionTypeId_idx" ON "CarDetails"("transmissionTypeId");

-- CreateIndex
CREATE INDEX "CarDetails_bodyTypeId_idx" ON "CarDetails"("bodyTypeId");

-- CreateIndex
CREATE INDEX "CarDetails_driveTypeId_idx" ON "CarDetails"("driveTypeId");

-- CreateIndex
CREATE INDEX "CarDetails_year_brandId_idx" ON "CarDetails"("year", "brandId");

-- CreateIndex
CREATE INDEX "Listing_isVerified_status_idx" ON "Listing"("isVerified", "status");

-- CreateIndex
CREATE INDEX "Listing_viewsCount_idx" ON "Listing"("viewsCount");

-- CreateIndex
CREATE INDEX "Listing_conditionTypeId_status_idx" ON "Listing"("conditionTypeId", "status");

-- CreateIndex
CREATE INDEX "Listing_status_isFeatured_publishedAt_idx" ON "Listing"("status", "isFeatured", "publishedAt");

-- CreateIndex
CREATE INDEX "ListingTranslation_title_idx" ON "ListingTranslation"("title");

-- AddForeignKey
ALTER TABLE "SavedSearch" ADD CONSTRAINT "SavedSearch_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SearchEvent" ADD CONSTRAINT "SearchEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Full-text search support for listing titles/descriptions (simple config = language-agnostic for ar/ku/en tokens)
CREATE INDEX IF NOT EXISTS "ListingTranslation_fts_idx"
ON "ListingTranslation"
USING GIN (to_tsvector('simple', coalesce("title", '') || ' ' || coalesce("description", '')));

CREATE INDEX IF NOT EXISTS "PlateDetails_plateDisplay_idx"
ON "PlateDetails" ("plateDisplay");

CREATE INDEX IF NOT EXISTS "VehicleBrand_nameEn_idx"
ON "VehicleBrand" ("nameEn");

CREATE INDEX IF NOT EXISTS "VehicleModel_nameEn_idx"
ON "VehicleModel" ("nameEn");

CREATE INDEX IF NOT EXISTS "City_nameEn_idx"
ON "City" ("nameEn");
