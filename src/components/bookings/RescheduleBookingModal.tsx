import React, { useState, useEffect } from 'react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { useApp } from '../../context/AppContext'
import { ResourceBooking } from '../../types'
import { AlertCircle, Calendar, Clock, CheckCircle2, RefreshCw, User, MapPin } from 'lucide-react'

interface RescheduleBookingModalProps {
  isOpen: boolean
  onClose: () => void
  booking: ResourceBooking | null
}

export const RescheduleBookingModal: React.FC<RescheduleBookingModalProps> = ({
  isOpen,
  onClose,
  booking,
}) => {
  const { rescheduleBooking, bookings } = useApp()

  const [newDate, setNewDate] = useState('')
  const [newStartTime, setNewStartTime] = useState('')
  const [newEndTime, setNewEndTime] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => {
    if (booking && isOpen) {
      setNewDate(booking.date)
      setNewStartTime(booking.startTime)
      setNewEndTime(booking.endTime)
      setErrorMsg('')
      setSuccessMsg('')
    }
  }, [booking, isOpen])

  if (!booking) return null

  // Check if prospective timeslot conflicts in real-time
  const prospectiveConflict = bookings.find((b) => {
    if (b.id === booking.id || b.resourceId !== booking.resourceId || b.date !== newDate || b.status === 'Cancelled') {
      return false
    }
    return newStartTime < b.endTime && newEndTime > b.startTime
  })

  const handleReschedule = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setSuccessMsg('')

    if (newStartTime >= newEndTime) {
      setErrorMsg('Start time must be strictly earlier than end time.')
      return
    }

    const result = rescheduleBooking(booking.id, newDate, newStartTime, newEndTime)
    if (!result.success) {
      setErrorMsg(result.error || 'Reschedule conflict detected.')
    } else {
      setSuccessMsg(`Reservation rescheduled successfully to ${newDate} (${newStartTime} - ${newEndTime})!`)
      setTimeout(() => {
        onClose()
        setSuccessMsg('')
      }, 1200)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Reschedule Resource Reservation"
      description="Update reservation date or time slot. Deterministic overlap engine prevents temporal collisions."
      maxWidth="md"
    >
      <form onSubmit={handleReschedule} className="space-y-4">
        {/* Current Reservation Summary Card */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-800">{booking.resourceName}</span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-medium">
              Current: {booking.startTime} - {booking.endTime}
            </span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-500">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              {booking.date}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              {booking.location}
            </span>
            <span className="flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-slate-400" />
              {booking.bookedByUserName}
            </span>
          </div>
          <p className="text-[11px] text-slate-600 italic">"{booking.purpose}"</p>
        </div>

        {/* Live Temporal Collision Warning Banner */}
        {prospectiveConflict && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
            <div>
              <strong className="font-semibold block text-rose-900">Deterministic Collision Detected</strong>
              <span>
                {booking.resourceName} is already reserved by <strong>{prospectiveConflict.bookedByUserName}</strong> ({prospectiveConflict.startTime} - {prospectiveConflict.endTime}) on {newDate}.
              </span>
            </div>
          </div>
        )}

        {errorMsg && !prospectiveConflict && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
            <div>
              <strong className="font-semibold block">Overlap Rejection</strong>
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

        {/* New Schedule Inputs */}
        <div className="space-y-3 pt-1">
          <Input
            label="New Booking Date"
            type="date"
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
            required
            leftIcon={<Calendar className="w-4 h-4" />}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="New Start Time"
              type="time"
              value={newStartTime}
              onChange={(e) => setNewStartTime(e.target.value)}
              required
              leftIcon={<Clock className="w-4 h-4" />}
            />
            <Input
              label="New End Time"
              type="time"
              value={newEndTime}
              onChange={(e) => setNewEndTime(e.target.value)}
              required
              leftIcon={<Clock className="w-4 h-4" />}
            />
          </div>
        </div>

        {/* Rules note */}
        <div className="p-2.5 rounded-lg bg-indigo-50/50 border border-indigo-100 text-[11px] text-indigo-700">
          <p className="font-medium">Client-Side Collision Engine:</p>
          <p className="text-slate-600 mt-0.5">
            Evaluates formula: <code className="font-mono bg-white px-1 py-0.5 rounded border border-indigo-200 text-[10px]">(Start_A &lt; End_B) &amp;&amp; (End_A &gt; Start_B)</code> ensuring zero overlapping reservations.
          </p>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={!!prospectiveConflict || !newDate || !newStartTime || !newEndTime}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Confirm Reschedule
          </Button>
        </div>
      </form>
    </Modal>
  )
}
