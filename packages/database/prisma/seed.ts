/**
 * AutoHub development seed — catalog + demo marketplace data.
 *
 * Run: pnpm db:seed
 *   or: pnpm --filter @autohub/database exec prisma db seed
 */
import {
  ListingCategoryCode,
  ListingStatus,
  MediaType,
  PlateValidationStrictness,
  PrismaClient,
  SellerType,
  UserRole,
  UserStatus,
  VerificationStatus,
  LanguageCode,
} from '@prisma/client';

const prisma = new PrismaClient();

const LAUNCH_CITY_SLUGS = [
  'erbil',
  'baghdad',
  'duhok',
  'sulaymaniyah',
  'basra',
  'mosul',
  'kirkuk',
] as const;

const BRAND_CATALOG: Array<{
  slug: string;
  nameEn: string;
  nameAr: string;
  models: Array<{ slug: string; nameEn: string; nameAr: string }>;
}> = [
  {
    slug: 'toyota',
    nameEn: 'Toyota',
    nameAr: 'تويوتا',
    models: [
      { slug: 'land-cruiser', nameEn: 'Land Cruiser', nameAr: 'لاندكروزر' },
      { slug: 'camry', nameEn: 'Camry', nameAr: 'كامري' },
      { slug: 'corolla', nameEn: 'Corolla', nameAr: 'كورولا' },
    ],
  },
  {
    slug: 'lexus',
    nameEn: 'Lexus',
    nameAr: 'لكزس',
    models: [
      { slug: 'lx600', nameEn: 'LX600', nameAr: 'LX600' },
      { slug: 'gx460', nameEn: 'GX460', nameAr: 'GX460' },
      { slug: 'es350', nameEn: 'ES350', nameAr: 'ES350' },
    ],
  },
  {
    slug: 'bmw',
    nameEn: 'BMW',
    nameAr: 'بي إم دبليو',
    models: [
      { slug: 'x5', nameEn: 'X5', nameAr: 'إكس 5' },
      { slug: 'x7', nameEn: 'X7', nameAr: 'إكس 7' },
    ],
  },
  {
    slug: 'mercedes',
    nameEn: 'Mercedes',
    nameAr: 'مرسيدس',
    models: [
      { slug: 's-class', nameEn: 'S-Class', nameAr: 'إس كلاس' },
      { slug: 'c-class', nameEn: 'C-Class', nameAr: 'سي كلاس' },
      { slug: 'gle', nameEn: 'GLE', nameAr: 'GLE' },
    ],
  },
  {
    slug: 'audi',
    nameEn: 'Audi',
    nameAr: 'أودي',
    models: [
      { slug: 'a6', nameEn: 'A6', nameAr: 'A6' },
      { slug: 'q8', nameEn: 'Q8', nameAr: 'Q8' },
    ],
  },
  {
    slug: 'hyundai',
    nameEn: 'Hyundai',
    nameAr: 'هيونداي',
    models: [
      { slug: 'sonata', nameEn: 'Sonata', nameAr: 'سوناتا' },
      { slug: 'tucson', nameEn: 'Tucson', nameAr: 'توسان' },
    ],
  },
  {
    slug: 'kia',
    nameEn: 'Kia',
    nameAr: 'كيا',
    models: [{ slug: 'sportage', nameEn: 'Sportage', nameAr: 'سبورتاج' }],
  },
  {
    slug: 'nissan',
    nameEn: 'Nissan',
    nameAr: 'نيسان',
    models: [
      { slug: 'patrol', nameEn: 'Patrol', nameAr: 'باترول' },
      { slug: 'altima', nameEn: 'Altima', nameAr: 'التيما' },
    ],
  },
  {
    slug: 'ford',
    nameEn: 'Ford',
    nameAr: 'فورد',
    models: [{ slug: 'f-150', nameEn: 'F-150', nameAr: 'F-150' }],
  },
  {
    slug: 'chevrolet',
    nameEn: 'Chevrolet',
    nameAr: 'شيفروليه',
    models: [{ slug: 'silverado', nameEn: 'Silverado', nameAr: 'سيلفرادو' }],
  },
  {
    slug: 'tesla',
    nameEn: 'Tesla',
    nameAr: 'تسلا',
    models: [
      { slug: 'model-y', nameEn: 'Model Y', nameAr: 'Model Y' },
      { slug: 'model-3', nameEn: 'Model 3', nameAr: 'Model 3' },
    ],
  },
];

