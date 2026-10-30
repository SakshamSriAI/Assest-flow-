import React, { useState, useMemo } from 'react'
import { useApp } from '../../context/AppContext'
import { AuditBadge, AssetStateBadge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Card, CardHeader } from '../ui/Card'
import { CreateAuditCycleModal } from '../audits/CreateAuditCycleModal'
import { LockAuditCycleModal } from '../audits/LockAuditCycleModal'
import { AuditCycle, AuditStatus, AuditItem } from '../../types'
import {
  ClipboardCheck,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Lock,
  Unlock,
  User,
  MapPin,
  Calendar,
  ShieldCheck,
  FileSpreadsheet,
  AlertOctagon,
  ArrowRight,
  Info,
} from 'lucide-react'

export const AuditsScreen: React.FC = () => {
  const {
    auditCycles,
    currentUser,
    updateAuditItemStatus,
    lockAndCloseAuditCycle,
  } = useApp()

  // State
  const [selectedCycleId, setSelectedCycleId] = useState<string>(
    auditCycles[0]?.id || ''
  )
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'checklist' | 'discrepancy'>('checklist')

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [lockModalCycle, setLockModalCycle] = useState<AuditCycle | null>(null)

  // Current cycle
  const currentCycle = useMemo(() => {
    return auditCycles.find((c) => c.id === selectedCycleId) || auditCycles[0]
  }, [auditCycles, selectedCycleId])

  // Ensure selected cycle stays synced
  React.useEffect(() => {
    if (!selectedCycleId && auditCycles.length > 0) {
      setSelectedCycleId(auditCycles[0].id)
    }
  }, [auditCycles, selectedCycleId])

  // Role permissions
  const canManageAudit =
    currentUser.role === 'admin' ||
    currentUser.role === 'asset_manager' ||
    currentUser.role === 'department_head'

  // Items stats for current cycle
  const items = currentCycle?.items || []
  const verifiedCount = items.filter((i) => i.status === 'Verified').length
  const missingCount = items.filter((i) => i.status === 'Missing').length
  const damagedCount = items.filter((i) => i.status === 'Damaged').length
  const pendingCount = items.filter((i) => i.status === 'Pending').length
  const totalCount = items.length

  const percentComplete =
    totalCount > 0 ? Math.round(((totalCount - pendingCount) / totalCount) * 100) : 0

  // Filtered items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Status filter
      if (statusFilter !== 'all' && item.status !== statusFilter) return false

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchTag = item.assetTag.toLowerCase().includes(q)
        const matchName = item.assetName.toLowerCase().includes(q)
        const matchHolder = (item.expectedHolderName || '').toLowerCase().includes(q)
        const matchLocation = item.location.toLowerCase().includes(q)
        const matchSerial = (item.serialNumber || '').toLowerCase().includes(q)
        if (!matchTag && !matchName && !matchHolder && !matchLocation && !matchSerial) {
          return false
        }
      }
      return true
    })
  }, [items, statusFilter, searchQuery])

  // Discrepancy items (Missing or Damaged)
  const discrepancyItems = useMemo(() => {
    return items.filter((i) => i.status === 'Missing' || i.status === 'Damaged')
  }, [items])

  const handleMarkStatus = (item: AuditItem, newStatus: AuditStatus) => {
    if (!currentCycle || currentCycle.status === 'Locked') return
    updateAuditItemStatus(currentCycle.id, item.id, newStatus)
  }

  const handleNoteChange = (item: AuditItem, notes: string) => {
    if (!currentCycle || currentCycle.status === 'Locked') return
    updateAuditItemStatus(currentCycle.id, item.id, item.status, notes)
  }

  const handleLockCycle = (cycleId: string) => {
    lockAndCloseAuditCycle(cycleId)
  }

  return (
    <div className="space-y-6">
      {/* Modals */}
      <CreateAuditCycleModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCycleCreated={(newId) => setSelectedCycleId(newId)}
      />

      <LockAuditCycleModal
        isOpen={!!lockModalCycle}
        onClose={() => setLockModalCycle(null)}
        cycle={lockModalCycle}
        onLockConfirmed={handleLockCycle}
      />

      {/* Screen Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-[#0F172A] tracking-tight font-heading">
              Physical Audits
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A] flex items-center gap-1">
              <ClipboardCheck className="w-3 h-3 text-[#B45309]" />
              Audit Ledger Active
            </span>
          </div>
        </div>

        {canManageAudit && (
          <div className="flex items-center gap-2.5">
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsCreateModalOpen(true)}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              New Audit Cycle
            </Button>
          </div>
        )}
      </div>

      {/* Top Telemetry Metric Cards across All Cycles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Audit Cycles</span>
            <ClipboardCheck className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 font-mono">
              {auditCycles.length}
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              ({auditCycles.filter((c) => c.status === 'Active').length} Active)
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-emerald-100 bg-gradient-to-br from-emerald-50/50 to-white shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Verified in Cycle</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-700 font-mono">{verifiedCount}</span>
            <span className="text-[11px] text-emerald-600 font-medium">Physical match confirmed</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-rose-100 bg-gradient-to-br from-rose-50/50 to-white shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Missing Discrepancies</span>
            <AlertOctagon className="w-4 h-4 text-rose-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-rose-700 font-mono">{missingCount}</span>
            <span className="text-[11px] text-rose-600 font-medium">
              Auto-shifts to &ldquo;Lost&rdquo; on close
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-amber-100 bg-gradient-to-br from-amber-50/50 to-white shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Damaged Equipment</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-700 font-mono">{damagedCount}</span>
            <span className="text-[11px] text-amber-600 font-medium">Flagged for repair</span>
          </div>
        </div>
      </div>

      {/* Audit Cycle Focus Selector & Progress Hero */}
      {currentCycle && (
        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Cycle Selector & Meta */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Active Cycle:
                </span>
                <select
                  value={selectedCycleId}
                  onChange={(e) => setSelectedCycleId(e.target.value)}
                  className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-500"
                >
                  {auditCycles.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.cycleCode}: {c.name} ({c.status})
                    </option>
                  ))}
                </select>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                    currentCycle.status === 'Active'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : 'bg-slate-100 text-slate-700 border border-slate-300'
                  }`}
                >
                  {currentCycle.status === 'Active' ? (
                    <>
                      <Unlock className="w-3 h-3 text-emerald-600" /> Active Verification
                    </>
                  ) : (
                    <>
                      <Lock className="w-3 h-3 text-slate-500" /> Locked & Finalized
                    </>
                  )}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-1">
                <span className="flex items-center gap-1 font-medium">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  Lead: {currentCycle.leadAuditorName}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {currentCycle.location}
                </span>
                <span className="flex items-center gap-1 text-slate-500">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Target Due: {currentCycle.dueDate}
                </span>
                {currentCycle.closedAt && (
                  <span className="text-slate-500 italic">
                    Closed: {currentCycle.closedAt}
                  </span>
                )}
              </div>
            </div>

            {/* Lock Action Button */}
            {canManageAudit && currentCycle.status === 'Active' && (
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => setLockModalCycle(currentCycle)}
                  leftIcon={<Lock className="w-4 h-4" />}
                >
                  Lock & Close Cycle
                </Button>
              </div>
            )}
          </div>

          {/* Progress Bar & Summary Stats */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                Physical Audit Completion Rate: {percentComplete}%
              </span>
              <span className="font-mono text-slate-600">
                {totalCount - pendingCount} of {totalCount} Assets Audited
              </span>
            </div>

            {/* Segmented Progress Bar */}
            <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden flex">
              <div
                style={{ width: `${(verifiedCount / (totalCount || 1)) * 100}%` }}
                className="bg-emerald-500 h-full transition-all"
                title={`Verified: ${verifiedCount}`}
              />
              <div
                style={{ width: `${(missingCount / (totalCount || 1)) * 100}%` }}
                className="bg-rose-500 h-full transition-all"
                title={`Missing: ${missingCount}`}
              />
              <div
                style={{ width: `${(damagedCount / (totalCount || 1)) * 100}%` }}
                className="bg-amber-500 h-full transition-all"
                title={`Damaged: ${damagedCount}`}
              />
            </div>

            {/* Progress Legend */}
            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                  Verified: {verifiedCount}
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
                  Missing: {missingCount}
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                  Damaged: {damagedCount}
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-slate-300 inline-block" />
                  Pending: {pendingCount}
                </span>
              </div>

              {currentCycle.discrepancyReportSummary && (
                <span className="text-slate-600 font-medium italic">
                  {currentCycle.discrepancyReportSummary}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tabs: Checklist vs Discrepancies */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('checklist')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === 'checklist'
                ? 'bg-slate-900 text-white shadow-xs font-semibold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <ClipboardCheck className="w-3.5 h-3.5" />
            Auditor Verification Checklist ({items.length})
          </button>

          <button
            onClick={() => setActiveTab('discrepancy')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === 'discrepancy'
                ? 'bg-rose-600 text-white shadow-xs font-semibold'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Discrepancy Report Preview ({discrepancyItems.length})
          </button>
        </div>

        {/* Status Filters */}
        {activeTab === 'checklist' && (
          <div className="flex items-center gap-1 text-xs">
            <span className="text-[11px] text-slate-400 font-medium mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3" /> State:
            </span>
            {(['all', 'Pending', 'Verified', 'Missing', 'Damaged'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  statusFilter === s
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {s === 'all' ? 'All' : s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: AUDITOR VERIFICATION CHECKLIST */}
      {/* ========================================================================= */}
      {activeTab === 'checklist' && (
        <div className="space-y-4">
          {/* Search bar */}
          <div className="w-full md:w-80">
            <Input
              placeholder="Filter by tag, asset, serial, holder..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-4 h-4 text-slate-400" />}
            />
          </div>

          {/* Checklist Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                    <th className="py-3 px-4">Asset Identification</th>
                    <th className="py-3 px-4">Expected Custody</th>
                    <th className="py-3 px-4">Verification State</th>
                    <th className="py-3 px-4">Auditor Inspection Notes</th>
                    <th className="py-3 px-4 text-right">Physical Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredItems.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">
                        No assets in this audit cycle match current filters.
                      </td>
                    </tr>
                  ) : (
                    filteredItems.map((item) => {
                      const isLocked = currentCycle?.status === 'Locked'

                      return (
                        <tr
                          key={item.id}
                          className={`hover:bg-slate-50/70 transition-colors ${
                            item.status === 'Missing'
                              ? 'bg-rose-50/30'
                              : item.status === 'Damaged'
                              ? 'bg-amber-50/30'
                              : ''
                          }`}
                        >
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-slate-900">{item.assetName}</div>
                            <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                              <span className="font-mono font-bold bg-slate-100 px-1 py-0.2 rounded text-slate-700">
                                {item.assetTag}
                              </span>
                              {item.serialNumber && (
                                <span className="font-mono text-slate-600">
                                  S/N: {item.serialNumber}
                                </span>
                              )}
                              <span className="text-slate-400">|</span>
                              <span className="truncate">{item.categoryName}</span>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="font-medium text-slate-800">
                              {item.expectedHolderName}
                            </div>
                            <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-0.5">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              {item.location}
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <AuditBadge status={item.status} size="sm" />
                            {item.auditedAt && (
                              <div className="text-[10px] text-slate-400 mt-0.5">
                                {item.auditedAt}
                              </div>
                            )}
                          </td>

                          <td className="py-3.5 px-4 max-w-xs">
                            {isLocked ? (
                              <span className="text-slate-600 italic">
                                {item.notes || 'No auditor notes logged.'}
                              </span>
                            ) : (
                              <input
                                type="text"
                                value={item.notes || ''}
                                onChange={(e) => handleNoteChange(item, e.target.value)}
                                placeholder="Add verification remarks..."
                                className="w-full text-xs bg-slate-50 border border-slate-200 rounded px-2 py-1 text-slate-800 focus:bg-white focus:outline-none focus:border-indigo-500"
                              />
                            )}
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            {!isLocked ? (
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleMarkStatus(item, 'Verified')}
                                  title="Mark physically verified"
                                  className={`px-2 py-1 rounded text-[11px] font-semibold transition-all ${
                                    item.status === 'Verified'
                                      ? 'bg-emerald-600 text-white shadow-xs'
                                      : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                  }`}
                                >
                                  Verified
                                </button>
                                <button
                                  onClick={() => handleMarkStatus(item, 'Missing')}
                                  title="Mark as missing equipment"
                                  className={`px-2 py-1 rounded text-[11px] font-semibold transition-all ${
                                    item.status === 'Missing'
                                      ? 'bg-rose-600 text-white shadow-xs'
                                      : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                                  }`}
                                >
                                  Missing
                                </button>
                                <button
                                  onClick={() => handleMarkStatus(item, 'Damaged')}
                                  title="Mark as damaged or defective"
                                  className={`px-2 py-1 rounded text-[11px] font-semibold transition-all ${
                                    item.status === 'Damaged'
                                      ? 'bg-amber-600 text-white shadow-xs'
                                      : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                                  }`}
                                >
                                  Damaged
                                </button>
                              </div>
                            ) : (
                              <span className="text-[11px] text-slate-400 font-mono">
                                Verified by {item.auditedByUserName || 'Auditor'}
                              </span>
                            )}
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: DISCREPANCY REPORT PREVIEW */}
      {/* ========================================================================= */}
      {activeTab === 'discrepancy' && (
        <div className="space-y-4">
          {/* Discrepancy Alert Header */}
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900 flex items-start gap-3">
            <AlertOctagon className="w-5 h-5 text-rose-600 mt-0.5 shrink-0" />
            <div className="space-y-1">
              <strong className="font-bold text-sm block">
                Physical Inventory Discrepancy Log ({discrepancyItems.length} Exceptions)
              </strong>
              <p>
                The following hardware assets were flagged with exceptions during cycle{' '}
                <strong>{currentCycle?.cycleCode}</strong>. When this cycle is locked, any equipment marked as{' '}
                <strong>&ldquo;Missing&rdquo;</strong> will automatically transition into the{' '}
                <strong>&ldquo;Lost&rdquo;</strong> state across all system modules.
              </p>
            </div>
          </div>

          {/* Discrepancy Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                    <th className="py-3 px-4">Asset Tag & Name</th>
                    <th className="py-3 px-4">Discrepancy State</th>
                    <th className="py-3 px-4">Designated Custody</th>
                    <th className="py-3 px-4">Auditor Finding Notes</th>
                    <th className="py-3 px-4">Automated Transition Outcome</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {discrepancyItems.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">
                        Zero discrepancies in this cycle! All audited assets accounted for.
                      </td>
                    </tr>
                  ) : (
                    discrepancyItems.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-900">{item.assetName}</div>
                          <div className="font-mono text-[10px] text-slate-500">
                            {item.assetTag} &bull; S/N: {item.serialNumber || 'N/A'}
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <AuditBadge status={item.status} size="sm" />
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="text-slate-800 font-medium">
                            {item.expectedHolderName}
                          </div>
                          <div className="text-[10px] text-slate-500">{item.location}</div>
                        </td>

                        <td className="py-3.5 px-4 max-w-sm">
                          <p className="text-slate-700 italic">
                            {item.notes || 'No auditor remark provided.'}
                          </p>
                        </td>

                        <td className="py-3.5 px-4">
                          {item.status === 'Missing' ? (
                            <span className="font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded text-[11px] border border-rose-200 inline-block">
                              &rarr; Auto-shifts to &ldquo;Lost&rdquo; State
                            </span>
                          ) : (
                            <span className="font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-[11px] border border-amber-200 inline-block">
                              &rarr; Sets Condition to &ldquo;Maint. Required&rdquo;
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
