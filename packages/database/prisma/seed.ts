import { ListingCategoryCode, PlateValidationStrictness, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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

async function main() {
  const iqd = await prisma.currency.upsert({
    where: { code: 'IQD' },
    update: { nameEn: 'Iraqi Dinar', nameAr: 'دينار عراقي', nameKu: 'دیناری عێراقی', symbol: 'د.ع', decimalPlaces: 0 },
    create: {
      code: 'IQD',
      nameEn: 'Iraqi Dinar',
      nameAr: 'دينار عراقي',
      nameKu: 'دیناری عێراقی',
      symbol: 'د.ع',
      decimalPlaces: 0,
    },
  });

  await prisma.currency.upsert({
    where: { code: 'USD' },
    update: { nameEn: 'US Dollar', nameAr: 'دولار أمريكي', nameKu: 'دۆلاری ئەمریکی', symbol: '$', decimalPlaces: 2 },
    create: {
      code: 'USD',
      nameEn: 'US Dollar',
      nameAr: 'دولار أمريكي',
      nameKu: 'دۆلاری ئەمریکی',
      symbol: '$',
      decimalPlaces: 2,
    },
  });

  const categories = [
    { code: ListingCategoryCode.CAR, slug: 'cars', nameEn: 'Cars', nameAr: 'سيارات', nameKu: 'ئۆتۆمبێل', sortOrder: 1 },
    { code: ListingCategoryCode.PLATE, slug: 'plates', nameEn: 'Plate Numbers', nameAr: 'لوحات أرقام', nameKu: 'ژمارەی پلێت', sortOrder: 2 },
    { code: ListingCategoryCode.MOTORCYCLE, slug: 'motorcycles', nameEn: 'Motorcycles', nameAr: 'دراجات نارية', nameKu: 'ماتۆڕ', sortOrder: 3 },
    { code: ListingCategoryCode.TRUCK, slug: 'trucks', nameEn: 'Trucks', nameAr: 'شاحنات', nameKu: 'بارهەڵگر', sortOrder: 4 },
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
    { code: 'ELECTRIC_MOTOR', nameEn: 'Electric Motor', nameAr: 'محرك كهربائي', nameKu: 'مۆتۆری کارەبایی' },
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
        nameEn: gov.nameEn,
        nameAr: gov.nameAr,
        nameKu: 'nameKu' in gov ? gov.nameKu : undefined,
        isLaunchCity: gov.city.launch,
      },
      create: {
        governorateId: governorate.id,
        slug: gov.city.slug,
        nameEn: gov.nameEn,
        nameAr: gov.nameAr,
        nameKu: 'nameKu' in gov ? gov.nameKu : undefined,
        isLaunchCity: gov.city.launch,
      },
    });
  }

  const erbil = await prisma.governorate.findFirst({ where: { countryId: country.id, code: 'EBL' } });
  await prisma.plateFormat.upsert({
    where: { code: 'IQ_ERBIL' },
    update: { strictness: PlateValidationStrictness.STRICT, governorateId: erbil?.id },
    create: {
      code: 'IQ_ERBIL',
      governorateId: erbil?.id,
      nameEn: 'Erbil Plate',
      nameAr: 'لوحة أربيل',
      nameKu: 'ژمارەی هەولێر',
      mask: 'A 12345',
      regex: '^[A-Zء-ي]{1,3}[\\s-]?\\d{4,6}$',
      example: 'A 12345',
      strictness: PlateValidationStrictness.STRICT,
    },
  });

  const brands = [
    {
      slug: 'toyota',
      nameEn: 'Toyota',
      nameAr: 'تويوتا',
      models: [
        { slug: 'camry', nameEn: 'Camry', nameAr: 'كامري' },
        { slug: 'corolla', nameEn: 'Corolla', nameAr: 'كورولا' },
        { slug: 'land-cruiser', nameEn: 'Land Cruiser', nameAr: 'لاندكروزر' },
      ],
    },
    {
      slug: 'hyundai',
      nameEn: 'Hyundai',
      nameAr: 'هيونداي',
      models: [
        { slug: 'elantra', nameEn: 'Elantra', nameAr: 'النترا' },
        { slug: 'tucson', nameEn: 'Tucson', nameAr: 'توسان' },
      ],
    },
    {
      slug: 'kia',
      nameEn: 'Kia',
      nameAr: 'كيا',
      models: [
        { slug: 'cerato', nameEn: 'Cerato', nameAr: 'سيراتو' },
        { slug: 'sportage', nameEn: 'Sportage', nameAr: 'سبورتاج' },
      ],
    },
    {
      slug: 'nissan',
      nameEn: 'Nissan',
      nameAr: 'نيسان',
      models: [
        { slug: 'sunny', nameEn: 'Sunny', nameAr: 'صني' },
        { slug: 'patrol', nameEn: 'Patrol', nameAr: 'باترول' },
      ],
    },
    {
      slug: 'mercedes-benz',
      nameEn: 'Mercedes-Benz',
      nameAr: 'مرسيدس بنز',
      models: [
        { slug: 'c-class', nameEn: 'C-Class', nameAr: 'سي كلاس' },
        { slug: 'e-class', nameEn: 'E-Class', nameAr: 'اي كلاس' },
      ],
    },
    {
      slug: 'bmw',
      nameEn: 'BMW',
      nameAr: 'بي إم دبليو',
      models: [
        { slug: '3-series', nameEn: '3 Series', nameAr: 'الفئة الثالثة' },
        { slug: 'x5', nameEn: 'X5', nameAr: 'إكس 5' },
      ],
    },
  ];

  let brandSort = 0;
  for (const brand of brands) {
    const vehicleBrand = await prisma.vehicleBrand.upsert({
      where: { slug: brand.slug },
      update: {
        nameEn: brand.nameEn,
        nameAr: brand.nameAr,
        category: ListingCategoryCode.CAR,
        sortOrder: brandSort,
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
        update: { nameEn: model.nameEn, nameAr: model.nameAr },
        create: {
          brandId: vehicleBrand.id,
          slug: model.slug,
          nameEn: model.nameEn,
          nameAr: model.nameAr,
        },
      });
    }
  }

  await prisma.vehicleBrand.upsert({
    where: { slug: 'honda-moto' },
    update: {},
    create: {
      slug: 'honda-moto',
      nameEn: 'Honda',
      nameAr: 'هوندا',
      category: ListingCategoryCode.MOTORCYCLE,
    },
  });

  await prisma.vehicleBrand.upsert({
    where: { slug: 'isuzu' },
    update: {},
    create: {
      slug: 'isuzu',
      nameEn: 'Isuzu',
      nameAr: 'إيسوزو',
      category: ListingCategoryCode.TRUCK,
    },
  });

  const counts = {
    currencies: await prisma.currency.count(),
    categories: await prisma.category.count(),
    governorates: await prisma.governorate.count(),
    brands: await prisma.vehicleBrand.count(),
    fuelTypes: await prisma.fuelType.count(),
    bodyTypes: await prisma.bodyType.count(),
  };

  console.log('Revised seed complete:', counts);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