const PLATE_FORMATS: Array<{
  code: string;
  govCode: string;
  nameEn: string;
  nameAr: string;
  nameKu?: string;
  example: string;
  regionCode: string;
  strictness: PlateValidationStrictness;
}> = [
  {
    code: 'IQ_ERBIL',
    govCode: 'EBL',
    nameEn: 'Erbil Plate',
    nameAr: 'لوحة أربيل',
    nameKu: 'ژمارەی هەولێر',
    example: '22 X 99099',
    regionCode: '22',
    strictness: PlateValidationStrictness.STRICT,
  },
  {
    code: 'IQ_BAGHDAD',
    govCode: 'BGW',
    nameEn: 'Baghdad Plate',
    nameAr: 'لوحة بغداد',
    example: '11 B 22222',
    regionCode: '11',
    strictness: PlateValidationStrictness.SOFT,
  },
  {
    code: 'IQ_DUHOK',
    govCode: 'DHK',
    nameEn: 'Duhok Plate',
    nameAr: 'لوحة دهوك',
    nameKu: 'ژمارەی دهۆک',
    example: '27 B 12345',
    regionCode: '27',
    strictness: PlateValidationStrictness.SOFT,
  },
  {
    code: 'IQ_SULAYMANIYAH',
    govCode: 'SLC',
    nameEn: 'Sulaymaniyah Plate',
    nameAr: 'لوحة السليمانية',
    nameKu: 'ژمارەی سلێمانی',
    example: '25 C 12345',
    regionCode: '25',
    strictness: PlateValidationStrictness.SOFT,
  },
  {
    code: 'IQ_BASRA',
    govCode: 'BSR',
    nameEn: 'Basra Plate',
    nameAr: 'لوحة البصرة',
    example: '14 D 12345',
    regionCode: '14',
    strictness: PlateValidationStrictness.SOFT,
  },
  {
    code: 'IQ_MOSUL',
    govCode: 'NIN',
    nameEn: 'Mosul Plate',
    nameAr: 'لوحة الموصل',
    example: '15 E 12345',
    regionCode: '15',
    strictness: PlateValidationStrictness.SOFT,
  },
  {
    code: 'IQ_KIRKUK',
    govCode: 'KRK',
    nameEn: 'Kirkuk Plate',
    nameAr: 'لوحة كركوك',
    nameKu: 'ژمارەی کەرکووک',
    example: '16 F 12345',
    regionCode: '16',
    strictness: PlateValidationStrictness.SOFT,
  },
];

const PLATE_TYPES = ['Private', 'Taxi', 'Government', 'Commercial', 'Diplomatic'] as const;
const LETTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ'.split('');

