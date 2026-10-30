import React, { useState } from 'react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { AuditCycle } from '../../types'
import { Lock, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react'

interface LockAuditCycleModalProps {
  isOpen: boolean
  onClose: () => void
  cycle: AuditCycle | null
  onLockConfirmed: (cycleId: string) => void
}

export const LockAuditCycleModal: React.FC<LockAuditCycleModalProps> = ({
  isOpen,
  onClose,
  cycle,
  onLockConfirmed,
}) => {
  const [understood, setUnderstood] = useState(false)

  if (!cycle) return null

  const missingItems = cycle.items.filter((i) => i.status === 'Missing')
  const damagedItems = cycle.items.filter((i) => i.status === 'Damaged')
  const verifiedItems = cycle.items.filter((i) => i.status === 'Verified')
  const pendingItems = cycle.items.filter((i) => i.status === 'Pending')

  const handleConfirm = () => {
    onLockConfirmed(cycle.id)
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Lock & Close Audit Cycle ${cycle.cycleCode}`}
      description="Permanent reconciliation action. Discrepancies will trigger automated master asset state transitions."
      maxWidth="md"
    >
      <div className="space-y-4">
        {/* Warning Banner */}
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
          <div className="text-xs text-amber-900 space-y-1">
            <span className="font-bold block">Irreversible Audit State Transition Guarantee:</span>
            <p>
              Locking this cycle permanently freezes verification logs. Any asset marked as{' '}
              <strong className="text-rose-700 underline">&quot;Missing&quot;</strong> will be
              automatically transitioned to the <strong className="text-rose-700">&quot;Lost&quot;</strong> asset state in the master directory.
            </p>
          </div>
        </div>

        {/* Audit Discrepancy Breakdown */}
        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-2">
          <div className="flex justify-between font-semibold text-slate-800">
            <span>Cycle: {cycle.name}</span>
            <span className="font-mono text-indigo-600">{cycle.cycleCode}</span>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-1 text-center">
            <div className="p-2 rounded bg-emerald-50 border border-emerald-200">
              <span className="block text-emerald-800 font-bold text-base font-mono">
                {verifiedItems.length}
              </span>
              <span className="text-[10px] text-emerald-700">Verified</span>
            </div>
            <div className="p-2 rounded bg-rose-50 border border-rose-200">
              <span className="block text-rose-800 font-bold text-base font-mono">
                {missingItems.length}
              </span>
              <span className="text-[10px] text-rose-700 font-semibold">Will Shift to &quot;Lost&quot;</span>
            </div>
            <div className="p-2 rounded bg-amber-50 border border-amber-200">
              <span className="block text-amber-800 font-bold text-base font-mono">
                {damagedItems.length}
              </span>
              <span className="text-[10px] text-amber-700">Flagged Damaged</span>
            </div>
          </div>

          {pendingItems.length > 0 && (
            <div className="p-2 rounded bg-slate-100 text-[11px] text-slate-600 flex items-center justify-between">
              <span>{pendingItems.length} items still un-audited (Pending):</span>
              <span className="text-slate-500 italic">Will remain in their current state</span>
            </div>
          )}
        </div>

        {/* Missing Assets Preview List */}
        {missingItems.length > 0 && (
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-rose-700 uppercase tracking-wider block">
              Assets Being Auto-Flagged as &quot;Lost&quot; ({missingItems.length}):
            </span>
            <div className="max-h-28 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-lg bg-white p-2 text-xs">
              {missingItems.map((item) => (
                <div key={item.id} className="py-1 flex items-center justify-between">
                  <div className="truncate">
                    <span className="font-mono font-bold text-slate-700 mr-2">{item.assetTag}</span>
                    <span className="text-slate-800">{item.assetName}</span>
                  </div>
                  <span className="text-[10px] text-rose-600 font-semibold bg-rose-50 px-1 rounded">
                    Missing
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Confirmation Checkbox */}
        <div className="p-3 rounded-lg bg-slate-100 border border-slate-200 flex items-start gap-2.5">
          <input
            type="checkbox"
            id="auditUnderstood"
            checked={understood}
            onChange={(e) => setUnderstood(e.target.checked)}
            className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
          />
          <label htmlFor="auditUnderstood" className="text-xs text-slate-700 cursor-pointer select-none">
            <span className="font-semibold block text-slate-900">
              I certify this physical verification cycle is complete
            </span>
            <span>
              Authorize irreversible locking of verification records and automatic status update of missing equipment to &quot;Lost&quot;.
            </span>
          </label>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={onClose}>
            Keep Cycle Active
          </Button>
          <Button
            type="button"
            variant="danger"
            size="sm"
            disabled={!understood}
            onClick={handleConfirm}
            leftIcon={<Lock className="w-4 h-4" />}
          >
            Lock & Close Cycle
          </Button>
        </div>
      </div>
    </Modal>
  )
}
