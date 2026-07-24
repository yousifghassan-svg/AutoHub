'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { LicensePlate } from '@/features/plates/components/LicensePlate';
import {
  GOVERNORATES,
  formatCodeFor,
  governorateFromFormatCode,
} from '@/features/plates/domain/governorates';
import {
  IRAQI_GOVERNORATES,
  PLATE_TYPES,
  isIraqiGovernorate,
  isPlateType,
  type IraqiGovernorate,
  type PlateType,
} from '@/features/plates/domain/types';
import { adminApi } from '@/lib/api/admin.repository';
import { listingTitle } from '@/lib/api/types';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorState,
  Input,
  PageHeader,
  Pagination,
  Select,
  Skeleton,
  Table,
  Td,
  TextArea,
  Th,
  formatDate,
  formatPrice,
  statusBadgeTone,
  useConfirm,
  useToast,
} from '@/components/ui';

type PlateForm = {
  title: string;
  description: string;
  regionCode: string;
  series: string;
  number: string;
  plateType: PlateType;
  governorate: IraqiGovernorate;
  primaryPrice: string;
  sellerId: string;
  cityId: string;
  categoryId: string;
};

const emptyForm = (): PlateForm => ({
  title: '',
  description: '',
  regionCode: GOVERNORATES.Erbil.defaultCode,
  series: 'A',
  number: '12345',
  plateType: 'Private',
  governorate: 'Erbil',
  primaryPrice: '',
  sellerId: '',
  cityId: '',
  categoryId: '',
});

