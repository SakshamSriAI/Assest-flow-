import React, { useState, useMemo } from 'react'
import { useApp } from '../../context/AppContext'
import { AssetStateBadge, Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Card, CardHeader } from '../ui/Card'
import {
  BarChart3,
  TrendingUp,
  AlertTriangle,
  Clock,
  Calendar,
  Layers,
  Wrench,
  Download,
  Filter,
  CheckCircle2,
  DollarSign,
  ShieldAlert,
  Flame,
  PieChart,
  Activity,
  FileSpreadsheet,
  ChevronRight,
  Sparkles,
} from 'lucide-react'

export const ReportsScreen: React.FC = () => {
  const { assets, departments, categories, tickets, bookings, currentUser } = useApp()

  const [timeframe, setTimeframe] = useState<'30d' | 'q4' | 'ytd'>('q4')
  const [selectedDeptId, setSelectedDeptId] = useState<string>('all')
  const [downloadSuccess, setDownloadSuccess] = useState(false)

  // Filter assets by selected department
  const filteredAssets = useMemo(() => {
    if (selectedDeptId === 'all') return assets
    return assets.filter((a) => a.departmentId === selectedDeptId)
  }, [assets, selectedDeptId])

  // Utilization Stats
  const totalAssetsCount = filteredAssets.length
  const allocatedCount = filteredAssets.filter((a) => a.status === 'Allocated').length
  const availableCount = filteredAssets.filter((a) => a.status === 'Available').length
  const maintenanceCount = filteredAssets.filter((a) => a.status === 'Under Maintenance').length
  const lostCount = filteredAssets.filter((a) => a.status === 'Lost').length

  const utilizationRate = totalAssetsCount > 0
    ? Math.round((allocatedCount / totalAssetsCount) * 100)
    : 0

  const totalTrackedValue = filteredAssets.reduce((sum, a) => sum + (a.costTracking || 0), 0)

  // Department Utilization Breakdown
  const deptUtilization = useMemo(() => {
    return departments.map((dept) => {
      const deptAssets = assets.filter((a) => a.departmentId === dept.id)
      const allocated = deptAssets.filter((a) => a.status === 'Allocated').length
      const underMaint = deptAssets.filter((a) => a.status === 'Under Maintenance').length
      const rate = deptAssets.length > 0 ? Math.round((allocated / deptAssets.length) * 100) : 0
      return {
        ...dept,
        totalAssets: deptAssets.length,
        allocated,
        underMaint,
        rate,
      }
    })
  }, [departments, assets])

  // Category Breakdown
  const categoryBreakdown = useMemo(() => {
    return categories.map((cat) => {
      const catAssets = assets.filter((a) => a.categoryId === cat.id)
      const allocated = catAssets.filter((a) => a.status === 'Allocated').length
      const rate = catAssets.length > 0 ? Math.round((allocated / (catAssets.length || 1)) * 100) : 0
      return {
        ...cat,
        total: catAssets.length,
        allocated,
        rate,
      }
    })
  }, [categories, assets])

  // Nearing Retirement / Warranty Expiry Assets (< 90 days from today 2026-10-30 or past lifespan)
  const nearingRetirementAssets = useMemo(() => {
    return assets
      .map((a) => {
        // Calculate consumed depreciation lifespan
        const commissionYear = a.commissionDate ? parseInt(a.commissionDate.split('-')[0]) : 2022
        const category = categories.find((c) => c.id === a.categoryId)
        const lifespanYears = category?.depreciationLifespanYears || 4
        const yearsActive = 2026 - commissionYear
        const consumedPct = Math.min(100, Math.round((yearsActive / lifespanYears) * 100))

        // Warranty check
        const expiryDate = a.warrantyExpiryDate || '2027-01-01'
        const isExpiringSoon = expiryDate <= '2027-01-31'
        const isOverdue = expiryDate < '2026-10-30'

        return {
          ...a,
          consumedPct,
          lifespanYears,
          expiryDate,
          isExpiringSoon,
          isOverdue,
          urgency: isOverdue ? 'Imminent < 30 Days' : isExpiringSoon ? 'Approaching < 90 Days' : 'Healthy Lifespan',
        }
      })
      .sort((a, b) => b.consumedPct - a.consumedPct)
  }, [assets, categories])

  // Maintenance Category Breakdown
  const ticketsByCategory = useMemo(() => {
    const counts: Record<string, number> = {}
    tickets.forEach((t) => {
      const a = assets.find((asset) => asset.id === t.assetId)
      const catName = a?.categoryName || 'Other Hardware'
      counts[catName] = (counts[catName] || 0) + 1
    })
    return Object.entries(counts).map(([name, count]) => ({ name, count }))
  }, [tickets, assets])

  // Heatmap Data (Days x Hours)
  const heatmapDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
  const heatmapHours = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18]

  // Mocked realistic booking density per day/hour (0 to 100%)
  const getBookingDensity = (day: string, hour: number) => {
    // Peak hours: 10:00 - 12:00 and 14:00 - 16:00
    if (hour >= 14 && hour <= 16) return day === 'Wed' || day === 'Thu' ? 95 : 82
    if (hour >= 10 && hour <= 12) return day === 'Tue' || day === 'Wed' ? 88 : 75
    if (hour === 13) return 40
    if (hour >= 17) return 30
    if (hour === 8) return 20
    return 60
  }

  const getHeatmapColor = (density: number) => {
    if (density >= 90) return 'bg-indigo-700 text-white font-bold'
    if (density >= 75) return 'bg-indigo-500 text-white'
    if (density >= 50) return 'bg-indigo-300 text-slate-900'
    if (density >= 30) return 'bg-indigo-100 text-indigo-800'
    return 'bg-slate-50 text-slate-400'
  }

  const handleExportCSV = () => {
    setDownloadSuccess(true)
    setTimeout(() => setDownloadSuccess(false), 2500)
  }

  return (
    <div className="space-y-6">
      {/* Screen Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-[#0F172A] tracking-tight font-heading">
              Reports & Analytics
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE] flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-[#2563EB]" />
              Real-time Analytics
            </span>
          </div>
        </div>

        {/* Action Controls & Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Timeframe pill selector */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs">
            <button
              onClick={() => setTimeframe('30d')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                timeframe === '30d' ? 'bg-white text-indigo-700 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              30 Days
            </button>
            <button
              onClick={() => setTimeframe('q4')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                timeframe === 'q4' ? 'bg-white text-indigo-700 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Q4 Current
            </button>
            <button
              onClick={() => setTimeframe('ytd')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                timeframe === 'ytd' ? 'bg-white text-indigo-700 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              YTD 2026
            </button>
          </div>

          {/* Department Filter */}
          <select
            value={selectedDeptId}
            onChange={(e) => setSelectedDeptId(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Enterprise Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>

          {/* Export button */}
          <Button
            variant="secondary"
            size="sm"
            onClick={handleExportCSV}
            leftIcon={downloadSuccess ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Download className="w-4 h-4" />}
          >
            {downloadSuccess ? 'Dataset Exported!' : 'Export CSV'}
          </Button>
        </div>
      </div>

      {/* Top Telemetry Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-3.5 rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50/50 to-white shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Fleet Utilization</span>
            <BarChart3 className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-indigo-700 font-mono">{utilizationRate}%</span>
            <span className="text-[11px] text-indigo-600 font-medium">{allocatedCount} of {totalAssetsCount} deployed</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-emerald-100 bg-gradient-to-br from-emerald-50/50 to-white shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Tracked Asset Value</span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-700 font-mono">
              ${(totalTrackedValue / 1000).toFixed(1)}k
            </span>
            <span className="text-[11px] text-emerald-600 font-medium">Non-GL cost basis</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-amber-100 bg-gradient-to-br from-amber-50/50 to-white shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Active Work Orders</span>
            <Wrench className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-700 font-mono">
              {tickets.filter((t) => t.status !== 'Resolved').length}
            </span>
            <span className="text-[11px] text-amber-600 font-medium">Avg MTTR: 18.4 hrs</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-rose-100 bg-gradient-to-br from-rose-50/50 to-white shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Nearing Retirement</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-rose-700 font-mono">
              {nearingRetirementAssets.filter((a) => a.consumedPct >= 80).length}
            </span>
            <span className="text-[11px] text-rose-600 font-medium">&gt;80% lifespan consumed</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: ASSET UTILIZATION & DEPARTMENT ALLOCATION */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Department Utilization Bars */}
        <div className="lg:col-span-7 space-y-4">
          <Card>
            <CardHeader
              title="Department Deployment & Allocation Rates"
            />
            <div className="space-y-4 pt-2">
              {deptUtilization.map((dept) => (
                <div key={dept.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800">{dept.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-slate-500 text-[11px]">
                        {dept.allocated}/{dept.totalAssets} Allocated
                      </span>
                      <span className="font-mono font-bold text-indigo-700">{dept.rate}%</span>
                    </div>
                  </div>

                  {/* Horizontal Segmented Bar */}
                  <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden flex">
                    <div
                      style={{ width: `${dept.rate}%` }}
                      className="bg-indigo-600 h-full transition-all"
                      title={`${dept.rate}% Allocated`}
                    />
                    <div
                      style={{
                        width: `${dept.totalAssets > 0 ? (dept.underMaint / dept.totalAssets) * 100 : 0}%`,
                      }}
                      className="bg-amber-400 h-full transition-all"
                      title="Under Maintenance"
                    />
                  </div>
                </div>
              ))}

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-indigo-600 inline-block" />
                    Allocated to Personnel
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-amber-400 inline-block" />
                    Under Maintenance
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-slate-200 inline-block" />
                    Available Pool
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Category Allocation Density */}
        <div className="lg:col-span-5 space-y-4">
          <Card>
            <CardHeader
              title="Category Allocation Density"
            />
            <div className="space-y-3 pt-2">
              {categoryBreakdown.map((cat) => (
                <div
                  key={cat.id}
                  className="p-3 rounded-lg border border-slate-100 bg-slate-50/60 flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <span className="font-semibold text-slate-800 block">{cat.name}</span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      Lifespan: {cat.depreciationLifespanYears} yrs &bull; {cat.total} units
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-indigo-700 font-mono block">
                      {cat.rate}%
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {cat.allocated} in custody
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 2: MAINTENANCE FREQUENCY & FAILURE DISTRIBUTION */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 space-y-4">
          <Card>
            <CardHeader
              title="Incident Frequency by Hardware Category"
            />
            <div className="space-y-3 pt-2">
              {ticketsByCategory.map((item) => {
                const totalTickets = tickets.length || 1
                const pct = Math.round((item.count / totalTickets) * 100)
                return (
                  <div key={item.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-800">{item.name}</span>
                      <span className="font-mono text-slate-600 font-semibold">
                        {item.count} tickets ({pct}%)
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        style={{ width: `${pct}%` }}
                        className="bg-amber-500 h-full rounded-full transition-all"
                      />
                    </div>
                  </div>
                )
              })}

              <div className="p-3 rounded-lg bg-amber-50/70 border border-amber-200 text-xs text-amber-900 flex items-start gap-2 mt-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                <div>
                  <span className="font-semibold block">Failure Pattern Telemetry:</span>
                  <span>
                    Enterprise Servers & Computing Laptops exhibit 68% of quarterly work orders, primarily PSU voltage regulation and trackpad haptic faults.
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-6 space-y-4">
          <Card>
            <CardHeader
              title="Certified Technician Resolution Metrics"
            />
            <div className="space-y-3 pt-2">
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="block text-slate-900 font-bold text-lg font-mono">18.4 hrs</span>
                  <span className="text-[10px] text-slate-500">Mean Time to Repair</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="block text-emerald-700 font-bold text-lg font-mono">94.2%</span>
                  <span className="text-[10px] text-slate-500">First-Time Fix Rate</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="block text-indigo-700 font-bold text-lg font-mono">100%</span>
                  <span className="text-[10px] text-slate-500">QA Compliance Pass</span>
                </div>
              </div>

              {/* Vendor Performance Rows */}
              <div className="space-y-2 pt-1 text-xs">
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="font-semibold text-slate-800">Apex Enterprise Field Support</span>
                  <span className="text-[11px] font-mono text-emerald-600 font-medium">Avg 12h resolution &bull; 4 tickets</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="font-semibold text-slate-800">Internal Hardware Depot (Marcus S.)</span>
                  <span className="text-[11px] font-mono text-emerald-600 font-medium">Avg 6h resolution &bull; 8 tickets</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="font-semibold text-slate-800">Tesla Mobile Service Team</span>
                  <span className="text-[11px] font-mono text-[#2563EB] font-medium">Scheduled periodic &bull; 2 tickets</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 3: NEARING-RETIREMENT & DEPRECIATION ALERTS */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        <Card>
          <CardHeader
            title="Approaching End-of-Life & Warranty Expiration Radar"
          />
          <div className="overflow-x-auto pt-2">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-4">Asset Tag & Model</th>
                  <th className="py-3 px-4">Department & Category</th>
                  <th className="py-3 px-4">Warranty Expiration</th>
                  <th className="py-3 px-4">Lifespan Consumed</th>
                  <th className="py-3 px-4">Retirement Urgency</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {nearingRetirementAssets.slice(0, 6).map((asset) => {
                  const isHighUrgency = asset.consumedPct >= 80

                  return (
                    <tr
                      key={asset.id}
                      className={`hover:bg-slate-50/70 transition-colors ${
                        isHighUrgency ? 'bg-amber-50/20' : ''
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{asset.name}</div>
                        <div className="font-mono text-[10px] text-slate-500">{asset.tag}</div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="text-slate-800">{asset.departmentName}</div>
                        <div className="text-[10px] text-slate-500">{asset.categoryName}</div>
                      </td>

                      <td className="py-3 px-4 font-mono">
                        <span
                          className={
                            asset.isOverdue
                              ? 'text-rose-600 font-bold'
                              : asset.isExpiringSoon
                              ? 'text-amber-600 font-semibold'
                              : 'text-slate-700'
                          }
                        >
                          {asset.expiryDate}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 rounded-full bg-slate-200 overflow-hidden">
                            <div
                              style={{ width: `${asset.consumedPct}%` }}
                              className={`h-full rounded-full ${
                                asset.consumedPct >= 80
                                  ? 'bg-rose-500'
                                  : asset.consumedPct >= 60
                                  ? 'bg-amber-500'
                                  : 'bg-emerald-500'
                              }`}
                            />
                          </div>
                          <span className="font-mono text-[11px] font-bold text-slate-700">
                            {asset.consumedPct}%
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full inline-block ${
                            asset.isOverdue
                              ? 'bg-rose-100 text-rose-800'
                              : asset.isExpiringSoon
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-50 text-emerald-700'
                          }`}
                        >
                          {asset.urgency}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <AssetStateBadge status={asset.status} size="xs" />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 4: SHARED RESOURCE BOOKING HEATMAP */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        <Card>
          <CardHeader
            title="Shared Resource Hourly Booking Heatmap"
          />
          <div className="pt-2 space-y-4">
            <div className="overflow-x-auto">
              <div className="min-w-[700px]">
                {/* Heatmap Grid Header (Hours: 08:00 - 18:00) */}
                <div className="grid grid-cols-12 gap-1 text-center font-mono text-[10px] text-slate-500 font-semibold mb-1">
                  <div className="text-left font-sans text-slate-700">Day / Hour</div>
                  {heatmapHours.map((h) => (
                    <div key={h}>{h}:00</div>
                  ))}
                </div>

                {/* Heatmap Rows (Monday - Friday) */}
                <div className="space-y-1.5">
                  {heatmapDays.map((day) => (
                    <div key={day} className="grid grid-cols-12 gap-1 items-center">
                      <div className="text-xs font-semibold text-slate-700">{day}</div>
                      {heatmapHours.map((h) => {
                        const density = getBookingDensity(day, h)
                        return (
                          <div
                            key={h}
                            title={`${day} at ${h}:00 &mdash; ${density}% Reserved`}
                            className={`h-8 rounded flex items-center justify-center text-[10px] transition-transform hover:scale-105 cursor-pointer shadow-2xs ${getHeatmapColor(
                              density
                            )}`}
                          >
                            {density}%
                          </div>
                        )
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Heatmap Legend */}
            <div className="flex flex-wrap items-center justify-between pt-3 border-t border-slate-100 text-[11px] text-slate-500">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-700">Occupancy Scale:</span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-xs bg-slate-100 inline-block border border-slate-200" /> &lt;20%
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-xs bg-indigo-100 inline-block" /> 30%
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-xs bg-indigo-300 inline-block" /> 60%
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-xs bg-indigo-500 inline-block" /> 80%
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-xs bg-indigo-700 inline-block" /> 95%+ Peak
                </span>
              </div>

              <div className="text-slate-600 font-medium">
                Peak Window: <strong className="text-indigo-700">Wednesday & Thursday 14:00 &ndash; 16:00</strong>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
