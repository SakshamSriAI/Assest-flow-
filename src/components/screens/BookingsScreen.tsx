import React, { useState, useMemo } from 'react'
import { useApp } from '../../context/AppContext'
import { AssetStateBadge, BookingBadge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Card, CardHeader } from '../ui/Card'
import { BookResourceModal } from '../dashboard/BookResourceModal'
import { RescheduleBookingModal } from '../bookings/RescheduleBookingModal'
import { CancelBookingModal } from '../bookings/CancelBookingModal'
import { ResourceBooking, BookingStatus, Asset } from '../../types'
import {
  Calendar as CalendarIcon,
  Clock,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Play,
  RotateCcw,
  DoorOpen,
  Car,
  Cpu,
  Layers,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  MapPin,
  User,
  Info,
  CalendarDays,
  Sparkles,
} from 'lucide-react'

export const BookingsScreen: React.FC = () => {
  const { bookings, assets, currentUser, updateBookingStatus } = useApp()

  // Navigation & View Mode
  const [activeTab, setActiveTab] = useState<'timeline' | 'directory' | 'simulator'>('timeline')
  const [selectedDate, setSelectedDate] = useState('2026-10-30')
  const [categoryFilter, setCategoryFilter] = useState('all')

  // Search & Status filters for Directory
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Modals state
  const [isBookModalOpen, setIsBookModalOpen] = useState(false)
  const [bookModalPrefill, setBookModalPrefill] = useState<{
    resourceId?: string
    date?: string
    startTime?: string
    endTime?: string
  }>({})

  const [rescheduleModalData, setRescheduleModalData] = useState<{
    isOpen: boolean
    booking: ResourceBooking | null
  }>({ isOpen: false, booking: null })

  const [cancelModalData, setCancelModalData] = useState<{
    isOpen: boolean
    booking: ResourceBooking | null
  }>({ isOpen: false, booking: null })

  // Selected Booking Details Popover in Timeline
  const [activeBookingDetail, setActiveBookingDetail] = useState<ResourceBooking | null>(null)

  // Simulator State
  const [simResourceId, setSimResourceId] = useState('')
  const [simDate, setSimDate] = useState('2026-10-30')
  const [simStartTime, setSimStartTime] = useState('14:30')
  const [simEndTime, setSimEndTime] = useState('15:30')

  // Filter bookable assets
  const bookableAssets = useMemo(() => {
    return assets.filter((a) => a.isBookable)
  }, [assets])

  const filteredBookableAssets = useMemo(() => {
    if (categoryFilter === 'all') return bookableAssets
    return bookableAssets.filter((a) => a.categoryId === categoryFilter)
  }, [bookableAssets, categoryFilter])

  // Set default sim resource id if empty
  React.useEffect(() => {
    if (!simResourceId && bookableAssets.length > 0) {
      setSimResourceId(bookableAssets[0].id)
    }
  }, [bookableAssets, simResourceId])

  // KPIs
  const ongoingCount = bookings.filter((b) => b.status === 'Ongoing').length
  const upcomingCount = bookings.filter((b) => b.status === 'Upcoming').length
  const completedCount = bookings.filter((b) => b.status === 'Completed').length
  const cancelledCount = bookings.filter((b) => b.status === 'Cancelled').length

  // Date navigation handlers
  const handlePrevDay = () => {
    const cur = new Date(selectedDate)
    cur.setDate(cur.getDate() - 1)
    setSelectedDate(cur.toISOString().split('T')[0])
  }

  const handleNextDay = () => {
    const cur = new Date(selectedDate)
    cur.setDate(cur.getDate() + 1)
    setSelectedDate(cur.toISOString().split('T')[0])
  }

  const handleToday = () => {
    setSelectedDate('2026-10-30')
  }

  // Handle clicking on an empty slot in the timeline
  const handleEmptySlotClick = (resource: Asset, hour: number) => {
    const startStr = `${hour.toString().padStart(2, '0')}:00`
    const endStr = `${(hour + 1).toString().padStart(2, '0')}:00`
    setBookModalPrefill({
      resourceId: resource.id,
      date: selectedDate,
      startTime: startStr,
      endTime: endStr,
    })
    setIsBookModalOpen(true)
  }

  // Directory Filtered Bookings
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      // Status filter
      if (statusFilter !== 'all' && b.status !== statusFilter) return false

      // Category filter
      if (categoryFilter !== 'all') {
        const asset = assets.find((a) => a.id === b.resourceId)
        if (asset && asset.categoryId !== categoryFilter) return false
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        const matchName = b.resourceName.toLowerCase().includes(query)
        const matchBooker = b.bookedByUserName.toLowerCase().includes(query)
        const matchPurpose = b.purpose.toLowerCase().includes(query)
        const matchLocation = b.location.toLowerCase().includes(query)
        if (!matchName && !matchBooker && !matchPurpose && !matchLocation) return false
      }

      return true
    })
  }, [bookings, statusFilter, categoryFilter, searchQuery, assets])

  // Collision Simulator Check
  const simResult = useMemo(() => {
    if (!simResourceId || !simDate || !simStartTime || !simEndTime) return null

    if (simStartTime >= simEndTime) {
      return {
        isValid: false,
        error: 'Start time must be strictly earlier than end time.',
      }
    }

    const collision = bookings.find((b) => {
      if (b.resourceId !== simResourceId || b.date !== simDate || b.status === 'Cancelled') {
        return false
      }
      return simStartTime < b.endTime && simEndTime > b.startTime
    })

    if (collision) {
      return {
        isValid: false,
        collision,
        error: `Deterministic Collision Detected: Overlaps with reservation by ${collision.bookedByUserName} (${collision.startTime} - ${collision.endTime}) for "${collision.purpose}".`,
      }
    }

    return {
      isValid: true,
      message: `Zero collisions detected! Timeslot (${simStartTime} - ${simEndTime}) on ${simDate} is 100% available for booking.`,
    }
  }, [simResourceId, simDate, simStartTime, simEndTime, bookings])

  // Timeline hours (08:00 to 20:00 -> 12 hours)
  const timelineHours = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]

  // Time conversion helper
  const parseTimeToMinutes = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number)
    return h * 60 + (m || 0)
  }

  // Calculate position & width percentage for a booking block on the timeline (8:00 to 20:00 = 720 minutes)
  const getBookingStyle = (startTime: string, endTime: string) => {
    const baseMinutes = 8 * 60
    const totalMinutes = 12 * 60

    const startMinutes = Math.max(0, parseTimeToMinutes(startTime) - baseMinutes)
    const endMinutes = Math.min(totalMinutes, parseTimeToMinutes(endTime) - baseMinutes)

    const leftPercent = (startMinutes / totalMinutes) * 100
    const widthPercent = Math.max(2, ((endMinutes - startMinutes) / totalMinutes) * 100)

    return {
      left: `${leftPercent}%`,
      width: `${widthPercent}%`,
    }
  }

  // Get icon by category
  const getCategoryIcon = (categoryId: string) => {
    switch (categoryId) {
      case 'cat-room':
        return <DoorOpen className="w-4 h-4 text-[#0F2F57]" />
      case 'cat-veh':
        return <Car className="w-4 h-4 text-[#2563EB]" />
      case 'cat-lab':
        return <Cpu className="w-4 h-4 text-[#047857]" />
      default:
        return <Layers className="w-4 h-4 text-[#2563EB]" />
    }
  }

  // Role permissions check
  const canManageBooking = (booking: ResourceBooking) => {
    if (currentUser.role === 'admin' || currentUser.role === 'asset_manager') return true
    return booking.bookedByUserId === currentUser.id
  }

  return (
    <div className="space-y-6">
      {/* Modals */}
      <BookResourceModal
        isOpen={isBookModalOpen}
        onClose={() => {
          setIsBookModalOpen(false)
          setBookModalPrefill({})
        }}
        initialResourceId={bookModalPrefill.resourceId}
        initialDate={bookModalPrefill.date}
        initialStartTime={bookModalPrefill.startTime}
        initialEndTime={bookModalPrefill.endTime}
      />

      <RescheduleBookingModal
        isOpen={rescheduleModalData.isOpen}
        onClose={() => setRescheduleModalData({ isOpen: false, booking: null })}
        booking={rescheduleModalData.booking}
      />

      <CancelBookingModal
        isOpen={cancelModalData.isOpen}
        onClose={() => setCancelModalData({ isOpen: false, booking: null })}
        booking={cancelModalData.booking}
      />

      {/* Screen Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-[#0F172A] tracking-tight font-heading">
              Resource Booking
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0] flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-[#10B981]" />
              Zero-Overlap Active
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setBookModalPrefill({ date: selectedDate })
              setIsBookModalOpen(true)
            }}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Reserve Shared Resource
          </Button>
        </div>
      </div>

      {/* Operational KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-3.5 rounded-xl border border-[#BFDBFE] bg-gradient-to-br from-[#EFF6FF]/60 to-white shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#64748B]">In-Use / Ongoing</span>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#2563EB]"></span>
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#2563EB] font-mono">{ongoingCount}</span>
            <span className="text-[11px] text-[#2563EB] font-medium">Active sessions right now</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-[#BFDBFE] bg-gradient-to-br from-[#EFF6FF]/60 to-white shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#64748B]">Upcoming Reservations</span>
            <CalendarDays className="w-4 h-4 text-[#2563EB]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#2563EB] font-mono">{upcomingCount}</span>
            <span className="text-[11px] text-[#2563EB] font-medium">Scheduled ahead</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-[#A7F3D0] bg-gradient-to-br from-[#ECFDF5]/60 to-white shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#64748B]">Completed Sessions</span>
            <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#047857] font-mono">{completedCount}</span>
            <span className="text-[11px] text-[#047857] font-medium">Fulfilled without conflict</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-[#E2E8F0] bg-white shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#64748B]">Cancelled / Released</span>
            <XCircle className="w-4 h-4 text-[#64748B]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#0F172A] font-mono">{cancelledCount}</span>
            <span className="text-[11px] text-[#64748B]">Slots reclaimed</span>
          </div>
        </div>
      </div>

      {/* Main Mode Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-lg">
          <button
            onClick={() => setActiveTab('timeline')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === 'timeline'
                ? 'bg-white text-indigo-700 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CalendarIcon className="w-3.5 h-3.5" />
            Interactive Timeline & Gantt
          </button>
          <button
            onClick={() => setActiveTab('directory')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === 'directory'
                ? 'bg-white text-indigo-700 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Reservation Directory ({bookings.length})
          </button>
          <button
            onClick={() => setActiveTab('simulator')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === 'simulator'
                ? 'bg-white text-indigo-700 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Overlap Rule Simulator
          </button>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          <span className="text-[11px] text-slate-400 font-medium mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Category:
          </span>
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
              categoryFilter === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Shared ({bookableAssets.length})
          </button>
          <button
            onClick={() => setCategoryFilter('cat-room')}
            className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-1 ${
              categoryFilter === 'cat-room'
                ? 'bg-[#0F2F57] text-white shadow-xs'
                : 'bg-[#0F2F57]/10 text-[#0F2F57] hover:bg-[#0F2F57]/20'
            }`}
          >
            <DoorOpen className="w-3 h-3" /> Rooms
          </button>
          <button
            onClick={() => setCategoryFilter('cat-veh')}
            className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-1 ${
              categoryFilter === 'cat-veh'
                ? 'bg-[#2563EB] text-white shadow-xs'
                : 'bg-[#EFF6FF] text-[#2563EB] hover:bg-[#DBEAFE]'
            }`}
          >
            <Car className="w-3 h-3" /> Fleet
          </button>
          <button
            onClick={() => setCategoryFilter('cat-lab')}
            className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-1 ${
              categoryFilter === 'cat-lab'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            <Cpu className="w-3 h-3" /> Lab Benches
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: INTERACTIVE TIMELINE & HOURLY SCHEDULE GRID */}
      {/* ========================================================================= */}
      {activeTab === 'timeline' && (
        <div className="space-y-4">
          {/* Date Selector Navigation Toolbar */}
          <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="xs" onClick={handlePrevDay} leftIcon={<ChevronLeft className="w-3.5 h-3.5" />}>
                Prev
              </Button>
              <Button
                variant={selectedDate === '2026-10-30' ? 'primary' : 'secondary'}
                size="xs"
                onClick={handleToday}
              >
                Today (Oct 30)
              </Button>
              <Button variant="secondary" size="xs" onClick={handleNextDay} leftIcon={<ChevronRight className="w-3.5 h-3.5" />}>
                Next
              </Button>

              <div className="h-4 w-px bg-slate-200 mx-1" />

              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="text-xs font-semibold text-slate-800 border border-slate-300 rounded-lg px-2.5 py-1 focus:outline-none focus:border-indigo-500 bg-white"
              />

              <span className="text-xs font-medium text-slate-500 hidden md:inline">
                {new Date(selectedDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>

            {/* Timeline Legend */}
            <div className="flex items-center gap-3 text-[11px] text-slate-600">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-blue-500 ring-2 ring-blue-200 inline-block" />
                Ongoing (In-Use)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-indigo-500 inline-block" />
                Upcoming
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" />
                Completed
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-slate-300 border border-slate-400 inline-block" />
                Empty (Click to Book)
              </span>
            </div>
          </div>

          {/* Interactive Timeline Grid Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <div className="min-w-[950px]">
                {/* Timeline Header Row (Hours: 08:00 - 20:00) */}
                <div className="grid grid-cols-12 border-b border-slate-200 bg-slate-50/80 text-[11px] font-mono text-slate-500 select-none">
                  <div className="col-span-3 p-3 font-sans font-semibold text-slate-700 text-xs border-r border-slate-200 flex items-center justify-between">
                    <span>Shared Asset Directory</span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      {filteredBookableAssets.length} bookable
                    </span>
                  </div>
                  <div className="col-span-9 grid grid-cols-12 divide-x divide-slate-200 text-center">
                    {timelineHours.map((hour) => (
                      <div key={hour} className="py-2.5">
                        <span className="font-semibold text-slate-700">{hour.toString().padStart(2, '0')}:00</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Timeline Resource Rows */}
                {filteredBookableAssets.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs">
                    No bookable resources match the selected category filter.
                  </div>
                ) : (
                  filteredBookableAssets.map((asset) => {
                    // Find all bookings for this resource on the selected date
                    const assetBookings = bookings.filter(
                      (b) => b.resourceId === asset.id && b.date === selectedDate
                    )

                    return (
                      <div
                        key={asset.id}
                        className="grid grid-cols-12 border-b border-slate-100 hover:bg-slate-50/40 transition-colors group"
                      >
                        {/* Resource Info Column */}
                        <div className="col-span-3 p-3 border-r border-slate-200 flex flex-col justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              {getCategoryIcon(asset.categoryId)}
                              <span className="text-xs font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                                {asset.name}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-slate-500">
                              <span className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-700 font-medium">
                                {asset.tag}
                              </span>
                              <span className="flex items-center gap-0.5 line-clamp-1">
                                <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                                {asset.location}
                              </span>
                            </div>
                          </div>

                          <div className="mt-2 flex items-center justify-between pt-1">
                            <AssetStateBadge status={asset.status} size="sm" />
                            <button
                              onClick={() => {
                                setBookModalPrefill({
                                  resourceId: asset.id,
                                  date: selectedDate,
                                  startTime: '10:00',
                                  endTime: '11:00',
                                })
                                setIsBookModalOpen(true)
                              }}
                              className="text-[10px] font-medium text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-0.5"
                            >
                              <Plus className="w-3 h-3" /> Book
                            </button>
                          </div>
                        </div>

                        {/* Timeline Grid Track */}
                        <div className="col-span-9 relative h-20 bg-white">
                          {/* 12-hour background grid lines */}
                          <div className="absolute inset-0 grid grid-cols-12 divide-x divide-slate-100 h-full pointer-events-none">
                            {timelineHours.map((hour) => (
                              <div
                                key={hour}
                                className="h-full hover:bg-indigo-50/20 transition-colors"
                              />
                            ))}
                          </div>

                          {/* Clickable slot buttons over each hour cell */}
                          <div className="absolute inset-0 grid grid-cols-12 h-full z-0">
                            {timelineHours.map((hour) => (
                              <button
                                key={hour}
                                onClick={() => handleEmptySlotClick(asset, hour)}
                                title={`Click to reserve ${asset.name} at ${hour}:00 on ${selectedDate}`}
                                className="h-full w-full hover:bg-indigo-50/50 hover:border hover:border-indigo-200 transition-all text-transparent hover:text-indigo-600 text-[10px] font-medium flex items-center justify-center group/cell"
                              >
                                <span className="opacity-0 group-hover/cell:opacity-100 bg-white/90 shadow-xs px-1.5 py-0.5 rounded border border-indigo-200">
                                  + {hour}:00
                                </span>
                              </button>
                            ))}
                          </div>

                          {/* Render Booked Interval Blocks */}
                          {assetBookings.map((bkg) => {
                            const style = getBookingStyle(bkg.startTime, bkg.endTime)
                            const isCancelled = bkg.status === 'Cancelled'
                            const isOngoing = bkg.status === 'Ongoing'
                            const isUpcoming = bkg.status === 'Upcoming'
                            const isCompleted = bkg.status === 'Completed'

                            let blockClasses =
                              'bg-indigo-50 border-indigo-300 text-indigo-900 shadow-xs'
                            if (isOngoing) {
                              blockClasses =
                                'bg-blue-600 text-white border-blue-700 shadow-md ring-2 ring-blue-300/60'
                            } else if (isUpcoming) {
                              blockClasses =
                                'bg-indigo-600 text-white border-indigo-700 shadow-sm'
                            } else if (isCompleted) {
                              blockClasses =
                                'bg-slate-100 border-slate-300 text-slate-700 opacity-80'
                            } else if (isCancelled) {
                              blockClasses =
                                'bg-rose-50 border-rose-200 text-rose-500 line-through opacity-60'
                            }

                            return (
                              <div
                                key={bkg.id}
                                style={style}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setActiveBookingDetail(
                                    activeBookingDetail?.id === bkg.id ? null : bkg
                                  )
                                }}
                                className={`absolute top-2 bottom-2 rounded-lg border px-2 py-1 flex flex-col justify-between overflow-hidden cursor-pointer transition-all z-10 hover:z-20 hover:scale-[1.01] ${blockClasses}`}
                                title={`${bkg.startTime} - ${bkg.endTime}: ${bkg.purpose} (${bkg.bookedByUserName})`}
                              >
                                <div className="flex items-center justify-between gap-1 text-[10px] font-semibold leading-tight">
                                  <span className="truncate">{bkg.purpose}</span>
                                  <span
                                    className={`px-1 py-0.2 rounded text-[9px] font-mono shrink-0 ${
                                      isOngoing || isUpcoming
                                        ? 'bg-black/20 text-white'
                                        : 'bg-slate-200 text-slate-800'
                                    }`}
                                  >
                                    {bkg.startTime}-{bkg.endTime}
                                  </span>
                                </div>

                                <div className="flex items-center justify-between text-[9px] opacity-90 truncate">
                                  <div className="flex items-center gap-1 truncate">
                                    {bkg.bookedByUserAvatar && (
                                      <img
                                        src={bkg.bookedByUserAvatar}
                                        alt={bkg.bookedByUserName}
                                        className="w-3.5 h-3.5 rounded-full object-cover shrink-0"
                                      />
                                    )}
                                    <span className="truncate">{bkg.bookedByUserName}</span>
                                  </div>
                                  <span className="font-mono text-[9px] font-medium shrink-0">
                                    {bkg.status}
                                  </span>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </div>

          {/* Selected Booking Popover Drawer / Detail Action Card */}
          {activeBookingDetail && (
            <div className="p-4 rounded-xl bg-slate-900 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-2">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-500/30 text-indigo-300 font-mono">
                    {activeBookingDetail.startTime} - {activeBookingDetail.endTime}
                  </span>
                  <BookingBadge status={activeBookingDetail.status} size="sm" />
                  <span className="text-xs text-slate-400">
                    Date: {activeBookingDetail.date}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white">
                  {activeBookingDetail.resourceName} &mdash;{' '}
                  <span className="text-slate-300 font-normal">
                    {activeBookingDetail.purpose}
                  </span>
                </h3>
                <div className="flex items-center gap-4 text-xs text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    Booked by {activeBookingDetail.bookedByUserName}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {activeBookingDetail.location}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                {activeBookingDetail.status === 'Upcoming' && (
                  <Button
                    variant="primary"
                    size="xs"
                    onClick={() => {
                      updateBookingStatus(activeBookingDetail.id, 'Ongoing')
                      setActiveBookingDetail({
                        ...activeBookingDetail,
                        status: 'Ongoing',
                      })
                    }}
                    leftIcon={<Play className="w-3 h-3" />}
                  >
                    Start Usage (Check-In)
                  </Button>
                )}

                {activeBookingDetail.status === 'Ongoing' && (
                  <Button
                    variant="primary"
                    size="xs"
                    onClick={() => {
                      updateBookingStatus(activeBookingDetail.id, 'Completed')
                      setActiveBookingDetail({
                        ...activeBookingDetail,
                        status: 'Completed',
                      })
                    }}
                    leftIcon={<CheckCircle2 className="w-3 h-3" />}
                  >
                    Mark Session Completed
                  </Button>
                )}

                {canManageBooking(activeBookingDetail) &&
                  activeBookingDetail.status !== 'Completed' &&
                  activeBookingDetail.status !== 'Cancelled' && (
                    <>
                      <Button
                        variant="secondary"
                        size="xs"
                        onClick={() => {
                          setRescheduleModalData({
                            isOpen: true,
                            booking: activeBookingDetail,
                          })
                        }}
                        leftIcon={<RotateCcw className="w-3 h-3" />}
                      >
                        Reschedule
                      </Button>
                      <Button
                        variant="danger"
                        size="xs"
                        onClick={() => {
                          setCancelModalData({
                            isOpen: true,
                            booking: activeBookingDetail,
                          })
                        }}
                        leftIcon={<XCircle className="w-3 h-3" />}
                      >
                        Cancel
                      </Button>
                    </>
                  )}

                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => setActiveBookingDetail(null)}
                  className="text-slate-400 hover:text-white"
                >
                  Dismiss
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: RESERVATION DIRECTORY & MANAGEMENT LIST */}
      {/* ========================================================================= */}
      {activeTab === 'directory' && (
        <div className="space-y-4">
          {/* Search & Filter Toolbar */}
          <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="w-full md:w-80">
              <Input
                placeholder="Search purpose, booker, resource..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="w-4 h-4 text-slate-400" />}
              />
            </div>

            {/* Status Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto text-xs">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  statusFilter === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All ({bookings.length})
              </button>
              <button
                onClick={() => setStatusFilter('Upcoming')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  statusFilter === 'Upcoming'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                }`}
              >
                Upcoming ({upcomingCount})
              </button>
              <button
                onClick={() => setStatusFilter('Ongoing')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  statusFilter === 'Ongoing'
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                }`}
              >
                Ongoing ({ongoingCount})
              </button>
              <button
                onClick={() => setStatusFilter('Completed')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  statusFilter === 'Completed'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                }`}
              >
                Completed ({completedCount})
              </button>
              <button
                onClick={() => setStatusFilter('Cancelled')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  statusFilter === 'Cancelled'
                    ? 'bg-slate-700 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Cancelled ({cancelledCount})
              </button>
            </div>
          </div>

          {/* Directory Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                    <th className="py-3 px-4">Shared Resource</th>
                    <th className="py-3 px-4">Reserved By</th>
                    <th className="py-3 px-4">Date & Timeslot</th>
                    <th className="py-3 px-4">Purpose / Business Case</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredBookings.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        No reservations found matching current filters.
                      </td>
                    </tr>
                  ) : (
                    filteredBookings.map((b) => {
                      const isOwner = b.bookedByUserId === currentUser.id
                      const isPrivileged =
                        currentUser.role === 'admin' ||
                        currentUser.role === 'asset_manager'
                      const canModify = isOwner || isPrivileged

                      return (
                        <tr
                          key={b.id}
                          className="hover:bg-slate-50/70 transition-colors group"
                        >
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                              {b.resourceName}
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                              <span className="font-mono bg-slate-100 px-1 py-0.2 rounded text-slate-600">
                                {b.categoryName}
                              </span>
                              <span className="flex items-center gap-0.5">
                                <MapPin className="w-3 h-3 text-slate-400" />
                                {b.location}
                              </span>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2">
                              {b.bookedByUserAvatar ? (
                                <img
                                  src={b.bookedByUserAvatar}
                                  alt={b.bookedByUserName}
                                  className="w-6 h-6 rounded-full object-cover shrink-0"
                                />
                              ) : (
                                <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center font-bold text-[10px] text-slate-600">
                                  {b.bookedByUserName.slice(0, 2).toUpperCase()}
                                </div>
                              )}
                              <div>
                                <span className="font-medium text-slate-800 block">
                                  {b.bookedByUserName}
                                </span>
                                {isOwner && (
                                  <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-1 rounded">
                                    You
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="font-mono font-semibold text-slate-800 text-[11px]">
                              {b.date}
                            </div>
                            <div className="text-[11px] text-indigo-700 font-mono mt-0.5 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-400" />
                              {b.startTime} &ndash; {b.endTime}
                            </div>
                          </td>

                          <td className="py-3.5 px-4 max-w-xs">
                            <p className="text-slate-700 truncate" title={b.purpose}>
                              {b.purpose}
                            </p>
                          </td>

                          <td className="py-3.5 px-4">
                            <BookingBadge status={b.status} size="sm" />
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {b.status === 'Upcoming' && (
                                <Button
                                  variant="primary"
                                  size="xs"
                                  onClick={() =>
                                    updateBookingStatus(b.id, 'Ongoing')
                                  }
                                  leftIcon={<Play className="w-3 h-3" />}
                                  title="Check-In and Start Usage"
                                >
                                  Start
                                </Button>
                              )}

                              {b.status === 'Ongoing' && (
                                <Button
                                  variant="primary"
                                  size="xs"
                                  onClick={() =>
                                    updateBookingStatus(b.id, 'Completed')
                                  }
                                  leftIcon={<CheckCircle2 className="w-3 h-3" />}
                                  title="Conclude usage and free resource"
                                >
                                  Complete
                                </Button>
                              )}

                              {canModify &&
                                b.status !== 'Completed' &&
                                b.status !== 'Cancelled' && (
                                  <>
                                    <Button
                                      variant="secondary"
                                      size="xs"
                                      onClick={() =>
                                        setRescheduleModalData({
                                          isOpen: true,
                                          booking: b,
                                        })
                                      }
                                      leftIcon={<RotateCcw className="w-3 h-3" />}
                                      title="Reschedule to another slot"
                                    >
                                      Reschedule
                                    </Button>

                                    <Button
                                      variant="danger"
                                      size="xs"
                                      onClick={() =>
                                        setCancelModalData({
                                          isOpen: true,
                                          booking: b,
                                        })
                                      }
                                      leftIcon={<XCircle className="w-3 h-3" />}
                                      title="Cancel reservation"
                                    >
                                      Cancel
                                    </Button>
                                  </>
                                )}
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: DETERMINISTIC OVERLAP SIMULATOR & COLLISION ENGINE EXPLAINER */}
      {/* ========================================================================= */}
      {activeTab === 'simulator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Interactive Collision Testing Sandbox */}
          <div className="lg:col-span-7 space-y-4">
            <Card>
              <CardHeader
                title="Interactive Overlap Prevention Sandbox"
              />
              <div className="space-y-4 pt-2">
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">
                    Select Test Resource
                  </label>
                  <select
                    value={simResourceId}
                    onChange={(e) => setSimResourceId(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                  >
                    {bookableAssets.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({a.location})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <Input
                    label="Test Date"
                    type="date"
                    value={simDate}
                    onChange={(e) => setSimDate(e.target.value)}
                    leftIcon={<CalendarIcon className="w-3.5 h-3.5" />}
                  />
                  <Input
                    label="Start Time"
                    type="time"
                    value={simStartTime}
                    onChange={(e) => setSimStartTime(e.target.value)}
                    leftIcon={<Clock className="w-3.5 h-3.5" />}
                  />
                  <Input
                    label="End Time"
                    type="time"
                    value={simEndTime}
                    onChange={(e) => setSimEndTime(e.target.value)}
                    leftIcon={<Clock className="w-3.5 h-3.5" />}
                  />
                </div>

                {/* Live Simulation Verdict Banner */}
                {simResult && (
                  <div
                    className={`p-4 rounded-xl border text-xs space-y-2 animate-in fade-in ${
                      simResult.isValid
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                        : 'bg-rose-50 border-rose-200 text-rose-900'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {simResult.isValid ? (
                        <>
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                          <span className="font-bold text-sm text-emerald-800">
                            VERIFIED: Instant Reservation Permitted
                          </span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                          <span className="font-bold text-sm text-rose-800">
                            COLLISION BLOCKED: Temporal Overlap Detected
                          </span>
                        </>
                      )}
                    </div>
                    <p className="leading-relaxed">
                      {simResult.isValid ? simResult.message : simResult.error}
                    </p>

                    {simResult.collision && (
                      <div className="mt-3 p-2.5 rounded-lg bg-white/80 border border-rose-300 font-mono text-[11px] text-slate-800 space-y-1">
                        <div className="font-semibold text-rose-900">
                          Existing Conflicting Reservation:
                        </div>
                        <div>Booker: {simResult.collision.bookedByUserName}</div>
                        <div>
                          Timeslot: {simResult.collision.startTime} &ndash;{' '}
                          {simResult.collision.endTime}
                        </div>
                        <div>Purpose: {simResult.collision.purpose}</div>
                      </div>
                    )}
                  </div>
                )}

                {/* Instant Try-Presets */}
                <div className="pt-2">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                    Quick Simulation Test Cases:
                  </span>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        // Horizon A collision test (Sarah Jenkins is booked 14:00 - 16:00)
                        setSimResourceId('ast-4')
                        setSimDate('2026-10-30')
                        setSimStartTime('14:30')
                        setSimEndTime('15:30')
                      }}
                      className="px-2.5 py-1.5 rounded-lg border border-rose-200 bg-rose-50/60 hover:bg-rose-100 text-rose-800 text-[11px] font-medium"
                    >
                      Trigger Collision: Horizon A (14:30 - 15:30)
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        // Free evening slot
                        setSimResourceId('ast-4')
                        setSimDate('2026-10-30')
                        setSimStartTime('18:30')
                        setSimEndTime('19:30')
                      }}
                      className="px-2.5 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100 text-emerald-800 text-[11px] font-medium"
                    >
                      Test Free Slot: Horizon A (18:30 - 19:30)
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        // Tesla Model Y fleet collision (Elena is 12:00 - 14:30)
                        setSimResourceId('ast-6')
                        setSimDate('2026-10-30')
                        setSimStartTime('13:00')
                        setSimEndTime('14:00')
                      }}
                      className="px-2.5 py-1.5 rounded-lg border border-rose-200 bg-rose-50/60 hover:bg-rose-100 text-rose-800 text-[11px] font-medium"
                    >
                      Trigger Collision: Tesla Model Y Fleet
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Mathematical Interval Logic Deep Dive */}
          <div className="lg:col-span-5 space-y-4">
            <Card>
              <CardHeader
                title="Deterministic Interval Overlap Engine"
              />
              <div className="space-y-3.5 text-xs text-slate-600 pt-2 leading-relaxed">
                <div className="p-3 rounded-lg bg-slate-900 text-slate-200 font-mono text-[11px] space-y-1">
                  <div className="text-indigo-400 font-bold">
                    // Interval Intersection Formula
                  </div>
                  <div>function hasCollision(A, B): boolean &#123;</div>
                  <div className="pl-4 text-emerald-400">
                    return (A.startTime &lt; B.endTime) &amp;&amp; (A.endTime &gt; B.startTime)
                  </div>
                  <div>&#125;</div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-slate-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-indigo-600" />
                    How Conflict Invariant is Enforced:
                  </h4>
                  <ul className="space-y-1.5 list-disc list-inside text-slate-600 pl-1">
                    <li>
                      <strong className="text-slate-800">Partial Overlaps:</strong> Caught if request starts before an existing booking ends and extends into it.
                    </li>
                    <li>
                      <strong className="text-slate-800">Total Enclosure:</strong> Caught if the new reservation completely encapsulates an existing session.
                    </li>
                    <li>
                      <strong className="text-slate-800">Interior Slicing:</strong> Caught if a requested window sits completely inside an ongoing session.
                    </li>
                    <li>
                      <strong className="text-slate-800">Instant Freeing:</strong> Cancelled bookings immediately unlock the interval without database locks.
                    </li>
                  </ul>
                </div>

                <div className="p-3 rounded-lg bg-indigo-50/70 border border-indigo-100 text-[11px] text-indigo-900 flex items-start gap-2">
                  <Info className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-semibold block">Enterprise Concurrency Resilience</span>
                    Both client-side optimistic UI and backend state updates enforce the same pure functional predicate, ensuring consistency across disparate timezones and users.
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
