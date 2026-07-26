'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { adminApi } from '@/lib/api/admin.repository';
import { listingTitle, type AdminListing } from '@/lib/api/types';
import { config } from '@/lib/config';
import {
  Badge,
  Button,
  Card,
  ErrorState,
  PageHeader,
  Skeleton,
  formatDate,
  formatPrice,
  statusBadgeTone,
  useConfirm,
  useToast,
} from '@/components/ui';

export default function VehicleDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const confirm = useConfirm();
  const { toast } = useToast();

  const query = useQuery({
    queryKey: ['admin', 'vehicles', params.id],
    queryFn: () => adminApi.vehicles.get(params.id, true),
  });

  const audit = useQuery({
    queryKey: ['admin', 'audit', params.id],
    queryFn: () =>
      adminApi.auditLogs.list({
        page: 1,
        pageSize: 20,
        module: 'listings',
        entityId: params.id,
      }),
  });

  const reports = useQuery({
    queryKey: ['admin', 'reports', 'vehicle', params.id],
    queryFn: () => adminApi.reports.list({ page: 1, pageSize: 20 }),
    select: (data) => ({
      ...data,
      items: data.items.filter((r) => r.listingId === params.id),
    }),
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['admin', 'vehicles'] });
    void query.refetch();
    void audit.refetch();
  };

  const run = async (
    label: string,
    fn: () => Promise<unknown>,
    options?: { danger?: boolean; redirect?: string | ((result: unknown) => string) },
  ) => {
    const ok = await confirm({
      title: label,
      description: 'Confirm this admin action.',
      variant: options?.danger ? 'danger' : 'primary',
      confirmLabel: 'Confirm',
    });
    if (!ok) return;
    try {
      const result = await fn();
      toast(`${label} succeeded`, 'success');
      if (options?.redirect) {
        const path =
          typeof options.redirect === 'function' ? options.redirect(result) : options.redirect;
        router.push(path);
      } else {
        invalidate();
      }
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Action failed', 'error');
    }
  };

  if (query.isLoading) return <Skeleton className="h-96" />;
  if (query.isError || !query.data) {
    return (
      <ErrorState
        message={query.error instanceof Error ? query.error.message : 'Vehicle not found'}
      />
    );
  }

  const listing = query.data;
  const car = listing.carDetails;
  const media = listing.media ?? [];

  const specs: Array<[string, string]> = [
    ['Brand', car?.brand?.nameEn ?? '—'],
    ['Model', car?.model?.nameEn ?? '—'],
    ['Trim', car?.trim ?? '—'],
    ['Year', car?.year != null ? String(car.year) : '—'],
    ['Mileage', car?.mileageKm != null ? `${car.mileageKm.toLocaleString()} km` : '—'],
    ['VIN', car?.vin ?? '—'],
    ['Fuel', car?.fuelType?.nameEn ?? '—'],
    ['Transmission', car?.transmissionType?.nameEn ?? '—'],
    ['Engine cc', car?.engineSizeCc != null ? String(car.engineSizeCc) : '—'],
    ['Doors', car?.doors != null ? String(car.doors) : '—'],
    ['Seats', car?.seats != null ? String(car.seats) : '—'],
    ['Interior', car?.interiorColor ?? '—'],
    ['Location', listing.locationText || listing.city?.nameEn || '—'],
    [
      'Coordinates',
      listing.latitude != null && listing.longitude != null
        ? `${listing.latitude}, ${listing.longitude}`
        : '—',
    ],
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={listingTitle(listing)}
        description={`Slug ${listing.slug}`}
        action={
          <div className="flex flex-wrap gap-2">
            <Link href={`/vehicles/${listing.id}/edit`}>
              <Button>Edit</Button>
            </Link>
            <Link href="/vehicles">
              <Button variant="secondary">Back</Button>
            </Link>
          </div>
        }
      />

      <div className="flex flex-wrap gap-2">
        <Badge tone={statusBadgeTone(listing.status)}>{listing.status}</Badge>
        {listing.isFeatured ? <Badge tone="brand">Featured</Badge> : null}
        {listing.isVerified ? <Badge tone="success">Verified</Badge> : null}
        {listing.deletedAt ? <Badge tone="error">Soft-deleted</Badge> : null}
        <Badge>{listing.categoryCode ?? listing.category?.code ?? '—'}</Badge>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <Card className="p-4">
            <h2 className="mb-3 font-display text-lg font-semibold text-ink">Gallery</h2>
            {media.length ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {media.map((m) => (
                  <div key={m.id} className="overflow-hidden rounded-lg bg-surface-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={
                        m.thumbnailKey?.startsWith('http')
                          ? m.thumbnailKey
                          : m.r2Key.startsWith('http')
                            ? m.r2Key
                            : `https://picsum.photos/seed/${m.id}/640/480`
                      }
                      alt={m.mediaType}
                      className="aspect-[4/3] w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-ink-secondary">No media attached.</p>
            )}
          </Card>

          <Card className="p-4">
            <h2 className="mb-3 font-display text-lg font-semibold text-ink">Description</h2>
            <p className="whitespace-pre-wrap text-sm text-ink">
              {listing.description ?? listing.translations?.[0]?.description ?? '—'}
            </p>
          </Card>

          <Card className="p-4">
            <h2 className="mb-3 font-display text-lg font-semibold text-ink">Specifications</h2>
            <dl className="grid gap-3 sm:grid-cols-2">
              {specs.map(([label, value]) => (
                <div key={label} className="rounded-lg bg-surface-muted px-3 py-2 text-sm">
                  <dt className="text-ink-secondary">{label}</dt>
                  <dd className="font-semibold text-ink">{value}</dd>
                </div>
              ))}
            </dl>
          </Card>

          <Card className="p-4">
            <h2 className="mb-3 font-display text-lg font-semibold text-ink">Audit history</h2>
            {audit.isLoading ? (
              <Skeleton className="h-24" />
            ) : (audit.data?.items.length ?? 0) === 0 ? (
              <p className="text-sm text-ink-secondary">No audit events for this vehicle yet.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {audit.data!.items.map((row) => (
                  <li
                    key={row.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border px-3 py-2"
                  >
                    <span className="font-medium text-ink">{row.action}</span>
                    <span className="text-ink-secondary">{formatDate(row.createdAt)}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="space-y-3 p-4">
            <h2 className="font-display text-lg font-semibold text-ink">Listing stats</h2>
            <p className="text-2xl font-bold text-brand">
              {formatPrice(
                listing.primaryPrice,
                listing.primaryCurrency?.code ?? listing.currencyCode ?? 'IQD',
              )}
            </p>
            <p className="text-sm text-ink-secondary">
              Views {listing.viewsCount ?? 0} · Favorites {listing.favoritesCount ?? 0}
            </p>
            <p className="text-sm text-ink-secondary">Created {formatDate(listing.createdAt)}</p>
            <p className="text-sm text-ink-secondary">Updated {formatDate(listing.updatedAt)}</p>
          </Card>

          <Card className="space-y-3 p-4">
            <h2 className="font-display text-lg font-semibold text-ink">Dealer / seller</h2>
            <p className="font-medium text-ink">
              {listing.seller?.displayName ?? listing.seller?.phone ?? '—'}
            </p>
            <p className="text-sm text-ink-secondary">{listing.seller?.email ?? 'No email'}</p>
            <p className="text-sm text-ink-secondary">Role {listing.seller?.role ?? '—'}</p>
            {listing.seller?.id ? (
              <Link
                href={`/users?q=${listing.seller.id}`}
                className="text-sm font-semibold text-brand hover:underline"
              >
                Open user
              </Link>
            ) : null}
          </Card>

          <Card className="space-y-3 p-4">
            <h2 className="font-display text-lg font-semibold text-ink">Reports</h2>
            {(reports.data?.items.length ?? 0) === 0 ? (
              <p className="text-sm text-ink-secondary">No reports for this vehicle.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {reports.data!.items.map((r) => (
                  <li key={r.id} className="rounded-lg border border-border px-3 py-2">
                    <Badge tone={statusBadgeTone(r.status)}>{r.status}</Badge>
                    <p className="mt-1 font-medium text-ink">{r.reason}</p>
                    <p className="text-ink-secondary">{r.details || 'No details'}</p>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card className="space-y-2 p-4">
            <h2 className="mb-2 font-display text-lg font-semibold text-ink">Quick actions</h2>
            <div className="grid gap-2">
              <Button
                variant="secondary"
                onClick={() => void run('Publish', () => adminApi.vehicles.publish(listing.id))}
              >
                Publish
              </Button>
              <Button
                variant="secondary"
                onClick={() => void run('Unpublish', () => adminApi.vehicles.unpublish(listing.id))}
              >
                Unpublish
              </Button>
              <Button
                variant="secondary"
                onClick={() => void run('Reject', () => adminApi.vehicles.reject(listing.id))}
              >
                Reject
              </Button>
              <Button
                variant="secondary"
                onClick={() =>
                  void run('Duplicate', () => adminApi.vehicles.duplicate(listing.id), {
                    redirect: (result) => `/vehicles/${(result as AdminListing).id}`,
                  })
                }
              >
                Duplicate
              </Button>
              <Button
                variant="secondary"
                onClick={() =>
                  window.open(`${config.webUrl}/vehicles/${listing.id}`, '_blank', 'noopener,noreferrer')
                }
              >
                Preview on web
              </Button>
              <Button
                variant="secondary"
                onClick={() => void run('Approve', () => adminApi.vehicles.approve(listing.id))}
              >
                Approve / activate
              </Button>
              <Button
                variant="secondary"
                onClick={() => void run('Archive', () => adminApi.vehicles.archive(listing.id))}
              >
                Archive / deactivate
              </Button>
              <Button
                variant="secondary"
                onClick={() =>
                  void run(
                    listing.isFeatured ? 'Unfeature' : 'Feature',
                    () =>
                      listing.isFeatured
                        ? adminApi.vehicles.unfeature(listing.id)
                        : adminApi.vehicles.feature(listing.id),
                  )
                }
              >
                {listing.isFeatured ? 'Unfeature' : 'Feature'}
              </Button>
              {listing.deletedAt ? (
                <Button
                  variant="secondary"
                  onClick={() => void run('Restore', () => adminApi.vehicles.restore(listing.id))}
                >
                  Restore
                </Button>
              ) : (
                <Button
                  variant="danger"
                  onClick={() =>
                    void run('Soft delete', () => adminApi.vehicles.delete(listing.id), {
                      danger: true,
                    })
                  }
                >
                  Soft delete
                </Button>
              )}
              <Button
                variant="danger"
                onClick={() =>
                  void run(
                    'Permanent delete',
                    () => adminApi.vehicles.permanentDelete(listing.id, true),
                    { danger: true, redirect: '/vehicles' },
                  )
                }
              >
                Permanent delete
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
