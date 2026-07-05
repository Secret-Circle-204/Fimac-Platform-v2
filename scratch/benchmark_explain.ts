import dotenv from "dotenv"
dotenv.config({ path: ".env" })

async function run() {
  const { getPayloadClient } = await import("../src/db/client")
  const payload = await getPayloadClient()
  const adapter = payload.db as any
  const drizzle = adapter.drizzle

  console.log("\n=== PHASE 2C: TRIGRAM INDEX MIGRATION ===")
  
  console.log("1. Enabling pg_trgm extension...")
  await drizzle.execute("CREATE EXTENSION IF NOT EXISTS pg_trgm;")

  console.log("2. Constructing GIN Trigram indexes...")
  await drizzle.execute("DROP INDEX IF EXISTS idx_locations_city_trgm;")
  await drizzle.execute("CREATE INDEX idx_locations_city_trgm ON locations USING gin (city gin_trgm_ops);")
  
  await drizzle.execute("DROP INDEX IF EXISTS idx_locations_zip_trgm;")
  await drizzle.execute("CREATE INDEX idx_locations_zip_trgm ON locations USING gin (zip gin_trgm_ops);")

  await drizzle.execute("DROP INDEX IF EXISTS idx_locations_state_name_trgm;")
  await drizzle.execute("CREATE INDEX idx_locations_state_name_trgm ON locations USING gin (state_name gin_trgm_ops);")

  await drizzle.execute("DROP INDEX IF EXISTS idx_properties_title_trgm;")
  await drizzle.execute("CREATE INDEX idx_properties_title_trgm ON properties USING gin (title gin_trgm_ops);")

  console.log("✅ Migration Completed Successfully.")

  console.log("\n=== VERIFYING INDEX PRESENCE ===")
  const indexes = await drizzle.execute(`
    SELECT indexname, indexdef 
    FROM pg_indexes 
    WHERE tablename IN ('properties', 'locations');
  `)
  console.log("Existing Indexes on properties/locations:")
  indexes.rows.forEach((r: any) => console.log(` - ${r.indexname}: ${r.indexdef}`))

  console.log("\n=== RUNNING EXPLAIN ANALYZE BENCHMARKS ===")
  
  // Force index usage on tiny local dataset by disabling sequential scan preference
  await drizzle.execute("SET enable_seqscan = off;")
  console.log("⚡ Disabling enable_seqscan to force verification of index pathways on sparse dataset.")

  // Benchmark 1: Radius BBox Search (lat and lng)
  console.log("\n📡 [TEST 1] EXPLAIN ANALYZE: Geospatial Radius Search (lat 34.0 to 35.0)")
  const plan1 = await drizzle.execute(`
    EXPLAIN ANALYZE 
    SELECT id, title FROM properties 
    WHERE location_geo_lat >= 34.0 AND location_geo_lat <= 35.0
      AND location_geo_lng >= -120.0 AND location_geo_lng <= -118.0;
  `)
  plan1.rows.forEach((r: any) => console.log(r["QUERY PLAN"]))

  // Benchmark 2: Price Range Search
  console.log("\n💰 [TEST 2] EXPLAIN ANALYZE: Price Range Search (>= 500,000)")
  const plan2 = await drizzle.execute(`
    EXPLAIN ANALYZE 
    SELECT id, title FROM properties 
    WHERE price >= 500000 AND price <= 2000000;
  `)
  plan2.rows.forEach((r: any) => console.log(r["QUERY PLAN"]))

  // Benchmark 3: Wildcard City Search (GIN Trigram)
  console.log("\n🏙️ [TEST 3] EXPLAIN ANALYZE: Wildcard City Search (ILIKE '%New%')")
  const plan3 = await drizzle.execute(`
    EXPLAIN ANALYZE 
    SELECT id, city, zip FROM locations 
    WHERE city ILIKE '%New%';
  `)
  plan3.rows.forEach((r: any) => console.log(r["QUERY PLAN"]))

  // Benchmark 4: Multi-Column Wildcard OR Lookup (Complex Search Page Query)
  console.log("\n🔍 [TEST 4] EXPLAIN ANALYZE: Complex Location Multi-column Search ('miami')")
  const plan4 = await drizzle.execute(`
    EXPLAIN ANALYZE 
    SELECT id, city FROM locations 
    WHERE city ILIKE '%miami%' OR state_name ILIKE '%miami%' OR zip ILIKE '%miami%';
  `)
  plan4.rows.forEach((r: any) => console.log(r["QUERY PLAN"]))

  process.exit(0)
}

run().catch(err => {
  console.error(err)
  process.exit(1)
})
