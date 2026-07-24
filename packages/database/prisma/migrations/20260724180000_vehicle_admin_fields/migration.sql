-- AlterTable
ALTER TABLE "CarDetails" ADD COLUMN "vin" TEXT,
ADD COLUMN "trim" TEXT,
ADD COLUMN "seats" INTEGER,
ADD COLUMN "interiorColor" TEXT;

-- AlterTable
ALTER TABLE "Listing" ADD COLUMN "latitude" DECIMAL(10,7),
ADD COLUMN "longitude" DECIMAL(10,7),
ADD COLUMN "locationText" TEXT;
