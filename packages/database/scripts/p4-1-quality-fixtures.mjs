/**
 * Priority 4 search quality fixtures (idempotent by slug prefix p4-quality-*).
 *
 * Usage (from repo root):
 *   node packages/database/scripts/p4-1-quality-fixtures.mjs
 *
 * Requires DATABASE_URL (defaults to local Docker autohub).
 */
import { PrismaClient, ListingCategoryCode, ListingStatus, LanguageCode } from '@prisma/client';

const prisma = new PrismaClient();
const SLUG_PREFIX = 'p4-quality-';

const FIXTURES = [
  {
    key: 'q1-camry',
    categoryCode: ListingCategoryCode.CAR,
    titleEn: '2020 Toyota Camry SE',
    titleAr: 'تويوتا كامري 2020',
    descriptionEn: 'Clean Camry SE with service history. Exact keyword fixture.',
    descriptionAr: 'كامري نظيفة مع سجل صيانة.',
    brandSlug: 'toyota',
    modelSlug: 'camry',
    citySlug: 'baghdad',
    year: 2020,
    featured: false,
    price: 18_000_000,
  },
  {
    key: 'q2-x5',
    categoryCode: ListingCategoryCode.CAR,
    titleEn: 'BMW X5 M Sport',
    titleAr: 'بي ام دبليو اكس فايف',
    descriptionEn: 'Partial token target includes X5 in the title.',
    descriptionAr: 'سيارة بي ام دبليو اكس فايف.',
    brandSlug: 'bmw',
    modelSlug: 'x5',
    citySlug: 'erbil',
    year: 2021,
    featured: false,
    price: 45_000_000,
  },
  {
    key: 'q3-patrol',
    categoryCode: ListingCategoryCode.CAR,
    titleEn: 'Clean Nissan Patrol Safari',
    titleAr: 'نيسان باترول',
    descriptionEn: 'Exact Patrol keyword fixture for stability checks.',
    descriptionAr: 'نيسان باترول سفاري.',
    brandSlug: 'nissan',
    modelSlug: null,
    citySlug: 'basra',
    year: 2019,
    featured: false,
    price: 32_000_000,
  },
  {
    key: 'q4-cat',
    categoryCode: ListingCategoryCode.HEAVY_EQUIPMENT,
    titleEn: 'Caterpillar 320 Excavator',
    titleAr: 'حفارة كاتربيلر 320',
    descriptionEn: 'Heavy equipment keyword parity fixture — Caterpillar excavator.',
    descriptionAr: 'حفارة كاتربيلر للاختبار.',
    makeName: 'Caterpillar',
    modelName: '320',
    equipmentType: 'EXCAVATOR',
    citySlug: 'baghdad',
    year: 2019,
    featured: false,
    price: 55_000_000,
  },
  {
    key: 'q5-komatsu',
    categoryCode: ListingCategoryCode.HEAVY_EQUIPMENT,
    titleEn: 'Komatsu Bulldozer D65',
    titleAr: 'بلدوزر كوماتسو',
    descriptionEn: 'Heavy equipment year-filter fixture.',
    descriptionAr: 'بلدوزر كوماتسو D65.',
    makeName: 'Komatsu',
    modelName: 'D65',
    equipmentType: 'BULLDOZER',
    citySlug: 'erbil',
    year: 2015,
    featured: false,
    price: 40_000_000,
  },
  {
    key: 'q6-tesla',
    categoryCode: ListingCategoryCode.CAR,
    titleEn: 'Tesla Model 3 Long Range',
    titleAr: 'تيسلا موديل 3',
    descriptionEn: 'Featured fixture for heuristic ordering checks.',
    descriptionAr: 'تيسلا موديل 3 طويلة المدى.',
    brandSlug: 'tesla',
    modelSlug: null,
    citySlug: 'baghdad',
    year: 2022,
    featured: true,
    price: 48_000_000,
  },
];

