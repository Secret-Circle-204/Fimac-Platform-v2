// Inspection complete - endpoint deactivated.
export async function GET() {
  return new Response("Deactivated", { status: 404 })
}
