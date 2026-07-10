"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"

interface RoleSelectorProps {
  selected: "buyer" | null
  onSelect: (role: "buyer") => void
}

export function RoleSelector({ selected, onSelect }: RoleSelectorProps) {
  return (
    <div className="grid grid-cols-1 gap-4">
      <Card
        className={cn(
          "cursor-pointer transition-all hover:shadow-lg",
          selected === "buyer" && "ring-2 ring-blue-600 border-blue-600",
        )}
        onClick={() => onSelect("buyer")}
      >
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-blue-600" />
            <CardTitle>Buyer</CardTitle>
          </div>
          <CardDescription className="text-right" dir="rtl">
            مشتري
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Looking to purchase hospitality properties in Tennessee.
          </p>
          <div className="mt-4 text-xs space-y-1 text-muted-foreground">
            <p>✓ Access exclusive investment opportunities</p>
            <p>✓ View detailed property analytics</p>
            <p>✓ Connect with verified sellers</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
