import { Injectable } from '@nestjs/common';
import { ListingMedia, MediaType, Prisma } from '@autohub/database';
import { PrismaService } from '../../../infrastructure/database/prisma.service';

@Injectable()
export class ListingMediaRepository {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string): Promise<ListingMedia | null> {
    return this.prisma.listingMedia.findFirst({
      where: { id, deletedAt: null },
    });
  }

  listForListing(listingId: string): Promise<ListingMedia[]> {
    return this.prisma.listingMedia.findMany({
      where: { listingId, deletedAt: null },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async nextSortOrder(listingId: string): Promise<number> {
    const last = await this.prisma.listingMedia.findFirst({
      where: { listingId, deletedAt: null },
      orderBy: { sortOrder: 'desc' },
      select: { sortOrder: true },
    });
    return (last?.sortOrder ?? -1) + 1;
  }

  create(data: Prisma.ListingMediaCreateInput): Promise<ListingMedia> {
    return this.prisma.listingMedia.create({ data });
  }

  softDelete(id: string, updatedById: string): Promise<ListingMedia> {
    return this.prisma.listingMedia.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        updatedBy: { connect: { id: updatedById } },
      },
    });
  }

  countActive(listingId: string, mediaType?: MediaType): Promise<number> {
    return this.prisma.listingMedia.count({
      where: {
        listingId,
        deletedAt: null,
        ...(mediaType ? { mediaType } : {}),
      },
    });
  }
}
