-- CreateEnum
CREATE TYPE "MediaVisibility" AS ENUM ('PUBLIC', 'PRIVATE');

-- CreateEnum
CREATE TYPE "MediaAssetStatus" AS ENUM ('PENDING_UPLOAD', 'PROCESSING', 'READY', 'FAILED', 'DELETED');

-- CreateEnum
CREATE TYPE "MediaVariantKind" AS ENUM ('ORIGINAL', 'THUMBNAIL', 'SMALL', 'MEDIUM', 'LARGE', 'WEBP', 'POSTER');

-- CreateEnum
CREATE TYPE "VirusScanStatus" AS ENUM ('PENDING', 'CLEAN', 'INFECTED', 'SKIPPED', 'FAILED');

-- DropIndex
DROP INDEX "City_nameEn_idx";

-- DropIndex
DROP INDEX "PlateDetails_plateDisplay_idx";

-- DropIndex
DROP INDEX "VehicleBrand_nameEn_idx";

-- DropIndex
DROP INDEX "VehicleModel_nameEn_idx";

-- CreateTable
CREATE TABLE "MediaAsset" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT,
    "mediaType" "MediaType" NOT NULL,
    "visibility" "MediaVisibility" NOT NULL DEFAULT 'PRIVATE',
    "status" "MediaAssetStatus" NOT NULL DEFAULT 'PENDING_UPLOAD',
    "originalKey" TEXT NOT NULL,
    "filename" TEXT,
    "mimeType" TEXT NOT NULL,
    "byteSize" INTEGER NOT NULL DEFAULT 0,
    "checksumSha256" TEXT,
    "width" INTEGER,
    "height" INTEGER,
    "durationSeconds" DOUBLE PRECISION,
    "ownerModule" TEXT,
    "ownerEntityId" TEXT,
    "virusScanStatus" "VirusScanStatus" NOT NULL DEFAULT 'PENDING',
    "processingError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,
    "updatedById" TEXT,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "MediaAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MediaVariant" (
    "id" TEXT NOT NULL,
    "mediaAssetId" TEXT NOT NULL,
    "kind" "MediaVariantKind" NOT NULL,
    "r2Key" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "byteSize" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "MediaVariant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MediaAsset_ownerId_deletedAt_idx" ON "MediaAsset"("ownerId", "deletedAt");

-- CreateIndex
CREATE INDEX "MediaAsset_status_mediaType_idx" ON "MediaAsset"("status", "mediaType");

-- CreateIndex
CREATE INDEX "MediaAsset_ownerModule_ownerEntityId_idx" ON "MediaAsset"("ownerModule", "ownerEntityId");

-- CreateIndex
CREATE INDEX "MediaAsset_originalKey_idx" ON "MediaAsset"("originalKey");

-- CreateIndex
CREATE INDEX "MediaAsset_visibility_status_idx" ON "MediaAsset"("visibility", "status");

-- CreateIndex
CREATE INDEX "MediaVariant_mediaAssetId_deletedAt_idx" ON "MediaVariant"("mediaAssetId", "deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "MediaVariant_mediaAssetId_kind_key" ON "MediaVariant"("mediaAssetId", "kind");

-- AddForeignKey
ALTER TABLE "MediaAsset" ADD CONSTRAINT "MediaAsset_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaAsset" ADD CONSTRAINT "MediaAsset_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaAsset" ADD CONSTRAINT "MediaAsset_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaVariant" ADD CONSTRAINT "MediaVariant_mediaAssetId_fkey" FOREIGN KEY ("mediaAssetId") REFERENCES "MediaAsset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

