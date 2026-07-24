# Sprint 18 — Complete Vehicle Management System

Production vehicle management inside the Admin Panel so staff can fully manage listings without the marketplace UI.

## Pages created

| Route | Purpose |
| --- | --- |
| `/listings` | Upgraded vehicle list (search, filters, sort, bulk, CSV, actions) |
| `/listings/new` | Create vehicle (full form + plate attach) |
| `/listings/[id]` | Professional detail (gallery, specs, audit, reports, stats, quick actions) |
| `/listings/[id]/edit` | Full edit + media manager + unsaved-changes warning |

## Components created

- `apps/admin/src/features/vehicles/components/VehicleForm.tsx`
- `apps/admin/src/features/vehicles/components/VehicleMediaPanel.tsx`
- `apps/admin/src/features/vehicles/hooks/useCatalogFilters.ts`
- `apps/admin/src/features/vehicles/hooks/useUnsavedWarning.ts`
- `apps/admin/src/features/vehicles/lib/map-listing-to-form.ts`
- `apps/admin/src/features/vehicles/domain/types.ts`

## Endpoints added / extended

| Method | Path | Notes |
| --- | --- | --- |
| `POST` | `/v1/admin/listings` | Create vehicle |
| `GET` | `/v1/admin/listings/export` | CSV export |
| `POST` | `/v1/admin/listings/bulk` | Bulk activate/archive/feature/delete/restore |
| `POST` | `/v1/admin/listings/:id/restore` | Restore soft-deleted |
| `DELETE` | `/v1/admin/listings/:id/permanent` | Hard delete |
| `GET` | `/v1/admin/listings` | + `includeDeleted`, `sortBy`, `featured` |
| `PATCH` | `/v1/admin/listings/:id` | Expanded car/plate/location fields |
| `GET` | `/v1/catalog/filters` | + models, body/drive/engine/condition, categories |
| `GET` | `/v1/admin/audit-logs` | + `entityId` filter |

Reused (no rewrite): `/v1/listings/:id/media*`, `/v1/media/upload`, existing approve/reject/archive/feature.

## Schema migration

`packages/database/prisma/migrations/20260724180000_vehicle_admin_fields`

- `CarDetails`: `vin`, `trim`, `seats`, `interiorColor`
- `Listing`: `latitude`, `longitude`, `locationText`

## Files modified (high level)

- Admin listings pages + repository/types
- Admin listings API service/controller/DTOs
- Catalog filters service
- VehicleDetails DTO + listings service persistence
- Audit query DTO/service

## Screenshots

- `docs/screenshots/admin-vehicles-list.png`
- `docs/screenshots/admin-vehicle-new.png`
- `docs/screenshots/admin-vehicle-detail.png`

## Build status

| Package | lint | typecheck | build |
| --- | --- | --- | --- |
| `@autohub/api` | ✅ | ✅ | ✅ |
| `@autohub/admin` | ✅ | ✅ | ✅ |
