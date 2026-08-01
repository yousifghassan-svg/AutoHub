-- Priority 1 Scope B: extended user profile, avatar MediaAsset link, notification prefs

ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "firstName" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "lastName" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "avatarMediaId" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "User_avatarMediaId_key" ON "User"("avatarMediaId");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'User_avatarMediaId_fkey'
  ) THEN
    ALTER TABLE "User"
      ADD CONSTRAINT "User_avatarMediaId_fkey"
      FOREIGN KEY ("avatarMediaId") REFERENCES "MediaAsset"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS "UserNotificationPreference" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "pushEnabled" BOOLEAN NOT NULL DEFAULT true,
    "emailEnabled" BOOLEAN NOT NULL DEFAULT true,
    "smsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "newMessage" BOOLEAN NOT NULL DEFAULT true,
    "listingApproved" BOOLEAN NOT NULL DEFAULT true,
    "listingRejected" BOOLEAN NOT NULL DEFAULT true,
    "priceChange" BOOLEAN NOT NULL DEFAULT true,
    "favouriteUpdate" BOOLEAN NOT NULL DEFAULT true,
    "dealerReply" BOOLEAN NOT NULL DEFAULT true,
    "system" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserNotificationPreference_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "UserNotificationPreference_userId_key"
  ON "UserNotificationPreference"("userId");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'UserNotificationPreference_userId_fkey'
  ) THEN
    ALTER TABLE "UserNotificationPreference"
      ADD CONSTRAINT "UserNotificationPreference_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
