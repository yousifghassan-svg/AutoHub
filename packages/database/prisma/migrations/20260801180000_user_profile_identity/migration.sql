-- Release 0.2 Phase B: consumer profile fields (avatar URL only; media in 0.3)
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "avatarUrl" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "dateOfBirth" DATE;

-- Allow clearing preferred language via PATCH /auth/me (null)
ALTER TABLE "User" ALTER COLUMN "preferredLanguage" DROP NOT NULL;
