import React from 'react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { MaintenanceBadge, AssetStateBadge } from '../ui/Badge'
import { MaintenanceTicket, Asset } from '../../types'
import {
  Wrench,
  Clock,
  User,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  UserCheck,
  XCircle,
  FileText,
  Calendar,
  Image as ImageIcon,
} from 'lucide-react'

interface TicketDetailModalProps {
  isOpen: boolean
  onClose: () => void
  ticket: MaintenanceTicket | null
  asset: Asset | undefined
  onApprove: (ticketId: string) => void
  onReject: (ticketId: string) => void
  onOpenAssign: (ticket: MaintenanceTicket) => void
  onBeginRepair: (ticketId: string) => void
  onOpenResolve: (ticket: MaintenanceTicket) => void
  canManage: boolean
}

export const TicketDetailModal: React.FC<TicketDetailModalProps> = ({
  isOpen,
  onClose,
  ticket,
  asset,
  onApprove,
  onReject,
  onOpenAssign,
  onBeginRepair,
  onOpenResolve,
  canManage,
}) => {
  if (!ticket) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Maintenance Ticket #${ticket.ticketNumber}`}
      description="Comprehensive defect diagnostics, technician logs, and asset state coupling."
      maxWidth="lg"
    >
      <div className="space-y-4">
        {/* Status Header Bar */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase">Workflow Stage:</span>
            <MaintenanceBadge status={ticket.status} size="md" />
            <span
              className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                ticket.priority === 'Critical'
                  ? 'bg-rose-100 text-rose-800'
                  : ticket.priority === 'High'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              {ticket.priority} Priority
            </span>
          </div>

          {asset && (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500">Asset Coupling:</span>
              <AssetStateBadge status={asset.status} size="sm" />
            </div>
          )}
        </div>

        {/* Linked Asset Details Card */}
        <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-xs space-y-2">
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Wrench className="w-3.5 h-3.5 text-indigo-600" /> Linked Enterprise Asset
          </h4>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="text-sm font-bold text-slate-900">{ticket.assetName}</div>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded font-semibold text-slate-700">
                  {ticket.assetTag}
                </span>
                {asset?.serialNumber && (
                  <span className="font-mono text-slate-600">S/N: {asset.serialNumber}</span>
                )}
                <span className="flex items-center gap-1 text-slate-500">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  {asset?.location || 'HQ Main Facility'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Issue Description & Photo Mockup */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-slate-400" /> Defect Description & Photo
          </h4>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 leading-relaxed font-sans">
            {ticket.issueDescription}
          </div>

          {/* Photo attachment preview */}
          {ticket.photoUrl ? (
            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-start gap-3">
              <img
                src={ticket.photoUrl}
                alt="Defect Attachment"
                className="w-24 h-24 rounded-lg object-cover border border-slate-300 shrink-0"
              />
              <div className="text-xs space-y-1">
                <span className="font-semibold text-slate-800 block">Defect Photo Upload</span>
                <p className="text-[11px] text-slate-500">
                  Physical defect inspection capture uploaded by reporting personnel.
                </p>
                <span className="text-[10px] text-indigo-600 font-mono bg-indigo-50 px-1 py-0.5 rounded inline-block">
                  attachment_defect_evidence.jpg
                </span>
              </div>
            </div>
          ) : (
            <div className="p-2.5 rounded-lg border border-dashed border-slate-200 text-slate-400 text-xs flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-slate-300" />
              <span>No defect photograph attached during submission.</span>
            </div>
          )}
        </div>

        {/* Assignment & Resolution Telemetry */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-[11px] text-slate-500 font-medium block">Reported By:</span>
            <div className="font-semibold text-slate-800 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              {ticket.reportedByName}
            </div>
            <div className="text-[11px] text-slate-500 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-400" />
              {ticket.createdAt}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-[11px] text-slate-500 font-medium block">Assigned Technician:</span>
            <div className="font-semibold text-slate-800 flex items-center gap-1.5">
              <Wrench className="w-3.5 h-3.5 text-indigo-600" />
              {ticket.assignedTechnician || 'Unassigned (Awaiting Dispatch)'}
            </div>
            {ticket.resolvedAt && (
              <div className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                Resolved on {ticket.resolvedAt}
              </div>
            )}
          </div>
        </div>

        {/* Resolution Notes (if resolved) */}
        {ticket.resolutionNotes && (
          <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-1 text-xs text-emerald-900">
            <strong className="font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Proof of Fix / Resolution Log:
            </strong>
            <p className="text-slate-800 italic leading-relaxed pt-1">
              &ldquo;{ticket.resolutionNotes}&rdquo;
            </p>
          </div>
        )}

        {/* Action Controls for Kanban Routing */}
        {canManage && ticket.status !== 'Resolved' && ticket.status !== 'Rejected' && (
          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-500">Pipeline Routing:</span>
            <div className="flex items-center gap-2">
              {ticket.status === 'Pending' && (
                <>
                  <Button
                    variant="danger"
                    size="xs"
                    onClick={() => {
                      onReject(ticket.id)
                      onClose()
                    }}
                    leftIcon={<XCircle className="w-3.5 h-3.5" />}
                  >
                    Reject
                  </Button>
                  <Button
                    variant="primary"
                    size="xs"
                    onClick={() => {
                      onApprove(ticket.id)
                      onClose()
                    }}
                    leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                  >
                    Approve Ticket
                  </Button>
                </>
              )}

              {ticket.status === 'Approved' && (
                <Button
                  variant="primary"
                  size="xs"
                  onClick={() => {
                    onClose()
                    onOpenAssign(ticket)
                  }}
                  leftIcon={<UserCheck className="w-3.5 h-3.5" />}
                >
                  Assign Technician & Dispatch
                </Button>
              )}

              {ticket.status === 'Assigned' && (
                <Button
                  variant="primary"
                  size="xs"
                  onClick={() => {
                    onBeginRepair(ticket.id)
                    onClose()
                  }}
                  leftIcon={<Play className="w-3.5 h-3.5" />}
                >
                  Begin Repair (Lock to Under Maintenance)
                </Button>
              )}

              {ticket.status === 'In Progress' && (
                <Button
                  variant="primary"
                  size="xs"
                  onClick={() => {
                    onClose()
                    onOpenResolve(ticket)
                  }}
                  leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                >
                  Verify & Mark Resolved
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}
