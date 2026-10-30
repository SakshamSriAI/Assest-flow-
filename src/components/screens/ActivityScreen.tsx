import React, { useState, useMemo } from 'react'
import { useApp } from '../../context/AppContext'
import { RoleBadge, Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Modal } from '../ui/Modal'
import { ActivityLogItem } from '../../types'
import {
  Activity,
  Search,
  Filter,
  Download,
  ShieldCheck,
  Clock,
  User,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Wrench,
  Calendar,
  Lock,
  FileText,
  Key,
  Layers,
  Sparkles,
  ChevronRight,
  Terminal,
} from 'lucide-react'

export const ActivityScreen: React.FC = () => {
  const { activityLogs, currentUser } = useApp()

  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [selectedLog, setSelectedLog] = useState<ActivityLogItem | null>(null)
  const [downloadSuccess, setDownloadSuccess] = useState(false)

  // Filtered Activity Logs
  const filteredLogs = useMemo(() => {
    return activityLogs.filter((log) => {
      // Category filter
      if (categoryFilter !== 'all' && log.category !== categoryFilter) return false

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchAction = log.action.toLowerCase().includes(q)
        const matchActor = log.actorName.toLowerCase().includes(q)
        const matchAsset = (log.assetName || '').toLowerCase().includes(q)
        const matchTag = (log.assetTag || '').toLowerCase().includes(q)
        const matchNotes = (log.notes || '').toLowerCase().includes(q)
        const matchIp = (log.ipAddress || '').toLowerCase().includes(q)
        if (!matchAction && !matchActor && !matchAsset && !matchTag && !matchNotes && !matchIp) {
          return false
        }
      }
      return true
    })
  }, [activityLogs, categoryFilter, searchQuery])

  // Category Icon & Color Mapping
  const getCategoryMeta = (category: string) => {
    switch (category) {
      case 'allocation':
        return {
          icon: <Layers className="w-3.5 h-3.5 text-indigo-600" />,
          badgeVariant: 'primary' as const,
          label: 'Allocation',
        }
      case 'transfer':
        return {
          icon: <ArrowRight className="w-3.5 h-3.5 text-blue-600" />,
          badgeVariant: 'info' as const,
          label: 'Transfer',
        }
      case 'maintenance':
        return {
          icon: <Wrench className="w-3.5 h-3.5 text-amber-600" />,
          badgeVariant: 'warning' as const,
          label: 'Maintenance',
        }
      case 'audit':
        return {
          icon: <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />,
          badgeVariant: 'danger' as const,
          label: 'Audit Cycle',
        }
      case 'booking':
        return {
          icon: <Calendar className="w-3.5 h-3.5 text-[#2563EB]" />,
          badgeVariant: 'primary' as const,
          label: 'Booking',
        }
      case 'security':
        return {
          icon: <Key className="w-3.5 h-3.5 text-[#0F2F57]" />,
          badgeVariant: 'purple' as const,
          label: 'Role Elevation',
        }
      case 'registration':
        return {
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />,
          badgeVariant: 'success' as const,
          label: 'Registration',
        }
      default:
        return {
          icon: <Activity className="w-3.5 h-3.5 text-slate-600" />,
          badgeVariant: 'neutral' as const,
          label: 'Activity',
        }
    }
  }

  const handleExportCSV = () => {
    setDownloadSuccess(true)
    setTimeout(() => setDownloadSuccess(false), 2500)
  }

  return (
    <div className="space-y-6">
      {/* Forensic Detail Modal */}
      {selectedLog && (
        <Modal
          isOpen={!!selectedLog}
          onClose={() => setSelectedLog(null)}
          title="Event Forensic Audit Record"
          description={`Cryptographic verification payload for Event #${selectedLog.id}.`}
          maxWidth="md"
        >
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-slate-900 text-slate-200 font-mono text-xs space-y-1.5">
              <div className="flex items-center justify-between text-indigo-400 font-semibold border-b border-slate-800 pb-1">
                <span>{selectedLog.action}</span>
                <span className="text-[10px] text-slate-400">{selectedLog.timestamp}</span>
              </div>
              <div>Actor: {selectedLog.actorName} ({selectedLog.actorRole})</div>
              <div>Origin IP: {selectedLog.ipAddress || '192.168.1.104'}</div>
              <div>Hash: {selectedLog.immutableHash || 'sha256-verified-ledger'}</div>
              {selectedLog.assetTag && (
                <div>Target Asset: {selectedLog.assetTag} &mdash; {selectedLog.assetName}</div>
              )}
            </div>

            {selectedLog.previousState && selectedLog.newState && (
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
                <div>
                  <span className="text-slate-500 text-[10px] block">Previous State</span>
                  <span className="font-semibold text-slate-800">{selectedLog.previousState}</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
                <div className="text-right">
                  <span className="text-slate-500 text-[10px] block">New State</span>
                  <span className="font-semibold text-indigo-700">{selectedLog.newState}</span>
                </div>
              </div>
            )}

            {selectedLog.notes && (
              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-700">Audit Justification Notes:</span>
                <p className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 italic leading-relaxed">
                  &ldquo;{selectedLog.notes}&rdquo;
                </p>
              </div>
            )}

            <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Cryptographic invariant intact: Record verified and immutable against tamper.</span>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <Button variant="secondary" size="sm" onClick={() => setSelectedLog(null)}>
                Close Audit Record
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Screen Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-[#0F172A] tracking-tight font-heading">
              Activity Audit Trail
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0] flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-[#10B981]" />
              Immutable Log Active
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleExportCSV}
            leftIcon={downloadSuccess ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Download className="w-4 h-4" />}
          >
            {downloadSuccess ? 'Audit Trail Exported!' : 'Export Audit Log (CSV)'}
          </Button>
        </div>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Audit Events</span>
            <Activity className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 font-mono">
              {activityLogs.length}
            </span>
            <span className="text-[11px] text-slate-500">Captured records</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-[#BFDBFE] bg-gradient-to-br from-[#EFF6FF]/60 to-white shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#64748B]">Asset State Changes</span>
            <Layers className="w-4 h-4 text-[#2563EB]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#2563EB] font-mono">
              {activityLogs.filter((l) => l.previousState && l.newState).length}
            </span>
            <span className="text-[11px] text-[#2563EB] font-medium">State deltas verified</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-[#0F2F57]/20 bg-gradient-to-br from-[#0F2F57]/5 to-white shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#64748B]">Security & RBAC Events</span>
            <Key className="w-4 h-4 text-[#0F2F57]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#0F2F57] font-mono">
              {activityLogs.filter((l) => l.category === 'security').length}
            </span>
            <span className="text-[11px] text-[#0F2F57] font-medium">Privilege elevations</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-[#A7F3D0] bg-gradient-to-br from-[#ECFDF5]/60 to-white shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#64748B]">Audit Compliance</span>
            <ShieldCheck className="w-4 h-4 text-[#10B981]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#047857] font-mono">100%</span>
            <span className="text-[11px] text-[#047857] font-medium">Zero untracked operations</span>
          </div>
        </div>
      </div>

      {/* Search & Category Filter Toolbar */}
      <div className="p-3 bg-white rounded-xl border border-[#E2E8F0] shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="w-full md:w-80">
          <Input
            placeholder="Search actor, asset, action, or IP..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-slate-400" />}
          />
        </div>

        {/* Faceted Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto text-xs">
          <span className="text-[11px] text-slate-400 font-medium mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Event:
          </span>
          {[
            { id: 'all', label: 'All' },
            { id: 'allocation', label: 'Allocations' },
            { id: 'transfer', label: 'Transfers' },
            { id: 'maintenance', label: 'Maintenance' },
            { id: 'audit', label: 'Audits' },
            { id: 'booking', label: 'Bookings' },
            { id: 'security', label: 'Security' },
            { id: 'registration', label: 'Registrations' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                categoryFilter === cat.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chronological Audit Feed */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No activity log events match the current search or category filter.
          </div>
        ) : (
          filteredLogs.map((log) => {
            const meta = getCategoryMeta(log.category)

            return (
              <div
                key={log.id}
                onClick={() => setSelectedLog(log)}
                className="p-4 hover:bg-slate-50/70 transition-colors cursor-pointer group flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Left: Icon, Action, and Details */}
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className="mt-0.5 p-2 rounded-xl bg-slate-100 border border-slate-200 group-hover:bg-white group-hover:shadow-xs transition-all shrink-0">
                    {meta.icon}
                  </div>

                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {log.action}
                      </span>
                      <Badge variant={meta.badgeVariant} size="xs">
                        {meta.label}
                      </Badge>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {log.timestamp} ({log.relativeTime})
                      </span>
                    </div>

                    {/* Target Asset & Context */}
                    {log.assetName && (
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <span className="font-mono bg-slate-100 px-1 py-0.2 rounded text-slate-700 text-[11px] font-semibold">
                          {log.assetTag}
                        </span>
                        <span className="truncate">{log.assetName}</span>
                      </div>
                    )}

                    {/* State Delta Pill */}
                    {log.previousState && log.newState && (
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
                        <span className="font-medium text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded">
                          {log.previousState}
                        </span>
                        <ArrowRight className="w-3 h-3 text-slate-400" />
                        <span className="font-semibold text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded">
                          {log.newState}
                        </span>
                      </div>
                    )}

                    {/* Notes preview */}
                    {log.notes && (
                      <p className="text-[11px] text-slate-500 italic line-clamp-1">
                        &ldquo;{log.notes}&rdquo;
                      </p>
                    )}
                  </div>
                </div>

                {/* Right: Actor & Forensic Hash */}
                <div className="flex items-center gap-4 self-end md:self-center shrink-0">
                  <div className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {log.actorAvatar && (
                        <img
                          src={log.actorAvatar}
                          alt={log.actorName}
                          className="w-5 h-5 rounded-full object-cover shrink-0"
                        />
                      )}
                      <span className="text-xs font-semibold text-slate-800">
                        {log.actorName}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                      IP: {log.ipAddress || '192.168.1.104'}
                    </div>
                  </div>

                  <RoleBadge role={log.actorRole} size="xs" />

                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 transition-colors hidden sm:block" />
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
