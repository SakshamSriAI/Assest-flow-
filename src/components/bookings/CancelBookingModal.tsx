import React, { useState } from 'react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { useApp } from '../../context/AppContext'
import { ResourceBooking } from '../../types'
import { AlertTriangle, Calendar, Clock, MapPin, XCircle } from 'lucide-react'

interface CancelBookingModalProps {
  isOpen: boolean
  onClose: () => void
  booking: ResourceBooking | null
}

export const CancelBookingModal: React.FC<CancelBookingModalProps> = ({
  isOpen,
  onClose,
  booking,
}) => {
  const { cancelBooking } = useApp()
  const [reason, setReason] = useState('')

  if (!booking) return null

  const handleConfirmCancel = () => {
    cancelBooking(booking.id)
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Cancel Shared Resource Reservation"
      description="Release reserved time slot back into enterprise pool for other teams to book."
      maxWidth="md"
    >
      <div className="space-y-4">
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
          <div className="text-xs text-amber-900 space-y-1">
            <p className="font-semibold">Release Timeslot Confirmation</p>
            <p>
              Cancelling this reservation will immediately unlock the timeslot for <strong>{booking.resourceName}</strong> on <strong>{booking.date}</strong> ({booking.startTime} - {booking.endTime}).
            </p>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-2">
          <div className="flex justify-between">
            <span className="text-slate-500">Resource:</span>
            <span className="font-medium text-slate-800">{booking.resourceName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Timeslot:</span>
            <span className="font-mono text-slate-800">{booking.date} ({booking.startTime} - {booking.endTime})</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Booked By:</span>
            <span className="font-medium text-slate-800">{booking.bookedByUserName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Original Purpose:</span>
            <span className="text-slate-700 italic font-mono text-[11px]">{booking.purpose}</span>
          </div>
        </div>

        <Input
          label="Cancellation Reason (Optional)"
          placeholder="e.g. Meeting moved to virtual / hardware test postponed"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />

        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={onClose}>
            Keep Reservation
          </Button>
          <Button
            type="button"
            variant="danger"
            size="sm"
            onClick={handleConfirmCancel}
            leftIcon={<XCircle className="w-4 h-4" />}
          >
            Confirm Cancellation
          </Button>
        </div>
      </div>
    </Modal>
  )
}
