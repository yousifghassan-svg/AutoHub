-- Sprint 17: Media platform v2 — ListingMedia ↔ MediaAsset bridge, blur placeholders, document purpose

-- AlterTable
ALTER TABLE "MediaAsset" ADD COLUMN "documentPurpose" TEXT,
ADD COLUMN "blurDataUrl" TEXT;

-- AlterTable
ALTER TABLE "ListingMedia" ADD COLUMN "mediaAssetId" TEXT;

-- CreateIndex
CREATE INDEX "MediaAsset_checksumSha256_idx" ON "MediaAsset"("checksumSha256");

-- CreateIndex
CREATE INDEX "ListingMedia_mediaAssetId_idx" ON "ListingMedia"("mediaAssetId");

-- AddForeignKey
ALTER TABLE "ListingMedia" ADD CONSTRAINT "ListingMedia_mediaAssetId_fkey" FOREIGN KEY ("mediaAssetId") REFERENCES "MediaAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;
