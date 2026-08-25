import { NextResponse } from 'next/server'
import { cacheTelemetry } from '@/lib/cache/telemetry'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const stats = cacheTelemetry.getStats()
    return NextResponse.json(stats, { status: 200 })
  } catch {
    return NextResponse.json({ error: 'Failed to retrieve cache stats' }, { status: 500 })
  }
}
