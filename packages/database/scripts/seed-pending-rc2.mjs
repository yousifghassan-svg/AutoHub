/**
 * One-shot: set/create PENDING vehicle listings for RC-2 moderation checks.
 * Loads DATABASE_URL from apps/api/.env (never prints it).
 */
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PrismaClient } from '@prisma/client';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');

function loadDatabaseUrl() {
  if (process.env.DATABASE_URL) return true;
  const candidates = [
    resolve(root, 'apps/api/.env'),
    resolve(root, 'packages/database/.env'),
    resolve(root, '.env'),
  ];
  for (const file of candidates) {
    if (!existsSync(file)) continue;
    const text = readFileSync(file, 'utf8');
    for (const line of text.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#') || !trimmed.startsWith('DATABASE_URL=')) continue;
      let value = trimmed.slice('DATABASE_URL='.length).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      process.env.DATABASE_URL = value;
      return true;
    }
  }
  return false;
}

if (!loadDatabaseUrl()) {
  console.error('DATABASE_URL not found');
  process.exit(1);
}

const prisma = new PrismaClient();

function titleOf(listing) {
  const t =
    listing.translations?.find((x) => x.language === 'en') ||
    listing.translations?.[0];
  return t?.title ?? '(no title)';
}

async function main() {
  const include = { translations: true };

  // Prefer ACTIVE vehicle-domain listings; fall back to any ACTIVE
  let actives = await prisma.listing.findMany({
    where: { deletedAt: null, status: 'ACTIVE', domain: 'VEHICLE' },
    take: 3,
    orderBy: { updatedAt: 'desc' },
    include,
  });
  if (actives.length === 0) {
    actives = await prisma.listing.findMany({
      where: { deletedAt: null, status: 'ACTIVE' },
      take: 3,
      orderBy: { updatedAt: 'desc' },
      include,
    });
  }

  const updated = [];
  for (const listing of actives) {
    const row = await prisma.listing.update({
      where: { id: listing.id },
      data: { status: 'PENDING' },
      include,
    });
    updated.push(row);
    console.log(`UPDATED_PENDING\t${row.id}\t${titleOf(row)}`);
  }

  let pendingCount = await prisma.listing.count({
    where: { deletedAt: null, status: 'PENDING' },
  });

  if (pendingCount < 2) {
    // Clone from a seed seller listing, or flip more ACTIVES
    const seedSeller = await prisma.user.findFirst({
      where: {
        deletedAt: null,
        OR: [
          { firebaseUid: { startsWith: 'seed:' } },
          { phone: { startsWith: '+964770001' } },
        ],
      },
      orderBy: { createdAt: 'asc' },
    });

    const source =
      (seedSeller &&
        (await prisma.listing.findFirst({
          where: {
            deletedAt: null,
            sellerId: seedSeller.id,
            domain: 'VEHICLE',
          },
          include,
          orderBy: { updatedAt: 'desc' },
        }))) ||
      (await prisma.listing.findFirst({
        where: { deletedAt: null, domain: 'VEHICLE' },
        include,
        orderBy: { updatedAt: 'desc' },
      })) ||
      (await prisma.listing.findFirst({
        where: { deletedAt: null },
        include,
        orderBy: { updatedAt: 'desc' },
      }));

    if (!source) {
      console.error('No listing available to clone');
      process.exit(1);
    }

    // Prefer flipping more ACTIVES if available
    const moreActives = await prisma.listing.findMany({
      where: {
        deletedAt: null,
        status: 'ACTIVE',
        id: { notIn: updated.map((u) => u.id) },
      },
      take: 2 - pendingCount,
      orderBy: { updatedAt: 'desc' },
      include,
    });

    if (moreActives.length > 0) {
      for (const listing of moreActives) {
        const row = await prisma.listing.update({
          where: { id: listing.id },
          data: { status: 'PENDING' },
          include,
        });
        updated.push(row);
        console.log(`UPDATED_PENDING\t${row.id}\t${titleOf(row)}`);
      }
    } else {
      const slug = `rc2-pending-${Date.now()}`;
      const created = await prisma.listing.create({
        data: {
          sellerId: source.sellerId ?? seedSeller?.id ?? null,
          categoryId: source.categoryId,
          categoryCode: source.categoryCode,
          domain: source.domain,
          status: 'PENDING',
          countryId: source.countryId,
          cityId: source.cityId,
          conditionTypeId: source.conditionTypeId,
          primaryPrice: source.primaryPrice,
          primaryCurrencyId: source.primaryCurrencyId,
          secondaryPrice: source.secondaryPrice,
          secondaryCurrencyId: source.secondaryCurrencyId,
          fxRateSnapshot: source.fxRateSnapshot,
          slug,
          metaTitle: source.metaTitle,
          metaDescription: source.metaDescription,
          locationText: source.locationText,
          features: source.features ?? [],
          createdById: source.createdById,
          updatedById: source.updatedById,
          translations: {
            create: (source.translations?.length
              ? source.translations
              : [{ language: 'en', title: 'RC-2 Pending Listing', description: 'Seeded for moderation' }]
            ).map((t) => ({
              language: t.language,
              title: t.title?.startsWith('RC-2') ? t.title : `RC-2 ${t.title}`,
              description: t.description ?? 'Seeded PENDING for RC-2',
            })),
          },
        },
        include,
      });
      updated.push(created);
      console.log(`CREATED_PENDING\t${created.id}\t${titleOf(created)}`);
    }

    pendingCount = await prisma.listing.count({
      where: { deletedAt: null, status: 'PENDING' },
    });
  }

  const allPending = await prisma.listing.findMany({
    where: { deletedAt: null, status: 'PENDING' },
    take: 20,
    orderBy: { updatedAt: 'desc' },
    include,
  });

  console.log(`PENDING_COUNT\t${pendingCount}`);
  for (const row of allPending) {
    console.log(`PENDING\t${row.id}\t${titleOf(row)}`);
  }
}

main()
  .catch((err) => {
    console.error(err?.message || err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
