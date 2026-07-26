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

export default function VehicleBrandsPage() {
  const { toast } = useToast();
  const catalog = useCatalogFilters();

  return (
    <div>
      <PageHeader
        title="Vehicle brands"
        description="Read-only brand catalog from marketplace filters."
        action={
          <Button
            variant="secondary"
            onClick={() => toast('Brand CRUD stub — connect to admin catalog API', 'info')}
          >
            Add brand
          </Button>
        }
      />

      {catalog.isLoading ? (
        <Skeleton className="h-64" />
      ) : catalog.isError ? (
        <ErrorState message="Failed to load brands" onRetry={() => void catalog.refetch()} />
      ) : (catalog.data?.brands.length ?? 0) === 0 ? (
        <EmptyState title="No brands" />
      ) : (
        <Card>
          <Table>
            <thead>
              <tr>
                <Th>Name (EN)</Th>
                <Th>Name (AR)</Th>
                <Th>Slug</Th>
                <Th>Status</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {catalog.data!.brands.map((row) => (
                <tr key={row.id}>
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
