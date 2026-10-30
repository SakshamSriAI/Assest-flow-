import React, { useState } from 'react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { useApp } from '../../context/AppContext'
import { Asset } from '../../types'
import { ArrowRightLeft, CheckCircle2, ShieldCheck } from 'lucide-react'

interface TransferRequestModalProps {
  isOpen: boolean
  onClose: () => void
  initialAsset?: Asset | null
}

export const TransferRequestModal: React.FC<TransferRequestModalProps> = ({
  isOpen,
  onClose,
  initialAsset,
}) => {
  const { assets, users, requestTransfer } = useApp()

  const allocatedAssets = assets.filter((a) => a.status === 'Allocated')

  const [selectedAssetId, setSelectedAssetId] = useState(
    initialAsset?.id || allocatedAssets[0]?.id || ''
  )
  const [targetUserId, setTargetUserId] = useState(users[0]?.id || '')
  const [reason, setReason] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const currentAsset =
    initialAsset || allocatedAssets.find((a) => a.id === selectedAssetId) || allocatedAssets[0]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentAsset || !reason.trim()) return

    const transfer = requestTransfer(currentAsset.id, targetUserId, reason)
    setSuccessMsg(`Transfer request created for ${currentAsset.tag}! Queued for Dept Head approval.`)
    setTimeout(() => {
      onClose()
      setSuccessMsg('')
      setReason('')
    }, 1200)
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Request Asset Transfer"
      description="Initiate a peer-to-peer equipment transfer requiring Department Head or Asset Manager authorization."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {successMsg && (
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Select Asset */}
        <div className="space-y-1">
          <label className="block text-xs font-medium text-slate-700">Select Allocated Equipment</label>
          <select
            value={selectedAssetId}
            onChange={(e) => setSelectedAssetId(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
          >
            {allocatedAssets.map((a) => (
              <option key={a.id} value={a.id}>
                {a.tag} — {a.name} (Current Holder: {a.currentHolderName})
              </option>
            ))}
          </select>
        </div>

        {/* Current Holder Display */}
        {currentAsset && (
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Relinquishing Holder</span>
              <span className="font-semibold text-slate-900">{currentAsset.currentHolderName}</span>
              <span className="text-[10px] text-slate-500 block">{currentAsset.departmentName}</span>
            </div>
            <div className="text-right">
              <span className="font-mono text-xs font-bold text-indigo-700">{currentAsset.tag}</span>
            </div>
          </div>
        )}

        {/* Transfer To */}
        <div className="space-y-1">
          <label className="block text-xs font-medium text-slate-700">Transfer Custody To</label>
          <select
            value={targetUserId}
            onChange={(e) => setTargetUserId(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
          >
            {users
              .filter((u) => u.id !== currentAsset?.currentHolderId)
              .map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} — {u.title} ({u.department})
                </option>
              ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-medium text-slate-700">
            Transfer Justification Reason <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={3}
            required
            placeholder="Explain project requirements or why this hardware is transferring..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="p-3 rounded-lg bg-indigo-50/70 border border-indigo-200/80 text-[11px] text-indigo-900 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
          <span>
            <strong>Governance Note:</strong> This transfer will enter the Approval Queue and must be approved by a Department Head or Asset Manager before custody changes.
          </span>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" leftIcon={<ArrowRightLeft className="w-3.5 h-3.5" />}>
            Submit Transfer Request
          </Button>
        </div>
      </form>
    </Modal>
  )
}
