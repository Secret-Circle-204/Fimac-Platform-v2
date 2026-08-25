import { getCurrentUser } from "@/lib/auth/get-current-user"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { UserNavClient } from "./user-nav-client"

export async function UserNav() {
  const user = await getCurrentUser()

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="ghost" asChild>
          <Link href="/auth/login">Log In</Link>
        </Button>
        <Button asChild>
          <Link href="/auth/register">Create Account</Link>
        </Button>
      </div>
    )
  }

  return <UserNavClient user={user} />
}
