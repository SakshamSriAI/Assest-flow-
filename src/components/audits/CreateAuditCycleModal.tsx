import React, { useState } from 'react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { useApp } from '../../context/AppContext'
import { Calendar, MapPin, UserCheck, CheckCircle2, ShieldCheck } from 'lucide-react'

interface CreateAuditCycleModalProps {
  isOpen: boolean
  onClose: () => void
  onCycleCreated: (cycleId: string) => void
}

export const CreateAuditCycleModal: React.FC<CreateAuditCycleModalProps> = ({
  isOpen,
  onClose,
  onCycleCreated,
}) => {
  const { departments, users, assets, createAuditCycle, currentUser } = useApp()

  const [name, setName] = useState('')
  const [departmentId, setDepartmentId] = useState('all')
  const [location, setLocation] = useState('HQ Campus — All Facilities')
  const [leadAuditorId, setLeadAuditorId] = useState(currentUser.id)
  const [dueDate, setDueDate] = useState('2026-11-15')
  const [successMsg, setSuccessMsg] = useState('')

  // Calculate scoped assets count preview
  const scopedAssetCount = assets.filter((a) => {
    if (departmentId !== 'all' && a.departmentId !== departmentId) return false
    return true
  }).length

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    const auditor = users.find((u) => u.id === leadAuditorId) || currentUser
    const dept = departments.find((d) => d.id === departmentId)

    const newCycle = createAuditCycle({
      name: name.trim(),
      departmentId: departmentId === 'all' ? undefined : departmentId,
      departmentName: departmentId === 'all' ? 'All Enterprise Departments' : (dept?.name || 'Department'),
      location: location.trim(),
      leadAuditorId: auditor.id,
      leadAuditorName: auditor.name,
      leadAuditorAvatar: auditor.avatar,
      startDate: new Date().toISOString().split('T')[0],
      dueDate,
    })

    setSuccessMsg(`Audit cycle "${newCycle.cycleCode}" initiated with ${newCycle.items.length} scoped assets!`)
    setTimeout(() => {
      onClose()
      setSuccessMsg('')
      setName('')
      onCycleCreated(newCycle.id)
    }, 1200)
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Physical Inventory Audit Cycle"
      description="Scope physical verification cycles to departments or campus locations for periodic inventory control."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {successMsg && (
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <Input
          label="Audit Cycle Title"
          placeholder="e.g. Q4 Fiscal Physical Inventory — Core R&D Lab"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-700">Department Scope</label>
            <select
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Departments ({assets.length} assets)</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({assets.filter((a) => a.departmentId === d.id).length} assets)
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-700">Lead Auditor</label>
            <select
              value={leadAuditorId}
              onChange={(e) => setLeadAuditorId(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role.replace('_', ' ')})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Location Scope"
            placeholder="e.g. HQ Building 1 - Lab Floor"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
            leftIcon={<MapPin className="w-4 h-4 text-slate-400" />}
          />

          <Input
            label="Target Due Date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            required
            leftIcon={<Calendar className="w-4 h-4 text-slate-400" />}
          />
        </div>

        {/* Live Scoping Preview Banner */}
        <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-100 flex items-center justify-between text-xs text-indigo-900">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            <span>
              Initializes checklist with <strong>{scopedAssetCount} active physical assets</strong>.
            </span>
          </div>
          <span className="font-mono text-[11px] font-bold text-indigo-700 bg-white px-2 py-0.5 rounded border border-indigo-200">
            {scopedAssetCount} Items Scoped
          </span>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={!name.trim() || scopedAssetCount === 0}
            leftIcon={<UserCheck className="w-4 h-4" />}
          >
            Launch Audit Cycle
          </Button>
        </div>
      </form>
    </Modal>
  )
}
