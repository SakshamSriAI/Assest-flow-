import React, { useState, useMemo } from 'react'
import { useApp } from '../../context/AppContext'
import { MaintenanceBadge, AssetStateBadge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Card, CardHeader } from '../ui/Card'
import { RaiseMaintenanceModal } from '../dashboard/RaiseMaintenanceModal'
import { AssignTechnicianModal } from '../maintenance/AssignTechnicianModal'
import { ResolveTicketModal } from '../maintenance/ResolveTicketModal'
import { TicketDetailModal } from '../maintenance/TicketDetailModal'
import { MaintenanceTicket, MaintenanceStatus } from '../../types'
import {
  Wrench,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Clock,
  User,
  ArrowRight,
  ShieldAlert,
  Kanban,
  List,
  Sparkles,
  Calendar,
  Cpu,
  MapPin,
  Play,
  RotateCcw,
  Check,
} from 'lucide-react'

const KANBAN_COLUMNS: {
  status: MaintenanceStatus
  label: string
  color: string
  borderColor: string
  headerBg: string
}[] = [
  {
    status: 'Pending',
    label: 'Pending Review',
    color: 'text-[#B45309]',
    borderColor: 'border-[#FDE68A]',
    headerBg: 'bg-[#FFFBEB]',
  },
  {
    status: 'Approved',
    label: 'Approved / Unassigned',
    color: 'text-[#1D4ED8]',
    borderColor: 'border-[#BFDBFE]',
    headerBg: 'bg-[#EFF6FF]',
  },
  {
    status: 'Assigned',
    label: 'Technician Assigned',
    color: 'text-[#0F2F57]',
    borderColor: 'border-[#0F2F57]/20',
    headerBg: 'bg-[#0F2F57]/5',
  },
  {
    status: 'In Progress',
    label: 'In Progress (Locked)',
    color: 'text-[#2563EB]',
    borderColor: 'border-[#BFDBFE]',
    headerBg: 'bg-[#EFF6FF]',
  },
  {
    status: 'Resolved',
    label: 'Resolved & Released',
    color: 'text-[#047857]',
    borderColor: 'border-[#A7F3D0]',
    headerBg: 'bg-[#ECFDF5]',
  },
]

