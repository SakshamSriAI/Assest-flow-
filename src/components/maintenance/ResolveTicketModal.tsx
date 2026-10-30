import React, { useState } from 'react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { MaintenanceTicket } from '../../types'
import { CheckCircle2, ShieldCheck, DollarSign } from 'lucide-react'

interface ResolveTicketModalProps {
  isOpen: boolean
  onClose: () => void
  ticket: MaintenanceTicket | null
  onResolve: (ticketId: string, resolutionNotes: string) => void
}

export const ResolveTicketModal: React.FC<ResolveTicketModalProps> = ({
  isOpen,
  onClose,
  ticket,
  onResolve,
}) => {
  const [notes, setNotes] = useState('')
  const [partsCost, setPartsCost] = useState('0')
  const [qaPassed, setQaPassed] = useState(true)

  if (!ticket) return null

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault()
    if (!notes.trim()) return

    const fullNotes = partsCost !== '0' && partsCost.trim()
      ? `${notes.trim()} [Parts / Vendor Cost: $${partsCost} (Reporting Tracking Only)]`
      : notes.trim()

    onResolve(ticket.id, fullNotes)
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Resolve Maintenance Ticket & Release Asset"
      description={`Record proof-of-fix resolution notes for Ticket #${ticket.ticketNumber}. Asset will automatically revert to "Available" state.`}
      maxWidth="md"
    >
      <form onSubmit={handleConfirm} className="space-y-4">
        {/* Ticket Context */}
        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1">
          <div className="flex items-center justify-between font-semibold text-slate-800">
            <span>{ticket.assetName}</span>
            <span className="font-mono text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
              {ticket.assetTag}
            </span>
          </div>
          <p className="text-slate-600">Defect Reported: &ldquo;{ticket.issueDescription}&rdquo;</p>
          <div className="text-[11px] text-slate-500">
            Technician: <strong>{ticket.assignedTechnician || 'Assigned Specialist'}</strong>
          </div>
        </div>

        {/* Resolution Notes Input */}
        <div className="space-y-1">
          <label className="block text-xs font-medium text-slate-700">
            Proof of Fix / Resolution Notes <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Describe repairs conducted, diagnostic test results, firmware version updated, or components replaced..."
            required
            className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Cost Tracking (Reporting Only) */}
        <Input
          label="Component / Vendor Service Cost (USD, Reporting Only)"
          type="number"
          min="0"
          step="0.01"
          value={partsCost}
          onChange={(e) => setPartsCost(e.target.value)}
          leftIcon={<DollarSign className="w-4 h-4 text-slate-400" />}
          helperText="Non-accounting metric tracked for fleet operational depreciation reporting."
        />

        {/* QA Checkbox */}
        <div className="p-3 rounded-lg bg-emerald-50/70 border border-emerald-200 flex items-start gap-2.5">
          <input
            type="checkbox"
            id="qaPassed"
            checked={qaPassed}
            onChange={(e) => setQaPassed(e.target.checked)}
            required
            className="mt-0.5 rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
          />
          <label htmlFor="qaPassed" className="text-xs text-emerald-900 cursor-pointer select-none">
            <span className="font-semibold block flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Functional Safety & QA Verification Confirmed
            </span>
            <span className="text-[11px] text-emerald-700">
              Certifies the unit has passed physical inspection and is safe to be allocated back to enterprise users.
            </span>
          </label>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={!notes.trim() || !qaPassed}
            leftIcon={<CheckCircle2 className="w-4 h-4" />}
          >
            Mark Ticket Resolved & Free Asset
          </Button>
        </div>
      </form>
    </Modal>
  )
}
