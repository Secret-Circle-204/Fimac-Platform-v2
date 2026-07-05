import { PropertySearchCard } from "./property-search-card"
import { PropertySearchCardSkeleton } from "./property-search-card-skeleton"
import { Property } from "@/payload-types"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, SearchX } from "lucide-react"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface SearchResultsProps {
  properties: Property[]
  totalCount?: number
  isLoading?: boolean
}

export function SearchResults({ properties, totalCount, isLoading = false }: SearchResultsProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const resultsPerPage = 25
  const totalPages = Math.ceil((totalCount || properties.length) / resultsPerPage)

  const startIndex = (currentPage - 1) * resultsPerPage
  const endIndex = startIndex + resultsPerPage
  const currentResults = properties.slice(startIndex, endIndex)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  useEffect(() => {
    const handleGlobeClick = (e: Event) => {
      const customEvent = e as CustomEvent<string>
      const propertyId = customEvent.detail
      const cardElement = document.getElementById(`property-card-${propertyId}`)
      if (cardElement) {
        cardElement.scrollIntoView({ behavior: "smooth", block: "center" })
        cardElement.classList.add("ring-gold-royal", "ring-4", "shadow-gold")
        setTimeout(() => {
          cardElement.classList.remove("ring-gold-royal", "ring-4", "shadow-gold")
        }, 2000)
      }
    }
    window.addEventListener("globe-property-click", handleGlobeClick)
    return () => window.removeEventListener("globe-property-click", handleGlobeClick)
  }, [])

  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxPagesToShow = 5
    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      pages.push(1)
      const startPage = Math.max(2, currentPage - 1)
      const endPage = Math.min(totalPages - 1, currentPage + 1)
      if (startPage > 2) pages.push("...")
      for (let i = startPage; i <= endPage; i++) pages.push(i)
      if (endPage < totalPages - 1) pages.push("...")
      pages.push(totalPages)
    }
    return pages
  }

  if (properties.length === 0 && !isLoading) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/60 backdrop-blur-xl border border-navy-deep/5 rounded-3xl p-16 text-center shadow-navy"
      >
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gold-royal/10 rounded-full mb-6">
          <SearchX className="h-10 w-10 text-gold-royal" />
        </div>
        <h3 className="text-3xl font-black text-navy-deep mb-3">No Results Found</h3>
        <p className="text-navy-deep/60 mb-8 max-w-md mx-auto">
          We couldn&apos;t find any properties matching your elite criteria. 
          Try adjusting your filters for a wider selection.
        </p>
        <Button 
          variant="outline" 
          onClick={() => window.location.href = '/search'}
          className="rounded-xl border-gold-royal/30 text-gold-royal hover:bg-gold-royal hover:text-white"
        >
          Reset All Filters
        </Button>
      </motion.div>
    )
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <div className="space-y-10 pb-12">
      {/* Results Header */}
      <div className="flex flex-col sm:flex-row justify-between items-end gap-4 px-4">
        <div className="space-y-1">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-gold-royal">
            Curated Listings
          </p>
          <p className="text-sm font-bold text-navy-deep/60">
            Discovered <span className="text-navy-deep">{totalCount || properties.length}</span> exceptional opportunities
          </p>
        </div>
        <div className="bg-navy-deep/5 px-4 py-2 rounded-full border border-navy-deep/5 backdrop-blur-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-navy-deep/40">
            Selection <span className="text-gold-royal">{currentPage}</span> of {totalPages}
          </p>
        </div>
      </div>

      {/* Results Grid with Staggered Animation */}
      <AnimatePresence mode="wait">
        <motion.div 
          key={currentPage + (isLoading ? '-loading' : '-ready')}
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        >
          {isLoading
            ? Array.from({ length: 6 }).map((_, index) => (
                <motion.div key={`skeleton-${index}`} variants={item}>
                  <PropertySearchCardSkeleton />
                </motion.div>
              ))
            : currentResults.map((property) => (
                <motion.div key={property.id} variants={item}>
                  <PropertySearchCard property={property} />
                </motion.div>
              ))}
        </motion.div>
      </AnimatePresence>

      {/* Pagination - Premium Design */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 pt-12">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="h-12 w-12 rounded-xl border border-navy-deep/5 text-navy-deep hover:bg-gold-royal hover:text-white transition-all disabled:opacity-30 translate-y-0 active:scale-95 shadow-sm hover:shadow-gold"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>

          <div className="flex items-center gap-2 bg-navy-deep/5 p-1.5 rounded-2xl border border-navy-deep/5">
            {getPageNumbers().map((page, index) => {
              if (page === "...") {
                return (
                  <span key={`ellipsis-${index}`} className="px-3 text-navy-deep/30 font-bold">
                    ...
                  </span>
                )
              }

              const pageNumber = page as number
              const isActive = pageNumber === currentPage

              return (
                <button
                  key={pageNumber}
                  onClick={() => handlePageChange(pageNumber)}
                  className={`h-10 min-w-[40px] px-3 rounded-xl text-xs font-black transition-all duration-300 ${
                    isActive 
                      ? "bg-navy-deep text-white shadow-navy scale-110" 
                      : "text-navy-deep/40 hover:text-gold-royal hover:bg-white"
                  }`}
                >
                  {pageNumber}
                </button>
              )
            })}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="h-12 w-12 rounded-xl border border-navy-deep/5 text-navy-deep hover:bg-gold-royal hover:text-white transition-all disabled:opacity-30 translate-y-0 active:scale-95 shadow-sm hover:shadow-gold"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      )}
    </div>
  )
}
