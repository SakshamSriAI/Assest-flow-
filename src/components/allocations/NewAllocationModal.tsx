import React, { useState } from 'react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { useApp } from '../../context/AppContext'
import { Asset, User } from '../../types'
import { AssetStateBadge } from '../ui/Badge'
import { ConflictBlockerModal } from './ConflictBlockerModal'
import { UserCheck, Calendar, AlertTriangle, CheckCircle2 } from 'lucide-react'

interface NewAllocationModalProps {
  isOpen: boolean
  onClose: () => void
  initialAsset?: Asset | null
}

export const NewAllocationModal: React.FC<NewAllocationModalProps> = ({
  isOpen,
  onClose,
  initialAsset,
}) => {
  const { assets, users, allocateAsset } = useApp()

  const [selectedAssetId, setSelectedAssetId] = useState(
    initialAsset?.id || assets[0]?.id || ''
  )
  const [selectedUserId, setSelectedUserId] = useState(users[0]?.id || '')
  const [expectedReturnDate, setExpectedReturnDate] = useState('2026-11-15')
  const [notes, setNotes] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Conflict state
  const [isConflictOpen, setIsConflictOpen] = useState(false)
  const [conflictAsset, setConflictAsset] = useState<Asset | null>(null)
  const [targetRecipientUser, setTargetRecipientUser] = useState<User | null>(null)

  const activeAsset = assets.find((a) => a.id === selectedAssetId) || assets[0]
  const targetUser = users.find((u) => u.id === selectedUserId) || users[0]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setSuccessMsg('')

    if (!activeAsset || !targetUser) return

    // CHECK CONFLICT RULE: If asset is already allocated, trigger Conflict Blocker!
    if (activeAsset.status === 'Allocated') {
      setConflictAsset(activeAsset)
      setTargetRecipientUser(targetUser)
      setIsConflictOpen(true)
      return
    }

    const res = allocateAsset(activeAsset.id, targetUser.id, expectedReturnDate, notes)
    if (!res.success) {
      if (res.conflict) {
        setConflictAsset(activeAsset)
        setTargetRecipientUser(targetUser)
        setIsConflictOpen(true)
      } else {
        setErrorMsg(res.error || 'Failed to allocate asset.')
      }
    } else {
      setSuccessMsg(`Asset ${activeAsset.tag} allocated to ${targetUser.name}!`)
      setTimeout(() => {
        onClose()
        setSuccessMsg('')
        setNotes('')
      }, 1200)
    }
  }

  return (
    <>
      <Modal
        isOpen={isOpen && !isConflictOpen}
        onClose={onClose}
        title="Allocate Physical Asset"
        description="Assign equipment custody to an employee with verified expected return date."
        maxWidth="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Select Asset */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-700">Select Equipment to Allocate</label>
            <select
              value={selectedAssetId}
              onChange={(e) => setSelectedAssetId(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
            >
              {assets.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.tag} — {a.name} [{a.status}]
                </option>
              ))}
            </select>
          </div>

          {/* Asset Status Preview Pill */}
          {activeAsset && (
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
              <div>
                <span className="font-semibold text-slate-800 block">{activeAsset.name}</span>
                <span className="text-[11px] text-slate-500">
                  Location: {activeAsset.location} &bull; Dept: {activeAsset.departmentName}
                </span>
              </div>
              <AssetStateBadge status={activeAsset.status} size="xs" />
            </div>
          )}

          {/* Recipient User */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-700">Assign To (Recipient)</label>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} — {u.title} ({u.department})
                </option>
              ))}
            </select>
          </div>

          {/* Expected Return Date */}
          <Input
            label="Expected Return Date"
            type="date"
            value={expectedReturnDate}
            onChange={(e) => setExpectedReturnDate(e.target.value)}
            required
            leftIcon={<Calendar className="w-4 h-4" />}
            helperText="Used by operational engine to trigger Overdue Return alerts"
          />

          {/* Notes */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-700">Deployment Notes / Project Scope</label>
            <textarea
              rows={2}
              placeholder="e.g. Standard workstation deployment for sprint cycles"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" leftIcon={<UserCheck className="w-3.5 h-3.5" />}>
              Execute Allocation
            </Button>
          </div>
        </form>
      </Modal>

      {/* Triggered Conflict Blocker Modal when Double-Allocation is Blocked */}
      <ConflictBlockerModal
        isOpen={isConflictOpen}
        onClose={() => {
          setIsConflictOpen(false)
          onClose()
        }}
        conflictAsset={conflictAsset}
        targetRecipient={targetRecipientUser}
        expectedReturnDate={expectedReturnDate}
      />
    </>
  )
}
