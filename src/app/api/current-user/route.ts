import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/get-current-user"

export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ authenticated: false })
    }

    return NextResponse.json({
      authenticated: true,
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      collection: user.collection,
    })
  } catch (_error) {
    return NextResponse.json({ authenticated: false })
  }
}
