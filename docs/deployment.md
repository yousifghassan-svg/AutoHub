# Deployment

## Environments

| Env | Purpose |
|-----|---------|
| local | Docker Postgres + Redis |
| staging | Full stack, separate Firebase + R2 |
| production | Iraq launch |

## Recommended hosting

- **Web / Admin**: Vercel (separate projects)
- **API**: Railway or Fly.io (health check `/v1/health`)
- **Postgres**: Neon or RDS `me-central-1`
- **Redis**: Upstash or provider Redis
- **R2**: Cloudflare bucket + CDN
- **Mobile**: EAS Build + EAS Update
- **Secrets**: provider env stores / Doppler

## Production checklist

1. Separate Firebase projects for staging/prod
2. Real Firebase credentials; staff/dev login hard-disabled in production (`AUTH_ALLOW_*` ignored)
3. Run `prisma migrate deploy` then `db:seed` (geo/catalog)
4. Configure CORS origins for web/admin domains
5. Enable Sentry / OpenTelemetry exporters
6. App Store / Play Store listings via EAS
7. RTL + dual-currency QA on real devices

## Feature flags

Keep `BILLING_ENABLED`, `AUCTIONS_ENABLED`, `DEALERS_ENABLED` false until those modules ship.
