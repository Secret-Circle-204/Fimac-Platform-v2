import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    UPDATE "properties_rels"
    SET "path" = 'details.features'
    WHERE "path" = 'features';
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    UPDATE "properties_rels"
    SET "path" = 'features'
    WHERE "path" = 'details.features';
  `)
}
