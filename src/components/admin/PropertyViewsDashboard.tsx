"use client"

import React, { useEffect, useState } from "react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from "recharts"
import { Eye, Users, RefreshCw, Laptop, Smartphone, Tablet, BarChart3, Shield, MapPin, Search, ChevronLeft, ChevronRight } from "lucide-react"

interface Stats {
  totalViews: number
  totalUniqueVisitors: number
}

interface TimelineItem {
  date: string
  views: number
}

interface DeviceItem {
  name: string
  value: number
}

interface SourceItem {
  name: string
  value: number
}

interface PopularProperty {
  title: string
  count: number
}

interface LocationItem {
  city: string
  country: string
  count: number
  percentage: number
}

interface LatestView {
  id: string | number
  propertyTitle: string
  viewedAt: string
  device: string
  source: string
  userLabel: string
  locationLabel?: string
}

interface AnalyticsData {
  stats: Stats
  timelineData: TimelineItem[]
  deviceData: DeviceItem[]
  sourceData: SourceItem[]
  popularProperties: PopularProperty[]
  locationData: LocationItem[]
  latestViews: LatestView[]
}

export default function PropertyViewsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)

  // Search filters
  const [popularSearch, setPopularSearch] = useState("")
  const [locationSearch, setLocationSearch] = useState("")
  const [recentSearch, setRecentSearch] = useState("")

  // Pagination (1-indexed)
  const [popularPage, setPopularPage] = useState(1)
  const [locationPage, setLocationPage] = useState(1)
  const [recentPage, setRecentPage] = useState(1)

  const ITEMS_PER_PAGE = 5

  // 1. Live Theme Switch Observer for Payload's Light/Dark mode
  useEffect(() => {
    const checkTheme = () => {
      const isDark =
        document.documentElement.classList.contains("dark") ||
        document.body.classList.contains("dark") ||
        document.documentElement.getAttribute("data-theme") === "dark"
      setIsDarkMode(isDark)
    }

    checkTheme()

    const observer = new MutationObserver(checkTheme)
    observer.observe(document.documentElement, { attributes: true })
    observer.observe(document.body, { attributes: true })

    return () => observer.disconnect()
  }, [])

  // 2. Fetch Analytics Data
  const fetchData = async (forceRefresh = false) => {
    try {
      setRefreshing(true)
      const url = forceRefresh
        ? `/api/analytics/property-views?refresh=true&t=${Date.now()}`
        : `/api/analytics/property-views?t=${Date.now()}`
      const res = await fetch(url, {
        cache: "no-store",
      })
      if (!res.ok) {
        throw new Error("Failed to fetch analytics data")
      }
      const json = await res.json()
      setData(json)
      setError(null)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred while loading analytics.")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchData(false)
  }, [])

  // 3. Define Theme-based Colors for Recharts
  const gridColor = isDarkMode ? "#27272a" : "#e4e4e7" // zinc-800 : zinc-200
  const textColor = isDarkMode ? "#a1a1aa" : "#71717a" // zinc-400 : zinc-500
  const primaryChartColor = isDarkMode ? "#e4e4e7" : "#18181b" // zinc-200 : zinc-900
  const chartGradientEnd = "rgba(0, 0, 0, 0)"

  const pieColors = isDarkMode
    ? ["#f4f4f5", "#a1a1aa", "#3f3f46"] // Light Gray, Gray, Dark Gray (Zinc variants)
    : ["#18181b", "#71717a", "#d4d4d8"] // Dark Gray, Gray, Light Gray

  if (loading) {
    return (
      <div className="p-8 w-full max-w-none flex flex-col items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-zinc-900 dark:border-zinc-100"></div>
        <p className="mt-4 text-zinc-500 dark:text-zinc-400 text-sm font-medium">Loading analytics dashboard...</p>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="p-8 w-full max-w-none">
        <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-xl text-red-700 dark:text-red-400 text-sm">
          <p className="font-semibold">Error Loading Dashboard</p>
          <p className="mt-1">{error || "Data could not be retrieved."}</p>
          <button
            onClick={() => fetchData(true)}
            className="mt-3 px-3 py-1.5 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 rounded-md transition-colors font-medium text-xs"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  const { stats, timelineData, deviceData, popularProperties, locationData, latestViews } = data

  // Client-side search and pagination calculations
  const filteredPopular = (popularProperties || []).filter((prop) =>
    prop.title.toLowerCase().includes(popularSearch.toLowerCase())
  )
  const popularTotalPages = Math.max(1, Math.ceil(filteredPopular.length / ITEMS_PER_PAGE))
  const paginatedPopular = filteredPopular.slice(
    (popularPage - 1) * ITEMS_PER_PAGE,
    popularPage * ITEMS_PER_PAGE
  )

  const filteredLocation = (locationData || []).filter((loc) =>
    `${loc.city} ${loc.country}`.toLowerCase().includes(locationSearch.toLowerCase())
  )
  const locationTotalPages = Math.max(1, Math.ceil(filteredLocation.length / ITEMS_PER_PAGE))
  const paginatedLocation = filteredLocation.slice(
    (locationPage - 1) * ITEMS_PER_PAGE,
    locationPage * ITEMS_PER_PAGE
  )

  const filteredRecent = (latestViews || []).filter((view) =>
    `${view.propertyTitle} ${view.userLabel} ${view.source} ${view.locationLabel || ""}`
      .toLowerCase()
      .includes(recentSearch.toLowerCase())
  )
  const recentTotalPages = Math.max(1, Math.ceil(filteredRecent.length / ITEMS_PER_PAGE))
  const paginatedRecent = filteredRecent.slice(
    (recentPage - 1) * ITEMS_PER_PAGE,
    recentPage * ITEMS_PER_PAGE
  )

  return (
    <div className="p-4 sm:p-8 w-full max-w-none space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Property Views Analytics</h1>
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-full border border-zinc-200 dark:border-zinc-700">
              Live Logs
            </span>
          </div>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
            System-generated analytics log of unique property views.
          </p>
        </div>
        <button
          onClick={() => fetchData(true)}
          disabled={refreshing}
          className="self-start sm:self-center flex items-center gap-2 px-3 py-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-50 dark:hover:bg-zinc-200 text-zinc-50 dark:text-zinc-900 font-medium rounded-lg text-xs shadow-xs transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
          {refreshing ? "Refreshing..." : "Refresh Data"}
        </button>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Total Views Card */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-xl shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Total Page Loads</p>
            <h3 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50">{stats.totalViews}</h3>
            <p className="text-2xs text-zinc-400 dark:text-zinc-500 font-medium">All recorded interactions</p>
          </div>
          <div className="p-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-xl border border-zinc-200/50 dark:border-zinc-700/50">
            <Eye className="h-6 w-6" />
          </div>
        </div>

        {/* Unique Visitors Card */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-xl shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Unique Visitors</p>
            <h3 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50">{stats.totalUniqueVisitors}</h3>
            <p className="text-2xs text-zinc-400 dark:text-zinc-500 font-medium">24h fingerprint deduplicated</p>
          </div>
          <div className="p-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-xl border border-zinc-200/50 dark:border-zinc-700/50">
            <Users className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timeline Area Chart (Spans 2 columns) */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-xl shadow-xs flex flex-col h-[400px]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-bold text-zinc-900 dark:text-zinc-50 text-sm">Views Timeline</h4>
              <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-0.5">Page views count over the last 30 days</p>
            </div>
            <BarChart3 className="h-4 w-4 text-zinc-400" />
          </div>
          <div className="flex-1 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={primaryChartColor} stopOpacity={isDarkMode ? 0.3 : 0.2} />
                    <stop offset="95%" stopColor={chartGradientEnd} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                <XAxis dataKey="date" stroke={textColor} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke={textColor} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDarkMode ? "#18181b" : "#ffffff",
                    borderColor: isDarkMode ? "#3f3f46" : "#e4e4e7",
                    color: isDarkMode ? "#f4f4f5" : "#18181b",
                    borderRadius: "8px",
                    fontFamily: "sans-serif"
                  }}
                />
                <Area type="monotone" dataKey="views" stroke={primaryChartColor} strokeWidth={2} fillOpacity={1} fill="url(#colorViews)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Device Breakdown Pie Chart (Spans 1 column) */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-xl shadow-xs flex flex-col h-[400px]">
          <div>
            <h4 className="font-bold text-zinc-900 dark:text-zinc-50 text-sm">Device Breakdown</h4>
            <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-0.5">Distribution of user hardware</p>
          </div>
          <div className="flex-1 w-full flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={deviceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {deviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDarkMode ? "#18181b" : "#ffffff",
                    borderColor: isDarkMode ? "#3f3f46" : "#e4e4e7",
                    color: isDarkMode ? "#f4f4f5" : "#18181b",
                    borderRadius: "8px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Legend */}
          <div className="grid grid-cols-3 gap-2 border-t border-zinc-150 dark:border-zinc-800 pt-4 text-center">
            {deviceData.map((item, index) => {
              const Icon = item.name === "Desktop" ? Laptop : item.name === "Mobile" ? Smartphone : Tablet
              return (
                <div key={item.name} className="space-y-1">
                  <div className="flex items-center justify-center gap-1.5 text-zinc-500 dark:text-zinc-400 text-2xs font-medium">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: pieColors[index % pieColors.length] }}></span>
                    <Icon className="h-3.5 w-3.5" />
                    <span>{item.name}</span>
                  </div>
                  <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50">{item.value}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Bottom Grid — 2x2 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Popular Listings */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-xl shadow-xs flex flex-col min-h-[440px] justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-zinc-500" />
                <h4 className="font-bold text-zinc-900 dark:text-zinc-50 text-sm">Top Viewed Assets</h4>
              </div>
              <div className="relative w-full sm:w-44">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search assets..."
                  value={popularSearch}
                  onChange={(e) => {
                    setPopularSearch(e.target.value)
                    setPopularPage(1)
                  }}
                  className="w-full pl-8 pr-2.5 py-1 text-3xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700/80 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-400 text-zinc-800 dark:text-zinc-200"
                />
              </div>
            </div>

            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {paginatedPopular.length === 0 ? (
                <div className="h-[250px] flex items-center justify-center text-zinc-400 dark:text-zinc-500 text-xs">
                  {popularSearch ? "No matching assets found." : "No views recorded yet."}
                </div>
              ) : (
                paginatedPopular.map((prop, idx) => {
                  const globalIdx = (popularPage - 1) * ITEMS_PER_PAGE + idx + 1
                  return (
                    <div key={idx} className="flex items-center justify-between py-3 first:pt-0 last:pb-0" title={prop.title}>
                      <div className="space-y-0.5 pr-4 truncate">
                        <p className="text-xs font-bold text-zinc-900 dark:text-zinc-50 truncate max-w-[200px] sm:max-w-[280px] md:max-w-[380px] lg:max-w-[500px]">{prop.title}</p>
                        <p className="text-3xs text-zinc-400 dark:text-zinc-500 font-medium">Rank #{globalIdx}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="px-2.5 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 text-2xs font-extrabold rounded-md border border-zinc-200/50 dark:border-zinc-700/50">
                          {prop.count} views
                        </span>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* Pagination Controls */}
          {filteredPopular.length > ITEMS_PER_PAGE && (
            <div className="flex items-center justify-between border-t border-zinc-150 dark:border-zinc-800 pt-3 mt-4">
              <button
                disabled={popularPage === 1}
                onClick={() => setPopularPage(p => Math.max(1, p - 1))}
                className="p-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
              >
                <ChevronLeft className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
              </button>
              <span className="text-3xs text-zinc-400 dark:text-zinc-500 font-medium">
                Page {popularPage} of {popularTotalPages}
              </span>
              <button
                disabled={popularPage === popularTotalPages}
                onClick={() => setPopularPage(p => Math.min(popularTotalPages, p + 1))}
                className="p-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
              >
                <ChevronRight className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
              </button>
            </div>
          )}
        </div>

        {/* Top Visited Locations */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-xl shadow-xs flex flex-col min-h-[440px] justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-zinc-500" />
                <h4 className="font-bold text-zinc-900 dark:text-zinc-50 text-sm">Top Visited Locations</h4>
              </div>
              <div className="relative w-full sm:w-44">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search locations..."
                  value={locationSearch}
                  onChange={(e) => {
                    setLocationSearch(e.target.value)
                    setLocationPage(1)
                  }}
                  className="w-full pl-8 pr-2.5 py-1 text-3xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700/80 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-400 text-zinc-800 dark:text-zinc-200"
                />
              </div>
            </div>

            <div className="space-y-4">
              {paginatedLocation.length === 0 ? (
                <div className="h-[250px] flex items-center justify-center text-zinc-400 dark:text-zinc-500 text-xs">
                  {locationSearch ? "No matching locations found." : "No location data recorded yet."}
                </div>
              ) : (
                paginatedLocation.map((loc, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-zinc-900 dark:text-zinc-50 truncate" title={`${loc.city}, ${loc.country}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-950 dark:bg-zinc-50 shrink-0"></span>
                        <span className="truncate max-w-[180px] sm:max-w-[260px] md:max-w-[360px] lg:max-w-[480px]">{loc.city}, {loc.country}</span>
                      </div>
                      <span className="text-zinc-500 dark:text-zinc-400 text-2xs font-extrabold shrink-0">
                        {loc.count} ({loc.percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-zinc-950 dark:bg-zinc-50 h-full rounded-full transition-all duration-500"
                        style={{ width: `${loc.percentage}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Pagination Controls */}
          {filteredLocation.length > ITEMS_PER_PAGE && (
            <div className="flex items-center justify-between border-t border-zinc-150 dark:border-zinc-800 pt-3 mt-4">
              <button
                disabled={locationPage === 1}
                onClick={() => setLocationPage(p => Math.max(1, p - 1))}
                className="p-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
              >
                <ChevronLeft className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
              </button>
              <span className="text-3xs text-zinc-400 dark:text-zinc-500 font-medium">
                Page {locationPage} of {locationTotalPages}
              </span>
              <button
                disabled={locationPage === locationTotalPages}
                onClick={() => setLocationPage(p => Math.min(locationTotalPages, p + 1))}
                className="p-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
              >
                <ChevronRight className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
              </button>
            </div>
          )}
        </div>

        {/* Real-time Activity Feed */}
        <div className="xl:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-xl shadow-xs flex flex-col min-h-[440px] justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-zinc-500" />
                <h4 className="font-bold text-zinc-900 dark:text-zinc-50 text-sm">Recent Traffic Activity</h4>
              </div>
              <div className="relative w-full sm:w-44">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search traffic logs..."
                  value={recentSearch}
                  onChange={(e) => {
                    setRecentSearch(e.target.value)
                    setRecentPage(1)
                  }}
                  className="w-full pl-8 pr-2.5 py-1 text-3xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700/80 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-400 text-zinc-800 dark:text-zinc-200"
                />
              </div>
            </div>

            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {paginatedRecent.length === 0 ? (
                <div className="h-[250px] flex items-center justify-center text-zinc-400 dark:text-zinc-500 text-xs">
                  {recentSearch ? "No matching logs found." : "No activity logged yet."}
                </div>
              ) : (
                paginatedRecent.map((view) => (
                  <div key={view.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0" title={view.propertyTitle}>
                    <div className="space-y-0.5 truncate pr-4">
                      <p className="text-xs font-bold text-zinc-900 dark:text-zinc-50 truncate max-w-[160px] sm:max-w-[240px] md:max-w-[340px] lg:max-w-[450px]">{view.propertyTitle}</p>
                      <div className="flex items-center gap-1.5 text-3xs text-zinc-400 dark:text-zinc-500 font-medium">
                        <span>{view.userLabel}</span>
                        <span>•</span>
                        <span>{view.source.toUpperCase()}</span>
                        {view.locationLabel && (
                          <>
                            <span>•</span>
                            <span className="text-zinc-600 dark:text-zinc-300 font-bold">{view.locationLabel}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0 font-sans">
                      <p className="text-2xs font-bold text-zinc-900 dark:text-zinc-50">
                        {new Date(view.viewedAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                      </p>
                      <p className="text-3xs text-zinc-400 dark:text-zinc-500 font-bold">
                        {view.device.toUpperCase()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Pagination Controls */}
          {filteredRecent.length > ITEMS_PER_PAGE && (
            <div className="flex items-center justify-between border-t border-zinc-150 dark:border-zinc-800 pt-3 mt-4">
              <button
                disabled={recentPage === 1}
                onClick={() => setRecentPage(p => Math.max(1, p - 1))}
                className="p-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
              >
                <ChevronLeft className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
              </button>
              <span className="text-3xs text-zinc-400 dark:text-zinc-500 font-medium">
                Page {recentPage} of {recentTotalPages}
              </span>
              <button
                disabled={recentPage === recentTotalPages}
                onClick={() => setRecentPage(p => Math.min(recentTotalPages, p + 1))}
                className="p-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
              >
                <ChevronRight className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
