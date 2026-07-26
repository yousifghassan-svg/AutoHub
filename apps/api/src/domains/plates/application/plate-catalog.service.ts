import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PlateVerificationStatus } from '@autohub/database';
import type { AuthenticatedUser } from '../../auth/domain/auth.types';
import { canVerifyPlate } from '../domain/plate.policies';
import { PlateRepository } from '../infrastructure/plate.repository';

export type VerifyPlateInput = {
  status: PlateVerificationStatus;
  note?: string;
};

@Injectable()
export class PlateCatalogService {
  constructor(private readonly plates: PlateRepository) {}

  listCategories() {
    return this.plates.listActiveCategories();
  }

  listPrefixes(formatCode?: string) {
    return this.plates.listActivePrefixes(formatCode);
  }

  listProvinces() {
    return this.plates.listProvinces();
  }

  listAllCategories(includeInactive = false) {
    return this.plates.listAllCategories(includeInactive);
  }

  listAllPrefixes(formatCode?: string, includeInactive = false) {
    return this.plates.listAllPrefixes(formatCode, includeInactive);
  }

  listVerifications(params: { listingId?: string; page?: number; pageSize?: number }) {
    return this.plates.listVerifications(params);
  }

  async createCategory(data: {
    code: string;
    nameEn: string;
    nameAr?: string;
    sortOrder?: number;
    active?: boolean;
  }) {
    return this.plates.createCategory({
      code: data.code.trim().toUpperCase(),
      nameEn: data.nameEn.trim(),
      nameAr: data.nameAr?.trim(),
      sortOrder: data.sortOrder ?? 0,
      active: data.active ?? true,
    });
  }

  async updateCategory(
    id: string,
    data: Partial<{
      code: string;
      nameEn: string;
      nameAr: string;
      sortOrder: number;
      active: boolean;
    }>,
  ) {
    const existing = await this.plates.findCategoryById(id);
    if (!existing) throw new NotFoundException('Plate category not found');

    return this.plates.updateCategory(id, {
      code: data.code?.trim().toUpperCase(),
      nameEn: data.nameEn?.trim(),
      nameAr: data.nameAr?.trim(),
      sortOrder: data.sortOrder,
      active: data.active,
    });
  }

  async removeCategory(id: string) {
    const existing = await this.plates.findCategoryById(id);
    if (!existing) throw new NotFoundException('Plate category not found');
    return this.plates.softDeleteCategory(id);
  }

  async createPrefix(data: {
    formatCode: string;
    letter: string;
    label?: string;
    active?: boolean;
  }) {
    return this.plates.createPrefix({
      formatCode: data.formatCode.trim(),
      letter: data.letter.trim().toUpperCase(),
      label: data.label?.trim(),
      active: data.active ?? true,
    });
  }

  async updatePrefix(
    id: string,
    data: Partial<{
      formatCode: string;
      letter: string;
      label: string;
      active: boolean;
    }>,
  ) {
    const existing = await this.plates.findPrefixById(id);
    if (!existing) throw new NotFoundException('Plate prefix not found');

    return this.plates.updatePrefix(id, {
      formatCode: data.formatCode?.trim(),
      letter: data.letter?.trim().toUpperCase(),
      label: data.label?.trim(),
      active: data.active,
    });
  }

  async removePrefix(id: string) {
    const existing = await this.plates.findPrefixById(id);
    if (!existing) throw new NotFoundException('Plate prefix not found');
    return this.plates.softDeletePrefix(id);
  }

  async verifyPlate(
    listingId: string,
    input: VerifyPlateInput,
    actor: AuthenticatedUser,
  ) {
    if (!canVerifyPlate(actor.role, actor.permissions)) {
      throw new BadRequestException('Insufficient permissions to verify plates');
    }

    const listing = await this.plates.findById(listingId);
    if (!listing) throw new NotFoundException('Plate listing not found');

    return this.plates.recordVerification({
      listingId,
      status: input.status,
      note: input.note?.trim(),
      actorId: actor.id,
    });
  }
}
