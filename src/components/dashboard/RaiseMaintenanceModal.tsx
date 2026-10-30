import React, { useState } from 'react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { useApp } from '../../context/AppContext'
import { Wrench, AlertTriangle, UploadCloud, CheckCircle2 } from 'lucide-react'

interface RaiseMaintenanceModalProps {
  isOpen: boolean
  onClose: () => void
}

export const RaiseMaintenanceModal: React.FC<RaiseMaintenanceModalProps> = ({ isOpen, onClose }) => {
  const { assets, currentUser, createMaintenanceTicket } = useApp()

  const [selectedAssetId, setSelectedAssetId] = useState(assets[0]?.id || '')
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High' | 'Critical'>('High')
  const [description, setDescription] = useState('')
  const [hasPhoto, setHasPhoto] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!description.trim()) return

    const asset = assets.find((a) => a.id === selectedAssetId) || assets[0]
    if (!asset) return

    const ticket = createMaintenanceTicket({
      assetId: asset.id,
      assetTag: asset.tag,
      assetName: asset.name,
      issueDescription: description,
      priority,
      status: priority === 'Critical' ? 'In Progress' : 'Pending',
      reportedById: currentUser.id,
      reportedByName: currentUser.name,
      photoUrl: hasPhoto ? 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=300' : undefined,
    })

    setSuccessMsg(`Ticket #${ticket.ticketNumber} raised! Asset ${asset.tag} coupled to maintenance queue.`)
    setTimeout(() => {
      onClose()
      setSuccessMsg('')
      setDescription('')
      setHasPhoto(false)
    }, 1200)
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Submit Maintenance Request"
      description="Report hardware defect, physical malfunction, or schedule inspection."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {successMsg && (
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <div className="space-y-1">
          <label className="block text-xs font-medium text-slate-700">Select Defective Asset</label>
          <select
            value={selectedAssetId}
            onChange={(e) => setSelectedAssetId(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
          >
            {assets.map((a) => (
              <option key={a.id} value={a.id}>
                {a.tag} — {a.name} ({a.departmentName})
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-medium text-slate-700">Urgency & Priority</label>
          <div className="grid grid-cols-4 gap-2">
            {(['Low', 'Medium', 'High', 'Critical'] as const).map((p) => {
              const isSelected = priority === p
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                    isSelected
                      ? p === 'Critical'
                        ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                        : p === 'High'
                        ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                        : 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {p}
                </button>
              )
            })}
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-medium text-slate-700">
            Issue Description & Failure Symptoms <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={3}
            required
            placeholder="Describe malfunction, error codes, physical damage..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Mock Photo Upload dropzone */}
        <div className="space-y-1">
          <label className="block text-xs font-medium text-slate-700">Attach Damage Photo</label>
          <div
            onClick={() => setHasPhoto(!hasPhoto)}
            className={`border-2 border-dashed rounded-xl p-3 text-center cursor-pointer transition-colors ${
              hasPhoto
                ? 'border-emerald-500 bg-emerald-50/50'
                : 'border-slate-300 hover:border-indigo-400 bg-slate-50/50'
            }`}
          >
            <UploadCloud className={`w-5 h-5 mx-auto ${hasPhoto ? 'text-emerald-600' : 'text-slate-400'}`} />
            <p className="text-xs font-medium text-slate-700 mt-1">
              {hasPhoto ? '1 Photo Attached (diagnostic_screen.png)' : 'Click to simulate photo upload'}
            </p>
            <p className="text-[10px] text-slate-400">PNG, JPG up to 10MB</p>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="danger" size="sm" leftIcon={<Wrench className="w-3.5 h-3.5" />}>
            Dispatch Ticket
          </Button>
        </div>
      </form>
    </Modal>
  )
}
