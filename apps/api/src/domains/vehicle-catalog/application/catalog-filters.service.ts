import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/database/prisma.service';

@Injectable()
export class CatalogFiltersService {
  constructor(private readonly prisma: PrismaService) {}

  async getFilters() {
    const [
      brands,
      models,
      fuelTypes,
      transmissionTypes,
      colors,
      governorates,
      cities,
      bodyTypes,
      driveTypes,
      engineTypes,
      conditionTypes,
      categories,
    ] = await Promise.all([
      this.prisma.vehicleBrand.findMany({
        where: { active: true, deletedAt: null },
        select: { id: true, nameEn: true, nameAr: true, slug: true },
        orderBy: [{ sortOrder: 'asc' }, { nameEn: 'asc' }],
      }),
      this.prisma.vehicleModel.findMany({
        where: { active: true, deletedAt: null },
        select: { id: true, brandId: true, nameEn: true, nameAr: true, slug: true },
        orderBy: { nameEn: 'asc' },
      }),
      this.prisma.fuelType.findMany({
        where: { active: true, deletedAt: null },
        select: { id: true, code: true, nameEn: true, nameAr: true },
        orderBy: [{ sortOrder: 'asc' }, { nameEn: 'asc' }],
      }),
      this.prisma.transmissionType.findMany({
        where: { active: true, deletedAt: null },
        select: { id: true, code: true, nameEn: true, nameAr: true },
        orderBy: [{ sortOrder: 'asc' }, { nameEn: 'asc' }],
      }),
      this.prisma.color.findMany({
        where: { active: true, deletedAt: null },
        select: { id: true, code: true, nameEn: true, nameAr: true, hex: true },
        orderBy: [{ sortOrder: 'asc' }, { nameEn: 'asc' }],
      }),
      this.prisma.governorate.findMany({
        where: { active: true, deletedAt: null },
        select: { id: true, code: true, nameEn: true, nameAr: true },
        orderBy: [{ sortOrder: 'asc' }, { nameEn: 'asc' }],
      }),
      this.prisma.city.findMany({
        where: { active: true, deletedAt: null },
        select: {
          id: true,
          nameEn: true,
          nameAr: true,
          governorateId: true,
          slug: true,
        },
        orderBy: [{ nameEn: 'asc' }],
      }),
      this.prisma.bodyType.findMany({
        where: { active: true, deletedAt: null },
        select: { id: true, code: true, nameEn: true, nameAr: true },
        orderBy: [{ sortOrder: 'asc' }, { nameEn: 'asc' }],
      }),
      this.prisma.driveType.findMany({
        where: { active: true, deletedAt: null },
        select: { id: true, code: true, nameEn: true, nameAr: true },
        orderBy: [{ sortOrder: 'asc' }, { nameEn: 'asc' }],
      }),
      this.prisma.engineType.findMany({
        where: { active: true, deletedAt: null },
        select: { id: true, code: true, nameEn: true, nameAr: true },
        orderBy: [{ sortOrder: 'asc' }, { nameEn: 'asc' }],
      }),
      this.prisma.conditionType.findMany({
        where: { active: true, deletedAt: null },
        select: { id: true, code: true, nameEn: true, nameAr: true },
        orderBy: [{ sortOrder: 'asc' }, { nameEn: 'asc' }],
      }),
      this.prisma.category.findMany({
        where: { active: true, deletedAt: null },
        select: { id: true, code: true, slug: true, nameEn: true, nameAr: true },
        orderBy: [{ sortOrder: 'asc' }, { nameEn: 'asc' }],
      }),
    ]);

    return {
      brands,
      models,
      fuelTypes,
      transmissionTypes,
      colors,
      governorates,
      cities,
      bodyTypes,
      driveTypes,
      engineTypes,
      conditionTypes,
      categories,
    };
  }
}