function mulberry32(seed: number) {
  return function next() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(rng: () => number, items: readonly T[]): T {
  return items[Math.floor(rng() * items.length)]!;
}

function randInt(rng: () => number, min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

async function upsertSpec(
  table: 'fuelType' | 'transmissionType' | 'driveType' | 'bodyType' | 'color' | 'engineType' | 'conditionType',
  rows: Array<{ code: string; nameEn: string; nameAr: string; nameKu?: string; hex?: string }>,
) {
  let sort = 0;
  for (const row of rows) {
    const data = {
      nameEn: row.nameEn,
      nameAr: row.nameAr,
      nameKu: row.nameKu,
      sortOrder: sort,
      active: true,
      ...(table === 'color' && row.hex ? { hex: row.hex } : {}),
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const model = (prisma as any)[table];
    await model.upsert({
      where: { code: row.code },
      update: data,
      create: { code: row.code, ...data },
    });
    sort += 1;
  }
}

async function clearSeedDemoData() {
  await prisma.listingReport.deleteMany({
    where: {
      OR: [
        { reporter: { firebaseUid: { startsWith: 'seed:' } } },
        { listing: { slug: { startsWith: 'seed-' } } },
      ],
    },
  });
  await prisma.adminAuditLog.deleteMany({
    where: { actor: { firebaseUid: { startsWith: 'seed:' } } },
  });
  await prisma.listing.deleteMany({ where: { slug: { startsWith: 'seed-' } } });
  await prisma.dealerMember.deleteMany({
    where: { organization: { slug: { startsWith: 'seed-dealer-' } } },
  });
  await prisma.dealerOrganization.deleteMany({ where: { slug: { startsWith: 'seed-dealer-' } } });
  await prisma.sellerProfile.deleteMany({
    where: { user: { firebaseUid: { startsWith: 'seed:' } } },
  });
  await prisma.user.deleteMany({ where: { firebaseUid: { startsWith: 'seed:' } } });
}

async function seedCatalog() {
  const iqd = await prisma.currency.upsert({
    where: { code: 'IQD' },
    update: {
      nameEn: 'Iraqi Dinar',
      nameAr: 'الدينار العراقي',
      nameKu: 'دیناری عێراقی',
      symbol: 'د.ع',
      decimalPlaces: 0,
      active: true,
      isDefault: true,
      sortOrder: 10,
    },
    create: {
      id: 'curr_iqd',
      code: 'IQD',
      nameEn: 'Iraqi Dinar',
      nameAr: 'الدينار العراقي',
      nameKu: 'دیناری عێراقی',
      symbol: 'د.ع',
      decimalPlaces: 0,
      active: true,
      isDefault: true,
      sortOrder: 10,
    },
  });

  const usd = await prisma.currency.upsert({
    where: { code: 'USD' },
    update: {
      nameEn: 'US Dollar',
      nameAr: 'الدولار الأمريكي',
      nameKu: 'دۆلاری ئەمریکی',
      symbol: '$',
      decimalPlaces: 2,
      active: true,
      isDefault: false,
      sortOrder: 20,
    },
    create: {
      id: 'curr_usd',
      code: 'USD',
      nameEn: 'US Dollar',
      nameAr: 'الدولار الأمريكي',
      nameKu: 'دۆلاری ئەمریکی',
      symbol: '$',
      decimalPlaces: 2,
      active: true,
      isDefault: false,
      sortOrder: 20,
    },
  });

  await prisma.currency.updateMany({
    where: { code: { not: 'IQD' } },
    data: { isDefault: false },
  });

  const categories = [
    {
      code: ListingCategoryCode.CAR,
      slug: 'cars',
      nameEn: 'Cars',
      nameAr: 'سيارات',
      nameKu: 'ئۆتۆمبێل',
      sortOrder: 1,
    },
    {
      code: ListingCategoryCode.PLATE,
      slug: 'plates',
      nameEn: 'Plate Numbers',
      nameAr: 'لوحات أرقام',
      nameKu: 'ژمارەی پلێت',
      sortOrder: 2,
    },
    {
      code: ListingCategoryCode.MOTORCYCLE,
      slug: 'motorcycles',
      nameEn: 'Motorcycles',
      nameAr: 'دراجات نارية',
      nameKu: 'ماتۆڕ',
      sortOrder: 3,
    },
    {
      code: ListingCategoryCode.TRUCK,
      slug: 'trucks',
      nameEn: 'Trucks',
      nameAr: 'شاحنات',
      nameKu: 'بارهەڵگر',
      sortOrder: 4,
    },
    {
      code: ListingCategoryCode.HEAVY_EQUIPMENT,
      slug: 'heavy-equipment',
      nameEn: 'Heavy Equipment',
      nameAr: 'معدات ثقيلة',
      nameKu: 'ئامێری قورس',
      sortOrder: 5,
    },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { code: category.code },
      update: category,
      create: category,
    });
  }

  await upsertSpec('fuelType', [
    { code: 'PETROL', nameEn: 'Petrol', nameAr: 'بنزين', nameKu: 'بەنزین' },
    { code: 'DIESEL', nameEn: 'Diesel', nameAr: 'ديزل', nameKu: 'دیزڵ' },
    { code: 'HYBRID', nameEn: 'Hybrid', nameAr: 'هجين', nameKu: 'هایبرید' },
    { code: 'ELECTRIC', nameEn: 'Electric', nameAr: 'كهربائي', nameKu: 'کارەبایی' },
    { code: 'LPG', nameEn: 'LPG', nameAr: 'غاز', nameKu: 'غاز' },
  ]);

  await upsertSpec('transmissionType', [
    { code: 'AUTOMATIC', nameEn: 'Automatic', nameAr: 'أوتوماتيك', nameKu: 'ئۆتۆماتیک' },
    { code: 'MANUAL', nameEn: 'Manual', nameAr: 'عادي', nameKu: 'دەستی' },
    { code: 'CVT', nameEn: 'CVT', nameAr: 'CVT', nameKu: 'CVT' },
  ]);

  await upsertSpec('driveType', [
    { code: 'FWD', nameEn: 'Front-Wheel Drive', nameAr: 'دفع أمامي', nameKu: 'هێزی پێشەوە' },
    { code: 'RWD', nameEn: 'Rear-Wheel Drive', nameAr: 'دفع خلفي', nameKu: 'هێزی دواوە' },
    { code: 'AWD', nameEn: 'All-Wheel Drive', nameAr: 'دفع رباعي', nameKu: 'هێزی هەموو چەرخ' },
    { code: 'FOUR_WD', nameEn: '4WD', nameAr: 'رباعي', nameKu: '4WD' },
  ]);

  await upsertSpec('bodyType', [
    { code: 'SEDAN', nameEn: 'Sedan', nameAr: 'سيدان', nameKu: 'سیدان' },
    { code: 'SUV', nameEn: 'SUV', nameAr: 'دفع رباعي', nameKu: 'SUV' },
    { code: 'HATCHBACK', nameEn: 'Hatchback', nameAr: 'هاتشباك', nameKu: 'هاتچباک' },
    { code: 'PICKUP', nameEn: 'Pickup', nameAr: 'بيك أب', nameKu: 'پیکاپ' },
    { code: 'COUPE', nameEn: 'Coupe', nameAr: 'كوبيه', nameKu: 'کوپێ' },
    { code: 'VAN', nameEn: 'Van', nameAr: 'فان', nameKu: 'ڤان' },
  ]);

  await upsertSpec('color', [
    { code: 'WHITE', nameEn: 'White', nameAr: 'أبيض', nameKu: 'سپی', hex: '#FFFFFF' },
    { code: 'BLACK', nameEn: 'Black', nameAr: 'أسود', nameKu: 'ڕەش', hex: '#000000' },
    { code: 'SILVER', nameEn: 'Silver', nameAr: 'فضي', nameKu: 'زیوی', hex: '#C0C0C0' },
    { code: 'GRAY', nameEn: 'Gray', nameAr: 'رمادي', nameKu: 'خۆڵەمێشی', hex: '#808080' },
    { code: 'RED', nameEn: 'Red', nameAr: 'أحمر', nameKu: 'سور', hex: '#C8102E' },
    { code: 'BLUE', nameEn: 'Blue', nameAr: 'أزرق', nameKu: 'شین', hex: '#1D4ED8' },
  ]);

  await upsertSpec('engineType', [
    { code: 'INLINE4', nameEn: 'Inline-4', nameAr: 'أربع سلندر', nameKu: '٤ سلندەر' },
    { code: 'V6', nameEn: 'V6', nameAr: 'V6', nameKu: 'V6' },
    { code: 'V8', nameEn: 'V8', nameAr: 'V8', nameKu: 'V8' },
    {
      code: 'ELECTRIC_MOTOR',
      nameEn: 'Electric Motor',
      nameAr: 'محرك كهربائي',
      nameKu: 'مۆتۆری کارەبایی',
    },
  ]);

  await upsertSpec('conditionType', [
    { code: 'NEW', nameEn: 'New', nameAr: 'جديد', nameKu: 'نوێ' },
    { code: 'USED', nameEn: 'Used', nameAr: 'مستعمل', nameKu: 'بەکارهاتوو' },
    { code: 'CERTIFIED', nameEn: 'Certified Pre-Owned', nameAr: 'معتمد', nameKu: 'پەسەندکراو' },
  ]);

  const country = await prisma.country.upsert({
    where: { code: 'IQ' },
    update: {
      nameEn: 'Iraq',
      nameAr: 'العراق',
      nameKu: 'عێراق',
      defaultCurrencyId: iqd.id,
    },
    create: {
      code: 'IQ',
      nameEn: 'Iraq',
      nameAr: 'العراق',
      nameKu: 'عێراق',
      defaultCurrencyId: iqd.id,
    },
  });

  const governorates = [
    { code: 'EBL', nameEn: 'Erbil', nameAr: 'أربيل', nameKu: 'هەولێر', city: { slug: 'erbil', launch: true } },
    { code: 'BGW', nameEn: 'Baghdad', nameAr: 'بغداد', nameKu: 'بەغدا', city: { slug: 'baghdad', launch: true } },
    {
      code: 'SLC',
      nameEn: 'Sulaymaniyah',
      nameAr: 'السليمانية',
      nameKu: 'سلێمانی',
      city: { slug: 'sulaymaniyah', launch: true },
    },
    { code: 'DHK', nameEn: 'Duhok', nameAr: 'دهوك', nameKu: 'دهۆک', city: { slug: 'duhok', launch: true } },
    { code: 'KRK', nameEn: 'Kirkuk', nameAr: 'كركوك', nameKu: 'کەرکووک', city: { slug: 'kirkuk', launch: true } },
    { code: 'BSR', nameEn: 'Basra', nameAr: 'البصرة', nameKu: 'بەصرە', city: { slug: 'basra', launch: true } },
    { code: 'NJF', nameEn: 'Najaf', nameAr: 'النجف', nameKu: 'نەجەف', city: { slug: 'najaf', launch: true } },
    { code: 'KRB', nameEn: 'Karbala', nameAr: 'كربلاء', nameKu: 'کەربەلا', city: { slug: 'karbala', launch: true } },
    { code: 'NIN', nameEn: 'Nineveh', nameAr: 'نينوى', nameKu: 'نەینەوا', city: { slug: 'mosul', launch: true } },
    { code: 'ANB', nameEn: 'Anbar', nameAr: 'الأنبار', city: { slug: 'ramadi', launch: false } },
    { code: 'BBL', nameEn: 'Babylon', nameAr: 'بابل', city: { slug: 'hilla', launch: false } },
    { code: 'DYL', nameEn: 'Diyala', nameAr: 'ديالى', city: { slug: 'baqubah', launch: false } },
    { code: 'WAS', nameEn: 'Wasit', nameAr: 'واسط', city: { slug: 'kut', launch: false } },
    { code: 'SDQ', nameEn: 'Maysan', nameAr: 'ميسان', city: { slug: 'amarah', launch: false } },
    { code: 'MTH', nameEn: 'Muthanna', nameAr: 'المثنى', city: { slug: 'samawah', launch: false } },
    { code: 'QAD', nameEn: 'Qadisiyyah', nameAr: 'القادسية', city: { slug: 'diwaniyah', launch: false } },
    { code: 'DHI', nameEn: 'Dhi Qar', nameAr: 'ذي قار', city: { slug: 'nasiriyah', launch: false } },
    { code: 'SAL', nameEn: 'Saladin', nameAr: 'صلاح الدين', city: { slug: 'tikrit', launch: false } },
  ] as const;

  let sort = 0;
  for (const gov of governorates) {
    const governorate = await prisma.governorate.upsert({
      where: { countryId_code: { countryId: country.id, code: gov.code } },
      update: {
        nameEn: gov.nameEn,
        nameAr: gov.nameAr,
        nameKu: 'nameKu' in gov ? gov.nameKu : undefined,
        sortOrder: sort,
      },
      create: {
        countryId: country.id,
        code: gov.code,
        nameEn: gov.nameEn,
        nameAr: gov.nameAr,
        nameKu: 'nameKu' in gov ? gov.nameKu : undefined,
        sortOrder: sort,
      },
    });
    sort += 1;

    await prisma.city.upsert({
      where: { governorateId_slug: { governorateId: governorate.id, slug: gov.city.slug } },
      update: {
        nameEn: gov.nameEn === 'Nineveh' ? 'Mosul' : gov.nameEn,
        nameAr: gov.nameEn === 'Nineveh' ? 'الموصل' : gov.nameAr,
        nameKu: 'nameKu' in gov ? gov.nameKu : undefined,
        isLaunchCity: gov.city.launch,
      },
      create: {
        governorateId: governorate.id,
        slug: gov.city.slug,
        nameEn: gov.nameEn === 'Nineveh' ? 'Mosul' : gov.nameEn,
        nameAr: gov.nameEn === 'Nineveh' ? 'الموصل' : gov.nameAr,
        nameKu: 'nameKu' in gov ? gov.nameKu : undefined,
        isLaunchCity: gov.city.launch,
      },
    });
  }

  for (const format of PLATE_FORMATS) {
    const gov = await prisma.governorate.findFirst({
      where: { countryId: country.id, code: format.govCode },
    });
    await prisma.plateFormat.upsert({
      where: { code: format.code },
      update: {
        strictness: format.strictness,
        governorateId: gov?.id,
        example: format.example,
        nameEn: format.nameEn,
        nameAr: format.nameAr,
        nameKu: format.nameKu,
      },
      create: {
        code: format.code,
        governorateId: gov?.id,
        nameEn: format.nameEn,
        nameAr: format.nameAr,
        nameKu: format.nameKu,
        mask: '22 X 12345',
        regex: '^[0-9]{1,4}[\\s-]?[A-Zء-ي]{1,3}[\\s-]?\\d{4,7}$',
        example: format.example,
        strictness: format.strictness,
      },
    });
  }

  let brandSort = 0;
  for (const brand of BRAND_CATALOG) {
    const vehicleBrand = await prisma.vehicleBrand.upsert({
      where: { slug: brand.slug },
      update: {
        nameEn: brand.nameEn,
        nameAr: brand.nameAr,
        category: ListingCategoryCode.CAR,
        sortOrder: brandSort,
        active: true,
      },
      create: {
        slug: brand.slug,
        nameEn: brand.nameEn,
        nameAr: brand.nameAr,
        category: ListingCategoryCode.CAR,
        sortOrder: brandSort,
      },
    });
    brandSort += 1;

    for (const model of brand.models) {
      await prisma.vehicleModel.upsert({
        where: { brandId_slug: { brandId: vehicleBrand.id, slug: model.slug } },
        update: { nameEn: model.nameEn, nameAr: model.nameAr, active: true },
        create: {
          brandId: vehicleBrand.id,
          slug: model.slug,
          nameEn: model.nameEn,
          nameAr: model.nameAr,
        },
      });
    }
  }

  return { iqd, usd, country };
}

async function seedAdminPlatform(cityId: string) {
  await prisma.siteSettings.upsert({
    where: { id: 'default' },
    update: {
      siteName: 'AutoHub',
      maintenanceMode: false,
      featuredLimit: 12,
      maxImages: 20,
      defaultCurrency: 'IQD',
      contactInfo: {
        email: 'support@autohub.iq',
        phone: '+9647700000000',
        address: 'Erbil, Iraq',
      },
      socialLinks: {
        facebook: 'https://facebook.com/autohub',
        instagram: 'https://instagram.com/autohub',
      },
    },
    create: {
      id: 'default',
      siteName: 'AutoHub',
      maintenanceMode: false,
      featuredLimit: 12,
      maxImages: 20,
      defaultCurrency: 'IQD',
      contactInfo: {
        email: 'support@autohub.iq',
        phone: '+9647700000000',
        address: 'Erbil, Iraq',
      },
      socialLinks: {
        facebook: 'https://facebook.com/autohub',
        instagram: 'https://instagram.com/autohub',
      },
    },
  });

  const staff: Array<{
    key: string;
    phone: string;
    email: string;
    displayName: string;
    role: UserRole;
  }> = [
    {
      key: 'super-admin',
      phone: '+9647700090001',
      email: 'superadmin@seed.autohub.iq',
      displayName: 'Seed Super Admin',
      role: UserRole.SUPER_ADMIN,
    },
    {
      key: 'admin',
      phone: '+9647700090002',
      email: 'admin@seed.autohub.iq',
      displayName: 'Seed Admin',
      role: UserRole.ADMIN,
    },
    {
      key: 'moderator',
      phone: '+9647700090003',
      email: 'moderator@seed.autohub.iq',
      displayName: 'Seed Moderator',
      role: UserRole.MODERATOR,
    },
    {
      key: 'dealer-manager',
      phone: '+9647700090004',
      email: 'dealer.manager@seed.autohub.iq',
      displayName: 'Seed Dealer Manager',
      role: UserRole.DEALER_MANAGER,
    },
    {
      key: 'support',
      phone: '+9647700090005',
      email: 'support@seed.autohub.iq',
      displayName: 'Seed Support',
      role: UserRole.SUPPORT,
    },
  ];

  for (const row of staff) {
    await prisma.user.upsert({
      where: { firebaseUid: `seed:admin-${row.key}` },
      update: {
        phone: row.phone,
        email: row.email,
        displayName: row.displayName,
        role: row.role,
        status: UserStatus.ACTIVE,
        cityId,
      },
      create: {
        firebaseUid: `seed:admin-${row.key}`,
        phone: row.phone,
        email: row.email,
        displayName: row.displayName,
        role: row.role,
        status: UserStatus.ACTIVE,
        preferredLanguage: LanguageCode.en,
        cityId,
      },
    });
  }
}

async function seedUsersAndDealers(cityIds: string[]) {
  const users = [];
  for (let i = 1; i <= 10; i += 1) {
    const isDealer = i <= 5;
    const phone = `+96477000${String(10000 + i).slice(-5)}`;
    const user = await prisma.user.create({
      data: {
        firebaseUid: `seed:user-${String(i).padStart(2, '0')}`,
        phone,
        email: `seller${i}@seed.autohub.iq`,
        displayName: isDealer ? `Dealer Seller ${i}` : `Private Seller ${i}`,
        role: isDealer ? UserRole.DEALER : UserRole.USER,
        status: UserStatus.ACTIVE,
        preferredLanguage: LanguageCode.ar,
        cityId: cityIds[(i - 1) % cityIds.length],
        sellerProfile: {
          create: {
            type: isDealer ? SellerType.DEALER : SellerType.INDIVIDUAL,
            displayName: isDealer ? `AutoHub Motors ${i}` : `Seller ${i}`,
            bio: isDealer
              ? 'Verified dealer showroom — development seed.'
              : 'Private seller — development seed.',
          },
        },
      },
    });
    users.push(user);
  }

  const dealerNames = [
    'Erbil Prestige Motors',
    'Baghdad Auto Hub',
    'Kurdistan Drive',
    'Basra Fleet Center',
    'Nineveh Motors',
  ];

  for (let i = 0; i < 5; i += 1) {
    const owner = users[i]!;
    const org = await prisma.dealerOrganization.create({
      data: {
        name: dealerNames[i]!,
        slug: `seed-dealer-${String(i + 1).padStart(2, '0')}`,
        verified: i < 3,
        createdById: owner.id,
        updatedById: owner.id,
        members: {
          create: {
            userId: owner.id,
            role: 'OWNER',
          },
        },
      },
    });
    void org;
  }

  return users;
}

function vehiclePairs() {
  const pairs: Array<{ brandSlug: string; modelSlug: string; brand: string; model: string }> = [];
  for (const brand of BRAND_CATALOG) {
    for (const model of brand.models) {
      pairs.push({
        brandSlug: brand.slug,
        modelSlug: model.slug,
        brand: brand.nameEn,
        model: model.nameEn,
      });
    }
  }
  return pairs;
}

function descriptionFor(opts: {
  year: number;
  brand: string;
  model: string;
  city: string;
  mileage: number;
  transmission: string;
  fuel: string;
}): string {
  return [
    `${opts.year} ${opts.brand} ${opts.model} listed in ${opts.city}.`,
    `Mileage ${opts.mileage.toLocaleString()} km · ${opts.transmission} · ${opts.fuel}.`,
    'Gulf-spec vehicle in strong condition. Inspection welcome. Contact seller via AutoHub.',
    'Seed listing for local development — not a real offer.',
  ].join(' ');
}

async function attachImages(listingId: string, slug: string, createdById: string) {
  for (let i = 0; i < 5; i += 1) {
    const url = `https://picsum.photos/seed/${encodeURIComponent(`${slug}-${i}`)}/800/600`;
    await prisma.listingMedia.create({
      data: {
        listingId,
        r2Key: url,
        thumbnailKey: url,
        mediaType: MediaType.IMAGE,
        mimeType: 'image/jpeg',
        width: 800,
        height: 600,
        sortOrder: i,
        confirmed: true,
        createdById,
        updatedById: createdById,
      },
    });
  }
}

async function seedVehicleListings(ctx: {
  users: Array<{ id: string }>;
  cities: Array<{ id: string; nameEn: string; slug: string }>;
  countryId: string;
  iqdId: string;
  usdId: string;
  carCategoryId: string;
}) {
  const rng = mulberry32(20260723);
  const pairs = vehiclePairs();

  const brands = await prisma.vehicleBrand.findMany({
    where: { slug: { in: BRAND_CATALOG.map((b) => b.slug) } },
    include: { models: true },
  });
  const brandBySlug = new Map(brands.map((b) => [b.slug, b]));

  const [fuels, transmissions, drives, bodies, colors, engines, conditions] = await Promise.all([
    prisma.fuelType.findMany(),
    prisma.transmissionType.findMany(),
    prisma.driveType.findMany(),
    prisma.bodyType.findMany(),
    prisma.color.findMany(),
    prisma.engineType.findMany(),
    prisma.conditionType.findMany(),
  ]);

  let created = 0;
  for (let i = 1; i <= 100; i += 1) {
    const pair = pairs[(i - 1) % pairs.length]!;
    const brand = brandBySlug.get(pair.brandSlug);
    const model = brand?.models.find((m) => m.slug === pair.modelSlug);
    if (!brand || !model) continue;

    const city = pick(rng, ctx.cities);
    const seller = pick(rng, ctx.users);
    const year = randInt(rng, 2015, 2026);
    const mileage = randInt(rng, 5_000, 280_000);
    const fuel = pair.brand === 'Tesla' ? fuels.find((f) => f.code === 'ELECTRIC')! : pick(rng, fuels);
    const transmission =
      pair.brand === 'Tesla'
        ? transmissions.find((t) => t.code === 'AUTOMATIC')!
        : pick(rng, transmissions);
    const drive = pick(rng, drives);
    const body =
      pair.model.includes('F-150') || pair.model === 'Silverado'
        ? bodies.find((b) => b.code === 'PICKUP')!
        : pair.model.includes('Land Cruiser') ||
            pair.model.includes('LX') ||
            pair.model.includes('GX') ||
            pair.model.includes('X5') ||
            pair.model.includes('X7') ||
            pair.model.includes('GLE') ||
            pair.model.includes('Q8') ||
            pair.model.includes('Tucson') ||
            pair.model.includes('Sportage') ||
            pair.model.includes('Patrol') ||
            pair.model.includes('Model Y')
          ? bodies.find((b) => b.code === 'SUV')!
          : pick(rng, bodies);
    const color = pick(rng, colors);
    const engine =
      pair.brand === 'Tesla'
        ? engines.find((e) => e.code === 'ELECTRIC_MOTOR')!
        : pick(rng, engines);
    const condition = pick(rng, conditions);

    const usdPrice = randInt(rng, 8_000, 120_000);
    const iqdPrice = usdPrice * randInt(rng, 1300, 1500);
    const slug = `seed-car-${String(i).padStart(3, '0')}`;
    const title = `${year} ${pair.brand} ${pair.model}`;
    const description = descriptionFor({
      year,
      brand: pair.brand,
      model: pair.model,
      city: city.nameEn,
      mileage,
      transmission: transmission.nameEn,
      fuel: fuel.nameEn,
    });

    const listing = await prisma.listing.create({
      data: {
        sellerId: seller.id,
        categoryId: ctx.carCategoryId,
        categoryCode: ListingCategoryCode.CAR,
        status: ListingStatus.ACTIVE,
        countryId: ctx.countryId,
        cityId: city.id,
        conditionTypeId: condition.id,
        primaryPrice: iqdPrice,
        primaryCurrencyId: ctx.iqdId,
        secondaryPrice: usdPrice,
        secondaryCurrencyId: ctx.usdId,
        fxRateSnapshot: iqdPrice / usdPrice,
        slug,
        metaTitle: title,
        metaDescription: description.slice(0, 160),
        viewsCount: randInt(rng, 10, 2500),
        favoritesCount: randInt(rng, 0, 80),
        isFeatured: i <= 12,
        isVerified: rng() > 0.55,
        verificationStatus:
          rng() > 0.55 ? VerificationStatus.VERIFIED : VerificationStatus.UNVERIFIED,
        publishedAt: new Date(Date.now() - randInt(rng, 0, 60) * 86_400_000),
        createdById: seller.id,
        updatedById: seller.id,
        translations: {
          create: [
            {
              language: LanguageCode.ar,
              title,
              description,
              createdById: seller.id,
              updatedById: seller.id,
            },
            {
              language: LanguageCode.en,
              title,
              description,
              createdById: seller.id,
              updatedById: seller.id,
            },
          ],
        },
        carDetails: {
          create: {
            brandId: brand.id,
            modelId: model.id,
            year,
            mileageKm: mileage,
            fuelTypeId: fuel.id,
            transmissionTypeId: transmission.id,
            driveTypeId: drive.id,
            bodyTypeId: body.id,
            colorId: color.id,
            engineTypeId: engine.id,
            engineSizeCc:
              pair.brand === 'Tesla' ? null : randInt(rng, 1600, 5700),
            doors: body.code === 'PICKUP' || body.code === 'SUV' ? 4 : pick(rng, [2, 4]),
          },
        },
      },
    });

    await attachImages(listing.id, slug, seller.id);
    created += 1;
  }

  return created;
}

async function seedPlateListings(ctx: {
  users: Array<{ id: string }>;
  cities: Array<{ id: string; nameEn: string; slug: string }>;
  countryId: string;
  iqdId: string;
  usdId: string;
  plateCategoryId: string;
}) {
  const rng = mulberry32(20260724);
  const cityBySlug = new Map(ctx.cities.map((c) => [c.slug, c]));

  const formatCity: Record<string, string> = {
    IQ_ERBIL: 'erbil',
    IQ_BAGHDAD: 'baghdad',
    IQ_DUHOK: 'duhok',
    IQ_SULAYMANIYAH: 'sulaymaniyah',
    IQ_BASRA: 'basra',
    IQ_MOSUL: 'mosul',
    IQ_KIRKUK: 'kirkuk',
  };

  // Extra region codes from the requested examples (21, 18) plus format defaults.
  const regionPool = ['22', '21', '18', '11', '27', '25', '14', '15', '16'];

  const seen = new Set<string>();
  const plates: Array<{
    formatCode: string;
    regionCode: string;
    letter: string;
    number: string;
    display: string;
    normalized: string;
    type: (typeof PLATE_TYPES)[number];
  }> = [];

  // Guarantee the documented examples first.
  const examples = [
    { formatCode: 'IQ_ERBIL', regionCode: '22', letter: 'X', number: '99099', type: 'Private' as const },
    { formatCode: 'IQ_ERBIL', regionCode: '21', letter: 'A', number: '12345', type: 'Private' as const },
    { formatCode: 'IQ_BAGHDAD', regionCode: '18', letter: 'K', number: '56789', type: 'Commercial' as const },
    { formatCode: 'IQ_BAGHDAD', regionCode: '11', letter: 'B', number: '22222', type: 'Taxi' as const },
  ];

  for (const ex of examples) {
    const display = `${ex.regionCode} ${ex.letter} ${ex.number}`;
    const normalized = display.replace(/\s+/g, '').toUpperCase();
    seen.add(normalized);
    plates.push({ ...ex, display, normalized });
  }

  let guard = 0;
  while (plates.length < 200 && guard < 20_000) {
    guard += 1;
    const format = pick(rng, PLATE_FORMATS);
    const regionCode = rng() > 0.7 ? pick(rng, regionPool) : format.regionCode;
    const letter = pick(rng, LETTERS);
    const number = String(randInt(rng, 10000, 99999));
    const display = `${regionCode} ${letter} ${number}`;
    const normalized = display.replace(/\s+/g, '').toUpperCase();
    if (seen.has(normalized)) continue;
    seen.add(normalized);
    plates.push({
      formatCode: format.code,
      regionCode,
      letter,
      number,
      display,
      normalized,
      type: pick(rng, PLATE_TYPES),
    });
  }

  let created = 0;
  for (let i = 0; i < plates.length; i += 1) {
    const plate = plates[i]!;
    const citySlug = formatCity[plate.formatCode] ?? 'baghdad';
    const city = cityBySlug.get(citySlug) ?? ctx.cities[0]!;
    const seller = pick(rng, ctx.users);
    const slug = `seed-plate-${String(i + 1).padStart(3, '0')}`;
    const title = `Iraqi plate ${plate.display}`;
    const description = [
      `License plate ${plate.display} (${plate.type}) available in ${city.nameEn}.`,
      `Format ${plate.formatCode}. Transfer support available.`,
      'Seed listing for local development — not a real offer.',
    ].join(' ');

    const usdPrice = randInt(rng, 500, 25_000);
    const iqdPrice = usdPrice * randInt(rng, 1300, 1500);

    const listing = await prisma.listing.create({
      data: {
        sellerId: seller.id,
        categoryId: ctx.plateCategoryId,
        categoryCode: ListingCategoryCode.PLATE,
        status: ListingStatus.ACTIVE,
        countryId: ctx.countryId,
        cityId: city.id,
        primaryPrice: iqdPrice,
        primaryCurrencyId: ctx.iqdId,
        secondaryPrice: usdPrice,
        secondaryCurrencyId: ctx.usdId,
        fxRateSnapshot: iqdPrice / usdPrice,
        slug,
        metaTitle: title,
        metaDescription: description.slice(0, 160),
        viewsCount: randInt(rng, 5, 900),
        favoritesCount: randInt(rng, 0, 40),
        isFeatured: i < 8,
        isVerified: rng() > 0.6,
        verificationStatus:
          rng() > 0.6 ? VerificationStatus.VERIFIED : VerificationStatus.UNVERIFIED,
        publishedAt: new Date(Date.now() - randInt(rng, 0, 45) * 86_400_000),
        createdById: seller.id,
        updatedById: seller.id,
        translations: {
          create: [
            {
              language: LanguageCode.ar,
              title,
              description,
              createdById: seller.id,
              updatedById: seller.id,
            },
            {
              language: LanguageCode.en,
              title,
              description,
              createdById: seller.id,
              updatedById: seller.id,
            },
          ],
        },
        plateDetails: {
          create: {
            formatCode: plate.formatCode,
            plateDisplay: plate.display,
            plateNormalized: plate.normalized,
            series: plate.letter,
            number: plate.number,
            regionCode: plate.regionCode,
            plateType: plate.type,
          },
        },
      },
    });

    await attachImages(listing.id, slug, seller.id);
    created += 1;
  }

  return created;
}

async function main() {
  console.log('Seeding AutoHub development database…');

  const { iqd, usd, country } = await seedCatalog();
  await clearSeedDemoData();

  const cities = await prisma.city.findMany({
    where: { slug: { in: [...LAUNCH_CITY_SLUGS] } },
    select: { id: true, nameEn: true, slug: true },
  });
  if (cities.length < LAUNCH_CITY_SLUGS.length) {
    throw new Error(
      `Expected ${LAUNCH_CITY_SLUGS.length} launch cities, found ${cities.length}`,
    );
  }

  await seedAdminPlatform(cities[0]!.id);
  const users = await seedUsersAndDealers(cities.map((c) => c.id));

  const carCategory = await prisma.category.findUniqueOrThrow({
    where: { code: ListingCategoryCode.CAR },
  });
  const plateCategory = await prisma.category.findUniqueOrThrow({
    where: { code: ListingCategoryCode.PLATE },
  });

  const vehicles = await seedVehicleListings({
    users,
    cities,
    countryId: country.id,
    iqdId: iqd.id,
    usdId: usd.id,
    carCategoryId: carCategory.id,
  });

  const plates = await seedPlateListings({
    users,
    cities,
    countryId: country.id,
    iqdId: iqd.id,
    usdId: usd.id,
    plateCategoryId: plateCategory.id,
  });

  const summary = {
    users: await prisma.user.count({ where: { firebaseUid: { startsWith: 'seed:' } } }),
    staff: await prisma.user.count({
      where: { firebaseUid: { startsWith: 'seed:admin-' } },
    }),
    dealers: await prisma.dealerOrganization.count({
      where: { slug: { startsWith: 'seed-dealer-' } },
    }),
    vehicleListings: vehicles,
    plateListings: plates,
    activeListings: await prisma.listing.count({
      where: { status: ListingStatus.ACTIVE, deletedAt: null },
    }),
    media: await prisma.listingMedia.count({
      where: { listing: { slug: { startsWith: 'seed-' } } },
    }),
    brands: await prisma.vehicleBrand.count({
      where: { slug: { in: BRAND_CATALOG.map((b) => b.slug) } },
    }),
    cities: cities.length,
    siteSettings: await prisma.siteSettings.findUnique({ where: { id: 'default' } }),
  };

  console.log('Development seed complete:', summary);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
