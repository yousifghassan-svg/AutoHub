import { Injectable } from '@nestjs/common';
import { ListingMedia, MediaType, Prisma } from '@autohub/database';
import { PrismaService } from '../../../infrastructure/database/prisma.service';

const mediaInclude = {
  mediaAsset: {
    include: {
      variants: { where: { deletedAt: null } },
    },
  },
} satisfies Prisma.ListingMediaInclude;

export type ListingMediaWithAsset = Prisma.ListingMediaGetPayload<{
  include: typeof mediaInclude;
}>;

@Injectable()
export class ListingMediaRepository {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string): Promise<ListingMedia | null> {
    return this.prisma.listingMedia.findFirst({
      where: { id, deletedAt: null },
    });
  }

  findByIdWithAsset(id: string): Promise<ListingMediaWithAsset | null> {
    return this.prisma.listingMedia.findFirst({
      where: { id, deletedAt: null },
      include: mediaInclude,
    });
  }

  listForListing(listingId: string): Promise<ListingMediaWithAsset[]> {
    return this.prisma.listingMedia.findMany({
      where: { listingId, deletedAt: null },
      orderBy: { sortOrder: 'asc' },
      include: mediaInclude,
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

  create(data: Prisma.ListingMediaCreateInput): Promise<ListingMediaWithAsset> {
    return this.prisma.listingMedia.create({ data, include: mediaInclude });
  }

  update(
    id: string,
    data: Prisma.ListingMediaUpdateInput,
  ): Promise<ListingMediaWithAsset> {
    return this.prisma.listingMedia.update({
      where: { id },
      data,
      include: mediaInclude,
    });
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

  /** Rewrite sortOrder so orderedIds become 0..n-1; other active rows keep relative order after. */
  async reorder(
    listingId: string,
    orderedIds: string[],
    updatedById: string,
  ): Promise<ListingMediaWithAsset[]> {
    const existing = await this.listForListing(listingId);
    const byId = new Map(existing.map((m) => [m.id, m]));
    for (const id of orderedIds) {
      if (!byId.has(id)) {
        throw new Error(`Media ${id} not found on listing`);
      }
    }

    const remaining = existing.filter((m) => !orderedIds.includes(m.id));
    const finalOrder = [
      ...orderedIds.map((id) => byId.get(id)!),
      ...remaining,
    ];

    await this.prisma.$transaction(
      finalOrder.map((item, index) =>
        this.prisma.listingMedia.update({
          where: { id: item.id },
          data: {
            sortOrder: index,
            updatedBy: { connect: { id: updatedById } },
          },
        }),
      ),
    );

    return this.listForListing(listingId);
  }

  /** Set media as primary (sortOrder 0) and shift others up. */
  async setPrimary(
    listingId: string,
    mediaId: string,
    updatedById: string,
  ): Promise<ListingMediaWithAsset[]> {
    const existing = await this.listForListing(listingId);
    const target = existing.find((m) => m.id === mediaId);
    if (!target) {
      throw new Error(`Media ${mediaId} not found on listing`);
    }

    const rest = existing.filter((m) => m.id !== mediaId);
    const finalOrder = [target, ...rest];

    await this.prisma.$transaction(
      finalOrder.map((item, index) =>
        this.prisma.listingMedia.update({
          where: { id: item.id },
          data: {
            sortOrder: index,
            updatedBy: { connect: { id: updatedById } },
          },
        }),
      ),
    );

    return this.listForListing(listingId);
  }
}
