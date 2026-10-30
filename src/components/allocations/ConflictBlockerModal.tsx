import React, { useState } from 'react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { useApp } from '../../context/AppContext'
import { Asset, User } from '../../types'
import {
  AlertOctagon,
  ArrowRightLeft,
  ShieldAlert,
  Calendar,
  CheckCircle2,
  XCircle,
  Building2
} from 'lucide-react'
import { RoleBadge } from '../ui/Badge'

interface ConflictBlockerModalProps {
  isOpen: boolean
  onClose: () => void
  conflictAsset: Asset | null
  targetRecipient: User | null
  expectedReturnDate: string
  onTransferSuccess?: () => void
}

export const ConflictBlockerModal: React.FC<ConflictBlockerModalProps> = ({
  isOpen,
  onClose,
  conflictAsset,
  targetRecipient,
  expectedReturnDate,
  onTransferSuccess,
}) => {
  const { requestTransfer, users } = useApp()
  const [transferReason, setTransferReason] = useState(
    'Urgent operational reassignment requested via conflict resolution.'
  )
  const [submitted, setSubmitted] = useState(false)

  if (!isOpen || !conflictAsset || !targetRecipient) return null

  const currentHolder =
    users.find((u) => u.id === conflictAsset.currentHolderId) || {
      name: conflictAsset.currentHolderName || 'Unknown Employee',
      email: 'current.holder@assetflow.corp',
      department: conflictAsset.departmentName,
      badgeNumber: 'AF-EMP-HOLD',
      avatar: conflictAsset.currentHolderAvatar || 'https://images.unsplash.com/photo-1535713875002?w=150',
      role: 'employee' as const,
    }

  const handleInitiateTransfer = (e: React.FormEvent) => {
    e.preventDefault()
    requestTransfer(conflictAsset.id, targetRecipient.id, transferReason)
    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      onClose()
      if (onTransferSuccess) onTransferSuccess()
    }, 1500)
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Conflict Rule: Double-Allocation Blocked"
      description="Direct assignment is blocked because this hardware is already in active custody."
      maxWidth="lg"
    >
      <div className="space-y-4">
        {submitted ? (
          <div className="p-6 text-center space-y-3 bg-emerald-50 rounded-2xl border border-emerald-200 animate-in fade-in">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
            <h4 className="font-bold text-slate-900 text-sm">Transfer Request Initiated!</h4>
            <p className="text-xs text-slate-600 max-w-md mx-auto">
              A formal Transfer Request has been routed to the Approval Queue. Department Heads and Asset Managers have been notified.
            </p>
          </div>
        ) : (
          <form onSubmit={handleInitiateTransfer} className="space-y-4">
            {/* High-Visibility Conflict Alert Banner */}
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-950 flex items-start gap-3">
              <AlertOctagon className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <strong className="font-bold block text-sm text-rose-900">
                  Double-Allocation Is Forbidden By ERP Policy
                </strong>
                <p className="text-rose-800 leading-relaxed text-[11px]">
                  Asset <code className="font-mono font-bold bg-white/80 px-1 rounded">{conflictAsset.tag}</code> ({conflictAsset.name}) is currently in the custody of another employee. A single physical unit cannot have two simultaneous holders.
                </p>
              </div>
            </div>

            {/* Custody Comparison Visual */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
              {/* Left: Current Active Holder */}
              <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Current Active Holder
                  </span>
                  <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-100">
                    Occupied
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <img
                    src={currentHolder.avatar}
                    alt={currentHolder.name}
                    className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
                  />
                  <div className="min-w-0">
                    <span className="font-bold text-xs text-slate-900 block truncate">{currentHolder.name}</span>
                    <span className="text-[10px] text-slate-400 block">{currentHolder.department}</span>
                  </div>
                </div>
                <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-100 font-mono">
                  Return Due: <strong>{conflictAsset.expectedReturnDate || 'Not specified'}</strong>
                </div>
              </div>

              {/* Right: Desired Recipient */}
              <div className="p-3 bg-white rounded-lg border border-indigo-200 space-y-1.5 ring-1 ring-indigo-100">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider">
                    Target Recipient
                  </span>
                  <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-100">
                    Requested
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <img
                    src={targetRecipient.avatar}
                    alt={targetRecipient.name}
                    className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
                  />
                  <div className="min-w-0">
                    <span className="font-bold text-xs text-slate-900 block truncate">{targetRecipient.name}</span>
                    <span className="text-[10px] text-slate-400 block">{targetRecipient.department}</span>
                  </div>
                </div>
                <div className="text-[10px] text-indigo-700 pt-1 border-t border-slate-100 font-mono">
                  Requested Until: <strong>{expectedReturnDate}</strong>
                </div>
              </div>
            </div>

            {/* Resolution Workflow Prompt */}
            <div className="p-3 bg-indigo-50/70 border border-indigo-200/80 rounded-xl space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-indigo-600" />
                <span className="font-bold text-indigo-950">
                  Recommended Workflow: Peer-to-Peer Transfer Request
                </span>
              </div>
              <p className="text-[11px] text-indigo-900 leading-relaxed">
                Rather than an unauthorized overwrite, submit a verified Transfer Request. Once signed off by the Department Head or Asset Manager, the asset will seamlessly re-allocate to {targetRecipient.name}.
              </p>

              <div className="space-y-1 pt-1">
                <label className="block text-[11px] font-semibold text-slate-800">
                  Transfer Justification Reason <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  value={transferReason}
                  onChange={(e) => setTransferReason(e.target.value)}
                  placeholder="Specify why this asset should be transferred..."
                  className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <Button type="button" variant="secondary" size="sm" onClick={onClose}>
                Cancel Allocation
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                leftIcon={<ArrowRightLeft className="w-3.5 h-3.5" />}
              >
                Trigger Transfer Request
              </Button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  )
}
