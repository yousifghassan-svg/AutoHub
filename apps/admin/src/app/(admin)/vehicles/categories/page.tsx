'use client';

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

export default function VehicleCategoriesPage() {
  const { toast } = useToast();
  const catalog = useCatalogFilters();

  return (
    <div>
      <PageHeader
        title="Vehicle categories"
        description="Catalog categories from GET /v1/catalog/filters."
        action={
          <Button
            variant="secondary"
            onClick={() => toast('Category CRUD will be wired to admin catalog endpoints', 'info')}
          >
            Add category
          </Button>
        }
      />

      {catalog.isLoading ? (
        <Skeleton className="h-64" />
      ) : catalog.isError ? (
        <ErrorState message="Failed to load categories" onRetry={() => void catalog.refetch()} />
      ) : (catalog.data?.categories.length ?? 0) === 0 ? (
        <EmptyState title="No categories" description="The catalog returned no vehicle categories." />
      ) : (
        <Card>
          <Table>
            <thead>
              <tr>
                <Th>Code</Th>
                <Th>Name (EN)</Th>
                <Th>Name (AR)</Th>
                <Th>Slug</Th>
                <Th>Status</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {catalog.data!.categories.map((row) => (
                <tr key={row.id}>
                  <Td>{row.code}</Td>
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
