import React, { useState } from 'react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { useApp } from '../../context/AppContext'
import { RotateCcw, CheckCircle2, ShieldCheck } from 'lucide-react'
import { Asset } from '../../types'

interface CheckInReturnModalProps {
  isOpen: boolean
  onClose: () => void
  targetAsset?: Asset | null
}

export const CheckInReturnModal: React.FC<CheckInReturnModalProps> = ({
  isOpen,
  onClose,
  targetAsset,
}) => {
  const { assets, checkInAsset } = useApp()

  const allocatedAssets = assets.filter((a) => a.status === 'Allocated')

  const [selectedAssetId, setSelectedAssetId] = useState<string>(
    targetAsset?.id || allocatedAssets[0]?.id || ''
  )
  const [conditionNotes, setConditionNotes] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const currentSelected =
    targetAsset || allocatedAssets.find((a) => a.id === selectedAssetId) || allocatedAssets[0]

  const handleReturn = (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentSelected) return

    checkInAsset(currentSelected.id, conditionNotes)
    setSuccessMsg(`Asset ${currentSelected.tag} checked in and status reverted to "Available"!`)
    setTimeout(() => {
      onClose()
      setSuccessMsg('')
      setConditionNotes('')
    }, 1200)
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Asset Check-In / Return"
      description="Inspect asset condition and revert status back to 'Available'."
      maxWidth="md"
    >
      <form onSubmit={handleReturn} className="space-y-4">
        {successMsg && (
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {!targetAsset && (
          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-700">Select Asset to Return</label>
            <select
              value={selectedAssetId}
              onChange={(e) => setSelectedAssetId(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
            >
              {allocatedAssets.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.tag} — {a.name} (Holder: {a.currentHolderName || 'Assigned'})
                </option>
              ))}
            </select>
          </div>
        )}

        {currentSelected && (
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                {currentSelected.tag}
              </span>
              <span className="text-slate-400">Current Holder: <strong>{currentSelected.currentHolderName}</strong></span>
            </div>
            <p className="font-semibold text-slate-900">{currentSelected.name}</p>
            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
              <span>Expected Return: <strong className="text-slate-700">{currentSelected.expectedReturnDate || 'N/A'}</strong></span>
              <span>Serial: <code className="font-mono">{currentSelected.serialNumber || 'N/A'}</code></span>
            </div>
          </div>
        )}

        <div className="space-y-1">
          <label className="block text-xs font-medium text-slate-700">
            Physical Inspection & Condition Notes
          </label>
          <textarea
            rows={3}
            placeholder="No visible scratches, accessories returned, diagnostics clean..."
            value={conditionNotes}
            onChange={(e) => setConditionNotes(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="p-3 rounded-lg bg-emerald-50/70 border border-emerald-200/80 text-[11px] text-emerald-900 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            <strong>State Machine Rule:</strong> Processing check-in automatically updates the asset state to <strong>Available</strong> and detaches current custody.
          </span>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" leftIcon={<RotateCcw className="w-3.5 h-3.5" />}>
            Confirm Check-In
          </Button>
        </div>
      </form>
    </Modal>
  )
}
