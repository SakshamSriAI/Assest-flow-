import React, { useState } from 'react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { MaintenanceTicket } from '../../types'
import { Wrench, UserCheck, ShieldAlert } from 'lucide-react'

interface AssignTechnicianModalProps {
  isOpen: boolean
  onClose: () => void
  ticket: MaintenanceTicket | null
  onAssign: (ticketId: string, technician: string, startRepair: boolean) => void
}

const COMMON_TECHNICIANS = [
  'Apex Enterprise Field Engineering',
  'Internal IT Depot (Marcus Sterling)',
  'Keysight Certified Calibration Lab',
  'Tesla Mobile Service Fleet Engineering',
  'Schneider Electric Critical Power Services',
  'Apple Enterprise Field Support Team',
]

export const AssignTechnicianModal: React.FC<AssignTechnicianModalProps> = ({
  isOpen,
  onClose,
  ticket,
  onAssign,
}) => {
  const [selectedTech, setSelectedTech] = useState(COMMON_TECHNICIANS[0])
  const [customTech, setCustomTech] = useState('')
  const [autoStartRepair, setAutoStartRepair] = useState(true)

  if (!ticket) return null

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault()
    const technicianName = customTech.trim() || selectedTech
    onAssign(ticket.id, technicianName, autoStartRepair)
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Assign Field Technician"
      description={`Dispatch internal technician or certified external service provider for Ticket #${ticket.ticketNumber}.`}
      maxWidth="md"
    >
      <form onSubmit={handleConfirm} className="space-y-4">
        {/* Ticket Summary */}
        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1.5">
          <div className="flex items-center justify-between font-semibold text-slate-800">
            <span>{ticket.assetName}</span>
            <span className="font-mono text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
              {ticket.assetTag}
            </span>
          </div>
          <p className="text-slate-600 italic">"{ticket.issueDescription}"</p>
          <div className="text-[11px] text-slate-500 pt-1">
            Priority:{' '}
            <strong
              className={
                ticket.priority === 'Critical'
                  ? 'text-rose-600'
                  : ticket.priority === 'High'
                  ? 'text-amber-600'
                  : 'text-slate-700'
              }
            >
              {ticket.priority}
            </strong>
          </div>
        </div>

        {/* Technician Selection */}
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-slate-700">
            Select Certified Technician / Vendor
          </label>
          <select
            value={selectedTech}
            onChange={(e) => {
              setSelectedTech(e.target.value)
              setCustomTech('')
            }}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
          >
            {COMMON_TECHNICIANS.map((tech) => (
              <option key={tech} value={tech}>
                {tech}
              </option>
            ))}
            <option value="custom">Other / Custom Service Provider...</option>
          </select>
        </div>

        {selectedTech === 'custom' && (
          <Input
            label="Custom Technician / Provider Name"
            placeholder="e.g. Specialized Optics Lab Services"
            value={customTech}
            onChange={(e) => setCustomTech(e.target.value)}
            required
            autoFocus
          />
        )}

        {/* Auto start repair toggle */}
        <div className="p-3 rounded-lg bg-indigo-50/60 border border-indigo-100 flex items-start gap-2.5">
          <input
            type="checkbox"
            id="autoStart"
            checked={autoStartRepair}
            onChange={(e) => setAutoStartRepair(e.target.checked)}
            className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
          />
          <label htmlFor="autoStart" className="text-xs text-indigo-900 cursor-pointer select-none">
            <span className="font-semibold block">Begin Repair Immediately (Transition to In Progress)</span>
            <span className="text-[11px] text-indigo-700">
              Couples asset state to <strong>"Under Maintenance"</strong>, locking out new employee allocations.
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
            leftIcon={<UserCheck className="w-4 h-4" />}
          >
            Confirm Assignment
          </Button>
        </div>
      </form>
    </Modal>
  )
}