export default function PlatesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const confirm = useConfirm();
  const { toast } = useToast();

  const page = Number(searchParams.get('page') ?? '1');
  const q = searchParams.get('q') ?? '';
  const code = searchParams.get('code') ?? '';
  const letter = searchParams.get('letter') ?? '';
  const number = searchParams.get('number') ?? '';
  const plateType = searchParams.get('plateType') ?? '';

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<PlateForm>(emptyForm);

  const query = useQuery({
    queryKey: ['admin', 'plates', { page, q, code, letter, number, plateType }],
    queryFn: () =>
      adminApi.plates.list({
        page,
        pageSize: 20,
        q: q || undefined,
        code: code || undefined,
        letter: letter || undefined,
        number: number || undefined,
        plateType: plateType || undefined,
      }),
  });

  const save = useMutation({
    mutationFn: async () => {
      const body = {
        title: form.title,
        description: form.description,
        regionCode: form.regionCode,
        series: form.series,
        number: form.number,
        plateType: form.plateType,
        formatCode: formatCodeFor(form.governorate),
        primaryPrice: form.primaryPrice ? Number(form.primaryPrice) : undefined,
        ...(editingId
          ? {}
          : {
              sellerId: form.sellerId,
              cityId: form.cityId,
              categoryId: form.categoryId,
            }),
      };
      if (editingId) return adminApi.plates.update(editingId, body);
      return adminApi.plates.create(body);
    },
    onSuccess: () => {
      toast(editingId ? 'Plate updated' : 'Plate created', 'success');
      setDrawerOpen(false);
      setEditingId(null);
      setForm(emptyForm());
      void queryClient.invalidateQueries({ queryKey: ['admin', 'plates'] });
    },
    onError: (e) => toast(e instanceof Error ? e.message : 'Save failed', 'error'),
  });

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm());
    setDrawerOpen(true);
  };

  const openEdit = (id: string) => {
    const item = query.data?.items.find((p) => p.id === id);
    if (!item) return;
    const gov =
      governorateFromFormatCode(item.plateDetails.format?.code) ?? 'Erbil';
    setEditingId(id);
    setForm({
      title: listingTitle(item),
      description: item.description ?? item.translations?.[0]?.description ?? '',
      regionCode: item.plateDetails.regionCode ?? '',
      series: item.plateDetails.series ?? '',
      number: item.plateDetails.number ?? '',
      plateType: (isPlateType(item.plateDetails.plateType ?? '')
        ? item.plateDetails.plateType
        : 'Private') as PlateType,
      governorate: gov,
      primaryPrice: item.primaryPrice?.toString() ?? '',
      sellerId: item.seller?.id ?? '',
      cityId: item.city?.id ?? '',
      categoryId: '',
    });
    setDrawerOpen(true);
  };

  const setParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    if (key !== 'page') params.delete('page');
    router.replace(`/plates?${params.toString()}`);
  };

  return (
    <div>
      <PageHeader
        title="Plates"
        description="Manage license plate listings."
        action={
          <Button onClick={openCreate}>Create plate</Button>
        }
      />

      <Card className="mb-4 p-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Input
            label="Region code"
            value={code}
            onChange={(e) => setParam('code', e.target.value)}
          />
          <Input
            label="Letter"
            value={letter}
            onChange={(e) => setParam('letter', e.target.value)}
          />
          <Input
            label="Number"
            value={number}
            onChange={(e) => setParam('number', e.target.value)}
          />
          <Select
            label="Plate type"
            value={plateType}
            onChange={(e) => setParam('plateType', e.target.value)}
          >
            <option value="">All types</option>
            {PLATE_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Select>
        </div>
      </Card>

      {query.isLoading ? (
        <Skeleton className="h-96" />
      ) : query.isError ? (
        <ErrorState message="Failed to load plates" onRetry={() => void query.refetch()} />
      ) : query.data!.items.length === 0 ? (
        <EmptyState title="No plates found" action={<Button onClick={openCreate}>Create plate</Button>} />
      ) : (
        <Card>
          <Table>
            <thead>
              <tr>
                <Th>Plate</Th>
                <Th>Title</Th>
                <Th>Status</Th>
                <Th>Price</Th>
                <Th>Created</Th>
                <Th />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {query.data!.items.map((item) => (
                <tr key={item.id}>
                  <Td>
                    {item.plateDetails?.plateDisplay ??
                      `${item.plateDetails?.regionCode ?? ''} ${item.plateDetails?.series ?? ''} ${item.plateDetails?.number ?? ''}`.trim()}
                  </Td>
                  <Td>{listingTitle(item)}</Td>
                  <Td>
                    <Badge tone={statusBadgeTone(item.status)}>{item.status}</Badge>
                  </Td>
                  <Td>{formatPrice(item.primaryPrice)}</Td>
                  <Td>{formatDate(item.createdAt)}</Td>
                  <Td>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" onClick={() => openEdit(item.id)}>
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => {
                          void (async () => {
                            const ok = await confirm({
                              title: 'Delete plate listing?',
                              variant: 'danger',
                              confirmLabel: 'Delete',
                            });
                            if (!ok) return;
                            try {
                              await adminApi.plates.delete(item.id);
                              toast('Plate deleted', 'success');
                              void queryClient.invalidateQueries({ queryKey: ['admin', 'plates'] });
                            } catch (e) {
                              toast(e instanceof Error ? e.message : 'Delete failed', 'error');
                            }
                          })();
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
          <div className="px-4 pb-4">
            <Pagination
              page={query.data!.page}
              totalPages={query.data!.totalPages}
              onPageChange={(p) => setParam('page', String(p))}
            />
          </div>
        </Card>
      )}

      {drawerOpen ? (
        <div className="fixed inset-0 z-[80] flex justify-end">
          <button
            type="button"
            className="absolute inset-0 bg-black/50"
            aria-label="Close drawer"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="relative z-10 flex h-full w-full max-w-lg flex-col overflow-y-auto border-l border-border bg-surface p-6 shadow-lift">
            <h2 className="font-display text-xl font-semibold text-ink">
              {editingId ? 'Edit plate' : 'Create plate'}
            </h2>
            <form
              className="mt-6 space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                save.mutate();
              }}
            >
              <Select
                label="Governorate"
                value={form.governorate}
                onChange={(e) => {
                  const gov = e.target.value;
                  if (!isIraqiGovernorate(gov)) return;
                  setForm((f) => ({
                    ...f,
                    governorate: gov,
                    regionCode: GOVERNORATES[gov].defaultCode,
                  }));
                }}
              >
                {IRAQI_GOVERNORATES.map((g) => (
                  <option key={g} value={g}>
                    {GOVERNORATES[g].nameEn}
                  </option>
                ))}
              </Select>
              <div className="grid grid-cols-3 gap-3">
                <Input
                  label="Code"
                  value={form.regionCode}
                  onChange={(e) => setForm((f) => ({ ...f, regionCode: e.target.value }))}
                />
                <Input
                  label="Letter"
                  value={form.series}
                  onChange={(e) => setForm((f) => ({ ...f, series: e.target.value }))}
                />
                <Input
                  label="Number"
                  value={form.number}
                  onChange={(e) => setForm((f) => ({ ...f, number: e.target.value }))}
                />
              </div>
              <Select
                label="Plate type"
                value={form.plateType}
                onChange={(e) => {
                  const t = e.target.value;
                  if (isPlateType(t)) setForm((f) => ({ ...f, plateType: t }));
                }}
              >
                {PLATE_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </Select>

              <LicensePlate
                governorate={form.governorate}
                code={form.regionCode}
                letter={form.series}
                number={form.number}
                type={form.plateType}
                showExport
                size="fill"
              />

              <Input
                label="Title"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                required
              />
              <TextArea
                label="Description"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
              <Input
                label="Price (IQD)"
                type="number"
                value={form.primaryPrice}
                onChange={(e) => setForm((f) => ({ ...f, primaryPrice: e.target.value }))}
              />
              {!editingId ? (
                <>
                  <Input
                    label="Seller ID"
                    value={form.sellerId}
                    onChange={(e) => setForm((f) => ({ ...f, sellerId: e.target.value }))}
                    required
                  />
                  <Input
                    label="City ID"
                    value={form.cityId}
                    onChange={(e) => setForm((f) => ({ ...f, cityId: e.target.value }))}
                    required
                  />
                  <Input
                    label="Category ID"
                    value={form.categoryId}
                    onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
                    required
                  />
                </>
              ) : null}
              <div className="flex gap-2 pt-2">
                <Button type="submit" disabled={save.isPending}>
                  {save.isPending ? 'Saving…' : 'Save'}
                </Button>
                <Button type="button" variant="secondary" onClick={() => setDrawerOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
