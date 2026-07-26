'use client';

import { useMemo } from 'react';
import { useCatalogFilters } from '@/features/vehicles/hooks/useCatalogFilters';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorState,
  PageHeader,
  Skeleton,
  Table,
  Td,
  Th,
  useToast,
} from '@/components/ui';

export default function VehicleModelsPage() {
  const { toast } = useToast();
  const catalog = useCatalogFilters();

  const brandNames = useMemo(() => {
    const map = new Map((catalog.data?.brands ?? []).map((b) => [b.id, b.nameEn]));
    return map;
  }, [catalog.data?.brands]);

  return (
    <div>
      <PageHeader
        title="Vehicle models"
        description="Models grouped by brand from catalog filters."
        action={
          <Button
            variant="secondary"
            onClick={() => toast('Model CRUD stub — connect to admin catalog API', 'info')}
          >
            Add model
          </Button>
        }
      />

      {catalog.isLoading ? (
        <Skeleton className="h-64" />
      ) : catalog.isError ? (
        <ErrorState message="Failed to load models" onRetry={() => void catalog.refetch()} />
      ) : (catalog.data?.models.length ?? 0) === 0 ? (
        <EmptyState title="No models" />
      ) : (
        <Card>
          <Table>
            <thead>
              <tr>
                <Th>Brand</Th>
                <Th>Name (EN)</Th>
                <Th>Name (AR)</Th>
                <Th>Slug</Th>
                <Th>Status</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {catalog.data!.models.map((row) => (
                <tr key={row.id}>
                  <Td>{brandNames.get(row.brandId) ?? row.brandId}</Td>
                  <Td>{row.nameEn}</Td>
                  <Td>{row.nameAr}</Td>
                  <Td>{row.slug}</Td>
                  <Td>
                    <Badge tone="success">Active</Badge>
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
