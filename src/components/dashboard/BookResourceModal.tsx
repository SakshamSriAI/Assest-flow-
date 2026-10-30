import React, { useState, useEffect } from 'react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { useApp } from '../../context/AppContext'
import { AlertCircle, Calendar, Clock, CheckCircle2 } from 'lucide-react'

export interface BookResourceModalProps {
  isOpen: boolean
  onClose: () => void
  initialResourceId?: string
  initialDate?: string
  initialStartTime?: string
  initialEndTime?: string
}

export const BookResourceModal: React.FC<BookResourceModalProps> = ({
  isOpen,
  onClose,
  initialResourceId,
  initialDate,
  initialStartTime,
  initialEndTime,
}) => {
  const { assets, currentUser, bookResource } = useApp()

  // Filter bookable assets (e.g. rooms, test benches, vehicles)
  const bookableAssets = assets.filter((a) => a.isBookable)

  const [selectedAssetId, setSelectedAssetId] = useState(bookableAssets[0]?.id || '')
  const [date, setDate] = useState('2026-10-30')
  const [startTime, setStartTime] = useState('14:00')
  const [endTime, setEndTime] = useState('16:00')
  const [purpose, setPurpose] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => {
    if (isOpen) {
      if (initialResourceId && bookableAssets.some((a) => a.id === initialResourceId)) {
        setSelectedAssetId(initialResourceId)
      } else if (bookableAssets.length > 0 && !selectedAssetId) {
        setSelectedAssetId(bookableAssets[0].id)
      }
      if (initialDate) setDate(initialDate)
      if (initialStartTime) setStartTime(initialStartTime)
      if (initialEndTime) setEndTime(initialEndTime)
      setErrorMsg('')
      setSuccessMsg('')
    }
  }, [isOpen, initialResourceId, initialDate, initialStartTime, initialEndTime])

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setSuccessMsg('')

    if (startTime >= endTime) {
      setErrorMsg('Start time must be strictly earlier than end time.')
      return
    }

    const asset = bookableAssets.find((a) => a.id === selectedAssetId) || bookableAssets[0]
    if (!asset) {
      setErrorMsg('No bookable resource selected.')
      return
    }

    const result = bookResource({
      resourceId: asset.id,
      resourceName: asset.name,
      categoryName: asset.categoryName,
      bookedByUserId: currentUser.id,
      bookedByUserName: currentUser.name,
      bookedByUserAvatar: currentUser.avatar,
      date,
      startTime,
      endTime,
      purpose: purpose || 'General project usage',
      status: 'Upcoming',
      location: asset.location,
    })

    if (!result.success) {
      setErrorMsg(result.error || 'Scheduling conflict detected.')
    } else {
      setSuccessMsg(`Booking confirmed for ${asset.name} on ${date} (${startTime} - ${endTime})!`)
      setTimeout(() => {
        onClose()
        setSuccessMsg('')
        setPurpose('')
      }, 1200)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Reserve Shared Resource"
      description="Book shared conference spaces, field vehicles, and lab equipment with collision prevention."
      maxWidth="md"
    >
      <form onSubmit={handleBooking} className="space-y-4">
        {errorMsg && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
            <div>
              <strong className="font-semibold block">Overlap Collision Blocked</strong>
              <span>{errorMsg}</span>
            </div>
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <div className="space-y-1">
          <label className="block text-xs font-medium text-slate-700">Select Shared Asset</label>
          <select
            value={selectedAssetId}
            onChange={(e) => setSelectedAssetId(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
          >
            {bookableAssets.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} ({a.location})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            label="Booking Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            leftIcon={<Calendar className="w-4 h-4" />}
          />
          <Input
            label="Start Time"
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
            leftIcon={<Clock className="w-4 h-4" />}
          />
          <Input
            label="End Time"
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            required
            leftIcon={<Clock className="w-4 h-4" />}
          />
        </div>

        <Input
          label="Purpose / Business Justification"
          placeholder="e.g. Q4 Executive Sprint Retrospective"
          value={purpose}
          onChange={(e) => setPurpose(e.target.value)}
          required
        />

        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-500 space-y-1">
          <p className="font-semibold text-slate-700">Collision Rule Guarantee:</p>
          <p>The temporal intersection engine mathematically validates timeslots and blocks overlapping bookings across all enterprise users.</p>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm">
            Confirm Reservation
          </Button>
        </div>
      </form>
    </Modal>
  )
}
