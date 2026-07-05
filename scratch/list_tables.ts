import dotenv from "dotenv"
dotenv.config({ path: ".env" })

async function run() {
  const { getPayloadClient } = await import("../src/db/client")
  const payload = await getPayloadClient()
  
  // In Payload 3.0 db-postgres, payload.db exposes the drizzle adapter or direct pool query utilities
  const adapter = payload.db as any
  
  console.log("\n--- INSPECTING TABLES ---")
  const result = await adapter.drizzle.execute(
    "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';"
  )
  console.log("Tables:", result.rows.map((r: any) => r.table_name).join(", "))
  
  console.log("\n--- INSPECTING properties COLUMNS ---")
  const cols1 = await adapter.drizzle.execute(
    "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'properties';"
  )
  console.log("properties columns:")
  cols1.rows.forEach((c: any) => console.log(` - ${c.column_name} (${c.data_type})`))

  console.log("\n--- INSPECTING locations COLUMNS ---")
  const cols2 = await adapter.drizzle.execute(
    "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'locations';"
  )
  console.log("locations columns:")
  cols2.rows.forEach((c: any) => console.log(` - ${c.column_name} (${c.data_type})`))

  process.exit(0)
}

run().catch(err => {
  console.error(err)
  process.exit(1)
})
