import React, { useState } from 'react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { useApp } from '../../context/AppContext'
import { AssetState } from '../../types'
import { Boxes, Sparkles, QrCode } from 'lucide-react'

interface RegisterAssetModalProps {
  isOpen: boolean
  onClose: () => void
}

export const RegisterAssetModal: React.FC<RegisterAssetModalProps> = ({ isOpen, onClose }) => {
  const { categories, departments, registerAsset, assets } = useApp()

  const [name, setName] = useState('')
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '')
  const [departmentId, setDepartmentId] = useState(departments[0]?.id || '')
  const [condition, setCondition] = useState<'New' | 'Good' | 'Fair'>('New')
  const [status, setStatus] = useState<AssetState>('Available')
  const [costTracking, setCostTracking] = useState(1499)
  const [location, setLocation] = useState('HQ Floor 3 - Central Tech Vault')
  const [serialNumber, setSerialNumber] = useState('')
  const [isBookable, setIsBookable] = useState(false)

  const previewTag = `AF-${(assets.length + 1).toString().padStart(4, '0')}`

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    const cat = categories.find((c) => c.id === categoryId) || categories[0]
    const dept = departments.find((d) => d.id === departmentId) || departments[0]

    registerAsset({
      name,
      categoryId: cat.id,
      categoryName: cat.name,
      departmentId: dept.id,
      departmentName: dept.name,
      status,
      condition,
      isBookable,
      costTracking: Number(costTracking) || 0,
      location,
      serialNumber: serialNumber || `SN-${Math.floor(100000 + Math.random() * 900000)}`,
    })

    // Reset form and close
    setName('')
    setSerialNumber('')
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Register New Physical Asset"
      description="Quickly commission physical inventory with auto-generated asset tag and barcode."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Auto-generated Tag Preview Banner */}
        <div className="p-3 bg-indigo-50/70 border border-indigo-200/80 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-indigo-600 text-white">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-indigo-700 tracking-wider block">
                Assigned Asset Tag
              </span>
              <span className="font-mono font-extrabold text-sm text-indigo-950">{previewTag}</span>
            </div>
          </div>
          <span className="text-[11px] text-indigo-700 bg-white px-2 py-0.5 rounded border border-indigo-200 font-mono">
            Auto-Increment
          </span>
        </div>

        <Input
          label="Asset Specification / Model Name"
          placeholder="e.g. MacBook Pro 14' M3 Pro, 18GB, 512GB"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-700">Asset Category</label>
            <select
              value={categoryId}
              onChange={(e) => {
                setCategoryId(e.target.value)
                const c = categories.find((cat) => cat.id === e.target.value)
                if (c) setIsBookable(c.isBookable)
              }}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.code})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-700">Custodial Department</label>
            <select
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
            >
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            label="Serial Number"
            placeholder="e.g. C02G90J0MD6T"
            value={serialNumber}
            onChange={(e) => setSerialNumber(e.target.value)}
          />

          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-700">Physical Condition</label>
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value as any)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
            >
              <option value="New">Brand New / Factory Sealed</option>
              <option value="Good">Good / Field Ready</option>
              <option value="Fair">Fair / Minor Wear</option>
            </select>
          </div>

          <Input
            label="Acquisition Cost ($)"
            type="number"
            min="0"
            value={costTracking}
            onChange={(e) => setCostTracking(Number(e.target.value))}
            helperText="Reporting purposes only"
          />
        </div>

        <Input
          label="Physical Location / Storage Bay"
          placeholder="e.g. HQ Floor 3 - Cabinet 4A"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          required
        />

        <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isBookable}
              onChange={(e) => setIsBookable(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
            />
            <span className="text-xs font-semibold text-slate-800">
              Shared Bookable Resource (Eligible for calendar scheduling)
            </span>
          </label>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm">
            Commission Asset
          </Button>
        </div>
      </form>
    </Modal>
  )
}
