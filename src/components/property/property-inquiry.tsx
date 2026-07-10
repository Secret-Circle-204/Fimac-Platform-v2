"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Building2 } from "lucide-react"

import { PropertyInquiryForm } from "@/forms/property-inquiry/form"

export const PropertyInquiry = () => {
  // const property = useProperty()

  return (
    <div id="property-inquiry-section" className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 flex flex-col gap-4 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <div className="flex items-start gap-4">
        <Avatar className="size-14">
          <AvatarFallback className="bg-blue-900 text-white text-lg font-semibold">
            FG
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col justify-center gap-1">
          <h4 className="text-lg font-bold mt-1">Fimac Group</h4>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <Building2 size={14} />
            Platform Administrators
          </p>
        </div>
      </div>

      <div className="border-t pt-4">
        <h5 className="font-semibold mb-3 text-sm">Inquire About This Property</h5>
        <PropertyInquiryForm />
      </div>
    </div>
  )
}
