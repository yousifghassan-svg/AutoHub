# Domain modules (DDD)

Each domain follows a layered NestJS + DDD layout:

```
<domain>/
  <domain>.module.ts     # Nest module registration
  domain/                # Entities, value objects, domain services
  application/           # Use cases / application services
  infrastructure/        # Domain-specific adapters (repositories)
  presentation/          # Controllers / DTOs (empty until approved)
```

Sprint 2 registers module shells only. No CRUD controllers or business services yet.
