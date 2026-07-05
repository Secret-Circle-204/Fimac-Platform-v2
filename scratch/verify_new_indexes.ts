import dotenv from "dotenv"
dotenv.config({ path: ".env" })

async function run() {
  const { getPayloadClient } = await import("../src/db/client")
  const payload = await getPayloadClient()
  const adapter = payload.db as any
  const drizzle = adapter.drizzle

  console.log("\n=== 1. VERIFYING NEW DATABASE INDEXES ===")
  const indexes = await drizzle.execute(`
    SELECT tablename, indexname, indexdef 
    FROM pg_indexes 
    WHERE tablename IN ('property_views', 'blog_posts')
    ORDER BY tablename, indexname;
  `)
  
  console.log("Indexes found on property_views and blog_posts:")
  indexes.rows.forEach((r: any) => {
    console.log(` - Table: ${r.tablename} | Index: ${r.indexname} | Def: ${r.indexdef}`)
  })

  console.log("\n=== 2. RUNNING EXPLAIN ANALYZE FOR PROPERTY VIEWS SORT ===")
  
  // Disable sequential scans temporarily to see index pathing if dataset is small
  await drizzle.execute("SET enable_seqscan = off;")
  
  // Query 1: Selecting property views sorted by viewedAt
  console.log("⚡ Executing: EXPLAIN ANALYZE SELECT id, viewed_at FROM property_views ORDER BY viewed_at DESC LIMIT 50;")
  try {
    const plan1 = await drizzle.execute(`
      EXPLAIN ANALYZE 
      SELECT id, viewed_at FROM property_views 
      ORDER BY viewed_at DESC 
      LIMIT 50;
    `)
    plan1.rows.forEach((r: any) => console.log(r["QUERY PLAN"]))
  } catch (err: any) {
    console.error("Failed to run explain on property_views:", err.message)
  }

  console.log("\n=== 3. RUNNING EXPLAIN ANALYZE FOR BLOG POSTS SORT & FILTER ===")
  
  // Query 2: Selecting blog posts sorted by publishedDate and filtered by status
  console.log("⚡ Executing: EXPLAIN ANALYZE SELECT id, title FROM blog_posts WHERE status = 'published' ORDER BY published_date DESC;")
  try {
    const plan2 = await drizzle.execute(`
      EXPLAIN ANALYZE 
      SELECT id, title FROM blog_posts 
      WHERE status = 'published' 
      ORDER BY published_date DESC;
    `)
    plan2.rows.forEach((r: any) => console.log(r["QUERY PLAN"]))
  } catch (err: any) {
    console.error("Failed to run explain on blog_posts:", err.message)
  }

  process.exit(0)
}

run().catch(err => {
  console.error("Verification error:", err)
  process.exit(1)
})
