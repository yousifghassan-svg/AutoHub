'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { adminApi } from '@/lib/api/admin.repository';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorState,
  Input,
  PageHeader,
  Skeleton,
  Table,
  Td,
  Th,
  useToast,
} from '@/components/ui';

export default function PlateCategoriesPage() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [sortOrder, setSortOrder] = useState('0');

  const query = useQuery({
    queryKey: ['admin', 'plates', 'catalog', 'categories'],
    queryFn: () => adminApi.plates.catalog.categories.list(),
  });

  const create = useMutation({
    mutationFn: () =>
      adminApi.plates.catalog.categories.create({
        code: code.trim().toUpperCase(),
        nameEn: nameEn.trim(),
        nameAr: nameAr.trim() || undefined,
        sortOrder: Number(sortOrder) || 0,
      }),
    onSuccess: () => {
      toast('Category created', 'success');
      setOpen(false);
      setCode('');
      setNameEn('');
      setNameAr('');
      setSortOrder('0');
      void qc.invalidateQueries({ queryKey: ['admin', 'plates', 'catalog', 'categories'] });
    },
    onError: (e: Error) => toast(e.message || 'Create failed', 'error'),
  });

  return (
    <div>
      <PageHeader
        title="Plate categories"
        description="Plate category catalog from /v1/admin/plates/catalog/categories."
        action={
          <Button variant={open ? 'secondary' : 'primary'} onClick={() => setOpen((v) => !v)}>
            {open ? 'Cancel' : 'Add category'}
          </Button>
        }
      />

      {open ? (
        <Card className="mb-4 space-y-3 p-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Input label="Code" value={code} onChange={(e) => setCode(e.target.value)} />
            <Input label="Name (EN)" value={nameEn} onChange={(e) => setNameEn(e.target.value)} />
            <Input label="Name (AR)" value={nameAr} onChange={(e) => setNameAr(e.target.value)} />
            <Input
              label="Sort order"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            />
          </div>
          <Button
            disabled={!code.trim() || !nameEn.trim() || create.isPending}
            onClick={() => void create.mutateAsync()}
          >
            Create category
          </Button>
        </Card>
      ) : null}

      {query.isLoading ? (
        <Skeleton className="h-64" />
      ) : query.isError ? (
        <ErrorState message="Failed to load plate categories" onRetry={() => void query.refetch()} />
      ) : (query.data?.length ?? 0) === 0 ? (
        <EmptyState title="No plate categories" />
      ) : (
        <Card>
          <Table>
            <thead>
              <tr>
                <Th>Code</Th>
                <Th>Name (EN)</Th>
                <Th>Name (AR)</Th>
                <Th>Sort</Th>
                <Th>Status</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {query.data!.map((row) => (
                <tr key={row.id}>
                  <Td>{row.code}</Td>
                  <Td>{row.nameEn}</Td>
                  <Td>{row.nameAr ?? '—'}</Td>
                  <Td>{row.sortOrder ?? '—'}</Td>
                  <Td>
                    <Badge tone={row.active === false ? 'neutral' : 'success'}>
                      {row.active === false ? 'Inactive' : 'Active'}
                    </Badge>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      )}
    </div>
  );
}