export const MaintenanceScreen: React.FC = () => {
  const { tickets, assets, currentUser, updateTicketStatus } = useApp()

  // Navigation & View mode
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban')
  const [searchQuery, setSearchQuery] = useState('')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')

  // Modals state
  const [isRaiseModalOpen, setIsRaiseModalOpen] = useState(false)
  const [selectedTicketDetail, setSelectedTicketDetail] = useState<MaintenanceTicket | null>(null)
  const [assignModalTicket, setAssignModalTicket] = useState<MaintenanceTicket | null>(null)
  const [resolveModalTicket, setResolveModalTicket] = useState<MaintenanceTicket | null>(null)

  // Permissions
  const isManagerOrAdmin =
    currentUser.role === 'admin' ||
    currentUser.role === 'asset_manager' ||
    currentUser.role === 'department_head'

  // Filtered tickets
  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      // Priority filter
      if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchNumber = t.ticketNumber.toLowerCase().includes(q)
        const matchAsset = t.assetName.toLowerCase().includes(q)
        const matchTag = t.assetTag.toLowerCase().includes(q)
        const matchDesc = t.issueDescription.toLowerCase().includes(q)
        const matchReporter = t.reportedByName.toLowerCase().includes(q)
        const matchTech = (t.assignedTechnician || '').toLowerCase().includes(q)
        if (!matchNumber && !matchAsset && !matchTag && !matchDesc && !matchReporter && !matchTech) {
          return false
        }
      }
      return true
    })
  }, [tickets, priorityFilter, searchQuery])

  // KPIs
  const activeCount = tickets.filter((t) => t.status !== 'Resolved' && t.status !== 'Rejected').length
  const criticalCount = tickets.filter((t) => t.priority === 'Critical' && t.status !== 'Resolved').length
  const inProgressCount = tickets.filter((t) => t.status === 'In Progress').length
  const resolvedCount = tickets.filter((t) => t.status === 'Resolved').length

  // Handlers for pipeline transitions
  const handleApprove = (ticketId: string) => {
    updateTicketStatus(ticketId, 'Approved')
  }

  const handleReject = (ticketId: string) => {
    updateTicketStatus(ticketId, 'Rejected')
  }

  const handleAssignTechnician = (ticketId: string, technician: string, startRepair: boolean) => {
    const nextStatus = startRepair ? 'In Progress' : 'Assigned'
    updateTicketStatus(ticketId, nextStatus, { technician })
  }

  const handleBeginRepair = (ticketId: string) => {
    updateTicketStatus(ticketId, 'In Progress')
  }

  const handleResolve = (ticketId: string, resolutionNotes: string) => {
    updateTicketStatus(ticketId, 'Resolved', { notes: resolutionNotes })
  }

  return (
    <div className="space-y-6">
      {/* Modals */}
      <RaiseMaintenanceModal
        isOpen={isRaiseModalOpen}
        onClose={() => setIsRaiseModalOpen(false)}
      />

      <AssignTechnicianModal
        isOpen={!!assignModalTicket}
        onClose={() => setAssignModalTicket(null)}
        ticket={assignModalTicket}
        onAssign={handleAssignTechnician}
      />

      <ResolveTicketModal
        isOpen={!!resolveModalTicket}
        onClose={() => setResolveModalTicket(null)}
        ticket={resolveModalTicket}
        onResolve={handleResolve}
      />

      <TicketDetailModal
        isOpen={!!selectedTicketDetail}
        onClose={() => setSelectedTicketDetail(null)}
        ticket={selectedTicketDetail}
        asset={assets.find((a) => a.id === selectedTicketDetail?.assetId)}
        onApprove={handleApprove}
        onReject={handleReject}
        onOpenAssign={(t) => setAssignModalTicket(t)}
        onBeginRepair={handleBeginRepair}
        onOpenResolve={(t) => setResolveModalTicket(t)}
        canManage={isManagerOrAdmin}
      />

      {/* Screen Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-[#0F172A] tracking-tight font-heading">
              Maintenance Hub
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#0F2F57]/10 text-[#0F2F57] border border-[#0F2F57]/20 flex items-center gap-1">
              <Wrench className="w-3 h-3 text-[#0F2F57]" />
              Service Pipeline
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsRaiseModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Raise Maintenance Ticket
          </Button>
        </div>
      </div>

      {/* Operational KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-3.5 rounded-xl border border-[#FDE68A] bg-gradient-to-br from-[#FFFBEB]/60 to-white shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#64748B]">Active Work Orders</span>
            <Clock className="w-4 h-4 text-[#B45309]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#B45309] font-mono">{activeCount}</span>
            <span className="text-[11px] text-[#B45309] font-medium">In pipeline</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-[#FECACA] bg-gradient-to-br from-[#FEF2F2]/60 to-white shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#64748B]">Critical Incidents</span>
            <AlertCircle className="w-4 h-4 text-[#B91C1C]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#B91C1C] font-mono">{criticalCount}</span>
            <span className="text-[11px] text-[#B91C1C] font-medium">Outages requiring triage</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-[#BFDBFE] bg-gradient-to-br from-[#EFF6FF]/60 to-white shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#64748B]">In-Progress Repairs</span>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#2563EB]"></span>
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#2563EB] font-mono">{inProgressCount}</span>
            <span className="text-[11px] text-[#2563EB] font-medium">Locked to &ldquo;Under Maint.&rdquo;</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-[#A7F3D0] bg-gradient-to-br from-[#ECFDF5]/60 to-white shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#64748B]">Resolved & Released</span>
            <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#047857] font-mono">{resolvedCount}</span>
            <span className="text-[11px] text-[#047857] font-medium">Reverted to &ldquo;Available&rdquo;</span>
          </div>
        </div>
      </div>

      {/* Toolbar: Views & Facets */}
      <div className="p-3 bg-white rounded-xl border border-[#E2E8F0] shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="w-full md:w-80">
          <Input
            placeholder="Search ticket #, asset, technician..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-slate-400" />}
          />
        </div>

        {/* Priority Filter & View Mode Switcher */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-[11px] text-slate-400 font-medium mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Priority:
            </span>
            {(['all', 'Critical', 'High', 'Medium', 'Low'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPriorityFilter(p)}
                className={`px-2 py-1 rounded-md text-xs font-medium transition-all ${
                  priorityFilter === p
                    ? p === 'Critical'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : p === 'High'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {p === 'all' ? 'All' : p}
              </button>
            ))}
          </div>

          <div className="h-4 w-px bg-slate-200 hidden sm:block" />

          {/* Kanban vs Table Toggle */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs">
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-2.5 py-1 rounded-md flex items-center gap-1.5 font-medium transition-colors ${
                viewMode === 'kanban'
                  ? 'bg-white text-indigo-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              Kanban
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-2.5 py-1 rounded-md flex items-center gap-1.5 font-medium transition-colors ${
                viewMode === 'list'
                  ? 'bg-white text-indigo-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              Table
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VIEW A: KANBAN BOARD VIEW (5 PIPELINE STAGES) */}
      {/* ========================================================================= */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3.5 items-start">
          {KANBAN_COLUMNS.map((col) => {
            const colTickets = filteredTickets.filter((t) => t.status === col.status)

            return (
              <div
                key={col.status}
                className={`rounded-xl border ${col.borderColor} bg-slate-50/50 flex flex-col min-h-[500px] shadow-xs overflow-hidden`}
              >
                {/* Column Header */}
                <div
                  className={`p-3 border-b ${col.borderColor} ${col.headerBg} flex items-center justify-between`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold ${col.color}`}>{col.label}</span>
                    <span className="text-[11px] font-mono px-1.5 py-0.2 rounded-full bg-white border border-slate-200 font-bold text-slate-700">
                      {colTickets.length}
                    </span>
                  </div>
                </div>

                {/* Column Body Cards */}
                <div className="p-2 space-y-2.5 flex-1 overflow-y-auto max-h-[700px]">
                  {colTickets.length === 0 ? (
                    <div className="p-6 text-center text-[11px] text-slate-400 border border-dashed border-slate-200 rounded-lg">
                      No tickets in {col.label.toLowerCase()}
                    </div>
                  ) : (
                    colTickets.map((ticket) => {
                      const linkedAsset = assets.find((a) => a.id === ticket.assetId)
                      const isCritical = ticket.priority === 'Critical'
                      const isHigh = ticket.priority === 'High'

                      return (
                        <div
                          key={ticket.id}
                          onClick={() => setSelectedTicketDetail(ticket)}
                          className={`p-3 bg-white rounded-lg border border-slate-200/90 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer space-y-2 group ${
                            isCritical ? 'border-l-4 border-l-rose-500' : isHigh ? 'border-l-4 border-l-amber-500' : ''
                          }`}
                        >
                          {/* Ticket Header & Priority */}
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-[10px] font-bold text-indigo-700 bg-indigo-50 px-1 py-0.5 rounded">
                              #{ticket.ticketNumber}
                            </span>
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                                isCritical
                                  ? 'bg-rose-100 text-rose-800'
                                  : isHigh
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {ticket.priority}
                            </span>
                          </div>

                          {/* Asset Name */}
                          <div>
                            <div className="text-xs font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                              {ticket.assetName}
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-0.5">
                              <span className="font-mono text-slate-700 font-medium">
                                {ticket.assetTag}
                              </span>
                              {linkedAsset && (
                                <span className="text-[9px] px-1 rounded bg-slate-100 text-slate-600 truncate">
                                  {linkedAsset.departmentName.split(' ')[0]}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Issue Description */}
                          <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                            {ticket.issueDescription}
                          </p>

                          {/* Technician & Footer */}
                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                            <div className="flex items-center gap-1 truncate max-w-[130px]">
                              {ticket.assignedTechnician ? (
                                <>
                                  <Wrench className="w-3 h-3 text-indigo-600 shrink-0" />
                                  <span className="truncate text-slate-700 font-medium">
                                    {ticket.assignedTechnician.split(' ')[0]}
                                  </span>
                                </>
                              ) : (
                                <>
                                  <User className="w-3 h-3 text-slate-400 shrink-0" />
                                  <span className="truncate">{ticket.reportedByName.split(' ')[0]}</span>
                                </>
                              )}
                            </div>

                            {/* Quick Next-Stage Trigger */}
                            {isManagerOrAdmin && (
                              <div
                                onClick={(e) => e.stopPropagation()}
                                className="flex items-center gap-1"
                              >
                                {ticket.status === 'Pending' && (
                                  <button
                                    onClick={() => handleApprove(ticket.id)}
                                    title="Approve Ticket"
                                    className="p-1 rounded hover:bg-emerald-50 text-emerald-600 hover:text-emerald-700"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                  </button>
                                )}

                                {ticket.status === 'Approved' && (
                                  <button
                                    onClick={() => setAssignModalTicket(ticket)}
                                    title="Assign Technician"
                                    className="p-1 rounded hover:bg-sky-50 text-sky-600 hover:text-sky-700 font-medium text-[9px] flex items-center gap-0.5"
                                  >
                                    Assign <ArrowRight className="w-2.5 h-2.5" />
                                  </button>
                                )}

                                {ticket.status === 'Assigned' && (
                                  <button
                                    onClick={() => handleBeginRepair(ticket.id)}
                                    title="Begin Repair"
                                    className="p-1 rounded hover:bg-blue-50 text-blue-600 hover:text-blue-700 font-medium text-[9px] flex items-center gap-0.5"
                                  >
                                    Start <ArrowRight className="w-2.5 h-2.5" />
                                  </button>
                                )}

                                {ticket.status === 'In Progress' && (
                                  <button
                                    onClick={() => setResolveModalTicket(ticket)}
                                    title="Resolve and Free Asset"
                                    className="p-1 rounded hover:bg-emerald-50 text-emerald-600 hover:text-emerald-700 font-medium text-[9px] flex items-center gap-0.5"
                                  >
                                    Resolve <CheckCircle2 className="w-2.5 h-2.5" />
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* ========================================================================= */
        /* VIEW B: TABLE / DIRECTORY VIEW */
        /* ========================================================================= */
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-4">Ticket</th>
                  <th className="py-3 px-4">Asset Under Service</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Workflow Status</th>
                  <th className="py-3 px-4">Assigned Technician</th>
                  <th className="py-3 px-4">Reported By</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTickets.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      No maintenance tickets match current filters.
                    </td>
                  </tr>
                ) : (
                  filteredTickets.map((t) => {
                    const linkedAsset = assets.find((a) => a.id === t.assetId)
                    return (
                      <tr
                        key={t.id}
                        onClick={() => setSelectedTicketDetail(t)}
                        className="hover:bg-slate-50/70 transition-colors cursor-pointer group"
                      >
                        <td className="py-3.5 px-4 font-mono font-bold text-indigo-700">
                          #{t.ticketNumber}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                            {t.assetName}
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                            <span className="font-mono bg-slate-100 px-1 py-0.2 rounded text-slate-600">
                              {t.assetTag}
                            </span>
                            {linkedAsset && <AssetStateBadge status={linkedAsset.status} size="xs" />}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              t.priority === 'Critical'
                                ? 'bg-rose-100 text-rose-800'
                                : t.priority === 'High'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {t.priority}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <MaintenanceBadge status={t.status} size="sm" />
                        </td>
                        <td className="py-3.5 px-4 text-slate-700">
                          {t.assignedTechnician || (
                            <span className="text-slate-400 italic">Unassigned</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">
                          <div>{t.reportedByName}</div>
                          <div className="text-[10px] text-slate-400">{t.createdAt}</div>
                        </td>
                        <td
                          className="py-3.5 px-4 text-right"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-end gap-1.5">
                            {t.status === 'Pending' && isManagerOrAdmin && (
                              <>
                                <Button
                                  variant="primary"
                                  size="xs"
                                  onClick={() => handleApprove(t.id)}
                                >
                                  Approve
                                </Button>
                                <Button
                                  variant="danger"
                                  size="xs"
                                  onClick={() => handleReject(t.id)}
                                >
                                  Reject
                                </Button>
                              </>
                            )}

                            {t.status === 'Approved' && isManagerOrAdmin && (
                              <Button
                                variant="secondary"
                                size="xs"
                                onClick={() => setAssignModalTicket(t)}
                              >
                                Assign Tech
                              </Button>
                            )}

                            {t.status === 'Assigned' && isManagerOrAdmin && (
                              <Button
                                variant="primary"
                                size="xs"
                                onClick={() => handleBeginRepair(t.id)}
                              >
                                Begin Repair
                              </Button>
                            )}

                            {t.status === 'In Progress' && isManagerOrAdmin && (
                              <Button
                                variant="primary"
                                size="xs"
                                onClick={() => setResolveModalTicket(t)}
                              >
                                Resolve
                              </Button>
                            )}

                            <Button
                              variant="ghost"
                              size="xs"
                              onClick={() => setSelectedTicketDetail(t)}
                            >
                              Details
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