async function main() {
  const seller = await prisma.user.findFirst({
    where: { deletedAt: null, status: 'ACTIVE' },
    orderBy: { createdAt: 'asc' },
  });
  if (!seller) throw new Error('No user found — run db seed first');

  const country = await prisma.country.findFirst({ where: { active: true } });
  const iqd = await prisma.currency.findFirst({ where: { code: 'IQD' } });
  if (!country || !iqd) throw new Error('Missing country or IQD currency');

  const cities = await prisma.city.findMany({ where: { active: true } });
  const cityBySlug = new Map(cities.map((c) => [c.slug, c]));

  const categories = await prisma.category.findMany();
  const categoryByCode = new Map(categories.map((c) => [c.code, c]));

  const brands = await prisma.vehicleBrand.findMany({ include: { models: true } });
  const brandBySlug = new Map(brands.map((b) => [b.slug, b]));

  // Ensure Tesla brand exists for Q6 (may be absent from older seeds)
  let tesla = brandBySlug.get('tesla');
  if (!tesla) {
    tesla = await prisma.vehicleBrand.create({
      data: {
        slug: 'tesla',
        nameEn: 'Tesla',
        nameAr: 'تيسلا',
        category: ListingCategoryCode.CAR,
        active: true,
      },
      include: { models: true },
    });
    brandBySlug.set('tesla', tesla);
  }

  // Ensure Nissan brand exists
  let nissan = brandBySlug.get('nissan');
  if (!nissan) {
    nissan = await prisma.vehicleBrand.create({
      data: {
        slug: 'nissan',
        nameEn: 'Nissan',
        nameAr: 'نيسان',
        category: ListingCategoryCode.CAR,
        active: true,
      },
      include: { models: true },
    });
    brandBySlug.set('nissan', nissan);
  }

  const existing = await prisma.listing.findMany({
    where: { slug: { startsWith: SLUG_PREFIX } },
    select: { id: true, slug: true },
  });
  for (const row of existing) {
    await prisma.listing.delete({ where: { id: row.id } });
  }

  for (const fix of FIXTURES) {
    const city = cityBySlug.get(fix.citySlug);
    const category = categoryByCode.get(fix.categoryCode);
    if (!city || !category) {
      throw new Error(`Missing city/category for ${fix.key}`);
    }

    const slug = `${SLUG_PREFIX}${fix.key}`;
    const listing = await prisma.listing.create({
      data: {
        domain: 'VEHICLE',
        slug,
        status: ListingStatus.ACTIVE,
        categoryId: category.id,
        categoryCode: fix.categoryCode,
        sellerId: seller.id,
        cityId: city.id,
        countryId: country.id,
        primaryPrice: fix.price,
        primaryCurrencyId: iqd.id,
        isFeatured: fix.featured,
        publishedAt: new Date(),
        createdById: seller.id,
        updatedById: seller.id,
        translations: {
          create: [
            {
              language: LanguageCode.en,
              title: fix.titleEn,
              description: fix.descriptionEn,
              createdById: seller.id,
              updatedById: seller.id,
            },
            {
              language: LanguageCode.ar,
              title: fix.titleAr,
              description: fix.descriptionAr,
              createdById: seller.id,
              updatedById: seller.id,
            },
          ],
        },
      },
    });

    if (fix.categoryCode === ListingCategoryCode.HEAVY_EQUIPMENT) {
      await prisma.heavyEquipmentDetails.create({
        data: {
          listingId: listing.id,
          equipmentType: fix.equipmentType,
          makeName: fix.makeName,
          modelName: fix.modelName,
          year: fix.year,
        },
      });
    } else {
      const brand = brandBySlug.get(fix.brandSlug);
      if (!brand) throw new Error(`Missing brand ${fix.brandSlug}`);
      const model = fix.modelSlug
        ? brand.models.find((m) => m.slug === fix.modelSlug)
        : undefined;
      await prisma.carDetails.create({
        data: {
          listingId: listing.id,
          brandId: brand.id,
          modelId: model?.id,
          year: fix.year,
          mileageKm: 40_000,
        },
      });
    }

    console.log(`created ${slug} (${listing.id})`);
  }

  console.log('P4-1 quality fixtures ready.');
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
