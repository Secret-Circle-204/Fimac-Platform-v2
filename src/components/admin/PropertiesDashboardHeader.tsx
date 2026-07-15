'use client'

import React, { useEffect, useState } from 'react'
import { useListQuery } from '@payloadcms/ui'
import {
  Home,
  Eye,
  CheckCircle2,
  FileText,
  MapPin,
  Building,
  ShieldAlert,
  Award,
  Hotel,
  Trees,
} from 'lucide-react'

interface Stats {
  total: number
  residential: number
  commercial: number
  hospitality: number
  land: number
}

export const PropertiesDashboardHeader: React.FC = () => {
  const { query, handleWhereChange } = useListQuery()

  const [stats, setStats] = useState<Stats>({
    total: 0,
    residential: 0,
    commercial: 0,
    hospitality: 0,
    land: 0,
  })
  const [loading, setLoading] = useState(true)

  // Fetch counts efficiently with limit=1 and depth=0 to utilize db indexing and avoid loading heavy relations
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [totalRes, resRes, commRes, hospRes, landRes] = await Promise.all([
          fetch('/api/properties?limit=1&depth=0'),
          fetch('/api/properties?limit=1&depth=0&where[category][equals]=residential'),
          fetch('/api/properties?limit=1&depth=0&where[category][equals]=commercial'),
          fetch('/api/properties?limit=1&depth=0&where[category][equals]=hospitality'),
          fetch('/api/properties?limit=1&depth=0&where[category][equals]=land'),
        ])

        if (totalRes.ok && resRes.ok && commRes.ok && hospRes.ok && landRes.ok) {
          const [totalData, resData, commData, hospData, landData] = await Promise.all([
            totalRes.json(),
            resRes.json(),
            commRes.json(),
            hospRes.json(),
            landRes.json(),
          ])

          setStats({
            total: totalData.totalDocs || 0,
            residential: resData.totalDocs || 0,
            commercial: commData.totalDocs || 0,
            hospitality: hospData.totalDocs || 0,
            land: landData.totalDocs || 0,
          })
        }
      } catch (error) {
        console.error('Failed to fetch Properties dashboard statistics:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  // Helper to apply quick filters by updating search parameters using Payload's list query handler
  const applyFilter = (field: string, value: string) => {
    if (handleWhereChange) {
      void handleWhereChange({
        [field]: {
          equals: value,
        },
      })
    }
  }

  const clearFilters = () => {
    if (handleWhereChange) {
      void handleWhereChange({})
    }
  }

  // Determine active filter to highlight the filter buttons
  const getActiveFilterValue = () => {
    const where = query?.where
    if (where && typeof where === 'object') {
      for (const [field, condition] of Object.entries(where)) {
        if (condition && typeof condition === 'object' && 'equals' in condition) {
          const val = (condition as Record<string, unknown>).equals
          if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') {
            return `${field}:${val}`
          }
        }
      }
    }
    return null
  }

  const activeFilter = getActiveFilterValue()

  return (
    <div
      className="mb-6 p-6 bg-slate-50 border border-slate-200 rounded-2xl shadow-sm"
      style={{ marginLeft: 'var(--gutter-h)', marginRight: 'var(--gutter-h)' }}
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800 flex items-center gap-2">
            <Building className="text-blue-600" size={26} />
            Properties Dashboard
          </h1>
          <p className="text-slate-500 text-sm font-medium mt-1">
            Manage Fimac real estate listings, filter by categories, and perform bulk operations.
          </p>
        </div>
      </div>

      {/* KPI Cards Section */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        {/* Total Properties */}
        <div className="p-5 bg-white border border-slate-200 rounded-xl flex items-center justify-between shadow-sm transition-all hover:border-blue-300 col-span-2 md:col-span-1">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Properties
            </p>
            <h3 className="text-xl font-semibold text-slate-800 mt-1">
              {loading ? <span className="animate-pulse">...</span> : stats.total}
            </h3>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <Home size={20} />
          </div>
        </div>

        {/* Residential */}
        <div className="p-5 bg-white border border-slate-200 rounded-xl flex items-center justify-between shadow-sm transition-all hover:border-blue-300">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Residential
            </p>
            <h3 className="text-xl font-semibold text-slate-800 mt-1">
              {loading ? <span className="animate-pulse">...</span> : stats.residential}
            </h3>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <Building size={20} />
          </div>
        </div>

        {/* Commercial */}
        <div className="p-5 bg-white border border-slate-200 rounded-xl flex items-center justify-between shadow-sm transition-all hover:border-blue-300">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Commercial
            </p>
            <h3 className="text-xl font-semibold text-slate-800 mt-1">
              {loading ? <span className="animate-pulse">...</span> : stats.commercial}
            </h3>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <Award size={20} />
          </div>
        </div>

        {/* Hospitality */}
        <div className="p-5 bg-white border border-slate-200 rounded-xl flex items-center justify-between shadow-sm transition-all hover:border-blue-300">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Hospitality
            </p>
            <h3 className="text-xl font-semibold text-slate-800 mt-1">
              {loading ? <span className="animate-pulse">...</span> : stats.hospitality}
            </h3>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <Hotel size={20} />
          </div>
        </div>

        {/* Land */}
        <div className="p-5 bg-white border border-slate-200 rounded-xl flex items-center justify-between shadow-sm transition-all hover:border-blue-300">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Land
            </p>
            <h3 className="text-xl font-semibold text-slate-800 mt-1">
              {loading ? <span className="animate-pulse">...</span> : stats.land}
            </h3>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
            <Trees size={20} />
          </div>
        </div>
      </div>

      {/* Pre-configured Quick Filters Section */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-200">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider mr-2">
            Categories:
          </span>

          <button
            onClick={() => applyFilter('category', 'residential')}
            className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-all duration-200 ${
              activeFilter === 'category:residential'
                ? 'bg-blue-600 border-blue-600 text-white'
                : 'bg-white border-slate-200 text-slate-600 hover:border-blue-400 hover:text-blue-600'
            }`}
          >
            🏡 Residential
          </button>

          <button
            onClick={() => applyFilter('category', 'commercial')}
            className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-all duration-200 ${
              activeFilter === 'category:commercial'
                ? 'bg-blue-600 border-blue-600 text-white'
                : 'bg-white border-slate-200 text-slate-600 hover:border-blue-400 hover:text-blue-600'
            }`}
          >
            🏢 Commercial
          </button>

          <button
            onClick={() => applyFilter('category', 'hospitality')}
            className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-all duration-200 ${
              activeFilter === 'category:hospitality'
                ? 'bg-blue-600 border-blue-600 text-white'
                : 'bg-white border-slate-200 text-slate-600 hover:border-blue-400 hover:text-blue-600'
            }`}
          >
            🏨 Hospitality
          </button>

          <button
            onClick={() => applyFilter('category', 'land')}
            className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-all duration-200 ${
              activeFilter === 'category:land'
                ? 'bg-blue-600 border-blue-600 text-white'
                : 'bg-white border-slate-200 text-slate-600 hover:border-blue-400 hover:text-blue-600'
            }`}
          >
            🌴 Land
          </button>

        </div>

        {activeFilter && (
          <button
            onClick={clearFilters}
            className="px-3 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors"
          >
            Clear Filters
          </button>
        )}
      </div>
    </div>
  )
}
