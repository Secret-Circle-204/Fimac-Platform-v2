"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Map, List } from "lucide-react"

export function MobileSearchFAB() {
  // Read state from URL or local storage in a real app,
  // but for a smooth UI toggle, local state is often best.
  const [view, setView] = useState<"list" | "map">("list")

  const toggleView = () => {
    const nextView = view === "list" ? "map" : "list"
    setView(nextView)

    // Dispatch a custom event that the parent layout can listen to
    // to toggle visibility of the map VS the results list.
    window.dispatchEvent(new CustomEvent("search-view-change", { detail: nextView }))
  }

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 lg:hidden">
      <Button
        onClick={toggleView}
        className="rounded-full shadow-lg bg-slate-900 hover:bg-slate-800 text-white px-6 py-6 flex items-center gap-2 font-medium"
      >
        {view === "list" ? (
          <>
            <Map className="w-5 h-5" />
            <span>Map</span>
          </>
        ) : (
          <>
            <List className="w-5 h-5" />
            <span>List</span>
          </>
        )}
      </Button>
    </div>
  )
}
