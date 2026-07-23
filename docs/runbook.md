# Operations runbook (v1)

## Abuse / spam

1. Review `/admin/reports` queue
2. Resolve with note or dismiss
3. Suspend user via `POST /v1/admin/users/:id/suspend` if needed
4. Remove listing (`REMOVED` status)

## Plate format updates

Admins update formats via `PUT /v1/admin/plate-formats` without redeploy. Erbil remains `STRICT`; others start `SOFT`.

## Backups

- Enable provider automated Postgres backups (PITR)
- Weekly restore drill on staging

## Incident contacts

Document on-call rotation before production launch.
