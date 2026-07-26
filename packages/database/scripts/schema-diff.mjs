/**
 * Compare Prisma models vs public PostgreSQL tables (no credential output).
 */
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PrismaClient } from '@prisma/client';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const dbPkg = resolve(root, 'packages/database');

function loadDatabaseUrl() {
  if (process.env.DATABASE_URL) return true;
  const candidates = [
    resolve(dbPkg, '.env'),
    resolve(root, 'apps/api/.env'),
    resolve(root, '.env'),
  ];
  for (const file of candidates) {
    if (!existsSync(file)) continue;
    const text = readFileSync(file, 'utf8');
    for (const line of text.split(/\r?\n/)) {
      if (!line.startsWith('DATABASE_URL=')) continue;
      let value = line.slice('DATABASE_URL='.length).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      process.env.DATABASE_URL = value;
      return true;
    }
  }
  return false;
}

const EXPECTED_COMM = [
  'Conversation',
  'ConversationParticipant',
  'ChatMessage',
  'UserBlock',
  'ConversationReport',
  'DealerFollow',
  'UserPresence',
  'DevicePushToken',
  'AppNotification',
];

const EXPECTED_ENUMS = [
  'ChatMessageType',
  'ChatMessageStatus',
  'ConversationStatus',
  'AppNotificationType',
  'PushPlatform',
];

if (!loadDatabaseUrl()) {
  console.error('DATABASE_URL not found');
  process.exit(1);
}

const schema = readFileSync(resolve(dbPkg, 'prisma/schema.prisma'), 'utf8');
const models = [...schema.matchAll(/^model\s+(\w+)\s+\{/gm)].map((m) => m[1]);

const p = new PrismaClient();
try {
  const tables = await p.$queryRawUnsafe(
    `SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename`,
  );
  const tableNames = tables.map((t) => t.tablename);

  const enums = await p.$queryRawUnsafe(
    `SELECT t.typname AS name
     FROM pg_type t
     JOIN pg_namespace n ON n.oid = t.typnamespace
     WHERE n.nspname = 'public' AND t.typtype = 'e'
     ORDER BY t.typname`,
  );
  const enumNames = enums.map((e) => e.name);

  const migrations = await p.$queryRawUnsafe(
    `SELECT migration_name, finished_at, rolled_back_at, applied_steps_count
     FROM "_prisma_migrations"
     ORDER BY finished_at NULLS LAST, migration_name`,
  );

  const missingModels = models.filter((m) => !tableNames.includes(m));
  const missingComm = EXPECTED_COMM.filter((t) => !tableNames.includes(t));
  const missingEnums = EXPECTED_ENUMS.filter((e) => !enumNames.includes(e));

  const indexes = await p.$queryRawUnsafe(
    `SELECT indexname FROM pg_indexes
     WHERE schemaname = 'public'
       AND (
         tablename IN (${EXPECTED_COMM.map((t) => `'${t}'`).join(',')})
       )
     ORDER BY indexname`,
  );

  const fks = await p.$queryRawUnsafe(
    `SELECT conname
     FROM pg_constraint
     WHERE contype = 'f'
       AND conrelid::regclass::text = ANY(ARRAY[${EXPECTED_COMM.map((t) => `'${t}'`).join(',')}])
     ORDER BY conname`,
  );

  console.log(
    JSON.stringify(
      {
        prismaModelCount: models.length,
        dbTableCount: tableNames.length,
        missingModels,
        communication: {
          expectedTables: EXPECTED_COMM,
          missingTables: missingComm,
          missingEnums,
          presentIndexes: indexes.map((i) => i.indexname),
          presentForeignKeys: fks.map((f) => f.conname),
        },
        appliedMigrations: migrations.map((m) => ({
          name: m.migration_name,
          finished: Boolean(m.finished_at),
          rolledBack: Boolean(m.rolled_back_at),
          steps: m.applied_steps_count,
        })),
        sprint23Applied: migrations.some(
          (m) => m.migration_name === '20260725140000_sprint23_communication',
        ),
      },
      null,
      2,
    ),
  );
} finally {
  await p.$disconnect();
}
