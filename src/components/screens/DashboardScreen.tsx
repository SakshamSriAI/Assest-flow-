import React, { useState } from 'react'
import {
  Boxes,
  ArrowRightLeft,
  CalendarCheck2,
  Wrench,
  AlertTriangle,
  Clock,
  RotateCcw,
  Plus,
  Calendar,
  CheckCircle2,
  ArrowUpRight,
  ShieldCheck,
  Building2,
  UserCheck,
  Send,
  AlertOctagon,
  Sparkles,
  ExternalLink,
  ChevronRight
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { Card, CardHeader, CardContent } from '../ui/Card'
import { Badge, AssetStateBadge, RoleBadge, MaintenanceBadge, BookingBadge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { RegisterAssetModal } from '../dashboard/RegisterAssetModal'
import { BookResourceModal } from '../dashboard/BookResourceModal'
import { RaiseMaintenanceModal } from '../dashboard/RaiseMaintenanceModal'
import { CheckInReturnModal } from '../dashboard/CheckInReturnModal'
import { Asset } from '../../types'

export const DashboardScreen: React.FC = () => {
  const {
    assets,
    tickets,
    transfers,
    bookings,
    currentUser,
    departments,
    setCurrentRoute,
    approveTransfer,
  } = useApp()

  // Modal control states
  const [isRegisterOpen, setIsRegisterOpen] = useState(false)
  const [isBookResourceOpen, setIsBookResourceOpen] = useState(false)
  const [isRaiseMaintOpen, setIsRaiseMaintOpen] = useState(false)
  const [isCheckInOpen, setIsCheckInOpen] = useState(false)
  const [selectedAssetForReturn, setSelectedAssetForReturn] = useState<Asset | null>(null)

  // Current system simulation date is 2026-10-30
  const CURRENT_DATE_STR = '2026-10-30'
  const currentDate = new Date(CURRENT_DATE_STR)

  // --- KPI Computations ---
  const availableCount = assets.filter((a) => a.status === 'Available').length
  const allocatedCount = assets.filter((a) => a.status === 'Allocated').length
  const maintenanceCount =
    assets.filter((a) => a.status === 'Under Maintenance').length +
    tickets.filter((t) => t.status === 'In Progress' || t.status === 'Pending').length
  const activeBookingsCount = bookings.filter((b) => b.status === 'Ongoing' || b.status === 'Upcoming').length
  const pendingTransfersCount = transfers.filter((t) => t.status === 'Requested').length

  // --- Strict Distinction: Overdue Returns vs Upcoming Returns ---
  const allocatedWithDates = assets.filter((a) => a.status === 'Allocated' && a.expectedReturnDate)

  // 1. Overdue Returns: expectedReturnDate < CURRENT_DATE_STR
  const overdueReturns = allocatedWithDates.filter((a) => {
    return a.expectedReturnDate && a.expectedReturnDate < CURRENT_DATE_STR
  })

  // 2. Upcoming Returns: expectedReturnDate >= CURRENT_DATE_STR (due soon)
  const upcomingReturns = allocatedWithDates.filter((a) => {
    return a.expectedReturnDate && a.expectedReturnDate >= CURRENT_DATE_STR
  })

  const getDaysOverdue = (returnDateStr: string) => {
    const ret = new Date(returnDateStr)
    const diffTime = currentDate.getTime() - ret.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? diffDays : 1
  }

  const getDaysUntil = (returnDateStr: string) => {
    const ret = new Date(returnDateStr)
    const diffTime = ret.getTime() - currentDate.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays >= 0 ? diffDays : 0
  }

  const handleOpenReturnModal = (asset?: Asset) => {
    setSelectedAssetForReturn(asset || null)
    setIsCheckInOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Operational Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl font-bold text-[#0F172A] tracking-tight font-heading">
              Operational Dashboard
            </h1>
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#10B981] animate-pulse" />
              Live Ledger
            </span>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsRegisterOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Register Asset
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsBookResourceOpen(true)}
            leftIcon={<CalendarCheck2 className="w-4 h-4 text-[#2563EB]" />}
          >
            Book Resource
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsRaiseMaintOpen(true)}
            leftIcon={<Wrench className="w-4 h-4 text-[#B45309]" />}
          >
            Raise Ticket
          </Button>
        </div>
      </div>

      {/* 6 KPI OPERATIONAL CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* KPI 1: Assets Available */}
        <div
          onClick={() => setCurrentRoute('assets')}
          className="p-3.5 bg-white rounded-xl border border-[#E2E8F0] shadow-xs hover:border-[#A7F3D0] hover:shadow-sm transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-[#64748B] mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
              Available
            </span>
            <div className="p-1 rounded-md bg-[#ECFDF5] text-[#047857] group-hover:scale-110 transition-transform">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-extrabold text-[#0F172A] block leading-tight">
            {availableCount}
          </span>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#E2E8F0] text-[10px]">
            <span className="text-[#047857] font-semibold bg-[#ECFDF5] px-1 py-0.2 rounded">
              Ready for deploy
            </span>
            <span className="text-[#64748B] font-mono">
              {Math.round((availableCount / (assets.length || 1)) * 100)}%
            </span>
          </div>
        </div>

        {/* KPI 2: Assets Allocated */}
        <div
          onClick={() => setCurrentRoute('allocations')}
          className="p-3.5 bg-white rounded-xl border border-[#E2E8F0] shadow-xs hover:border-[#BFDBFE] hover:shadow-sm transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-[#64748B] mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
              Allocated
            </span>
            <div className="p-1 rounded-md bg-[#EFF6FF] text-[#2563EB] group-hover:scale-110 transition-transform">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-extrabold text-[#0F172A] block leading-tight">
            {allocatedCount}
          </span>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#E2E8F0] text-[10px]">
            <span className="text-[#1D4ED8] font-semibold bg-[#EFF6FF] px-1 py-0.2 rounded">
              In active use
            </span>
            <span className="text-[#64748B] font-mono">
              {Math.round((allocatedCount / (assets.length || 1)) * 100)}%
            </span>
          </div>
        </div>

        {/* KPI 3: Under Maintenance */}
        <div
          onClick={() => setCurrentRoute('maintenance')}
          className="p-3.5 bg-white rounded-xl border border-[#E2E8F0] shadow-xs hover:border-[#FDE68A] hover:shadow-sm transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-[#64748B] mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
              Maintenance
            </span>
            <div className="p-1 rounded-md bg-[#FFFBEB] text-[#B45309] group-hover:scale-110 transition-transform">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-extrabold text-[#0F172A] block leading-tight">
            {maintenanceCount}
          </span>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#E2E8F0] text-[10px]">
            <span className="text-[#B45309] font-semibold bg-[#FFFBEB] px-1 py-0.2 rounded">
              {tickets.filter((t) => t.priority === 'High' || t.priority === 'Critical').length} urgent
            </span>
            <span className="text-[#64748B]">Queue</span>
          </div>
        </div>

        {/* KPI 4: Active Bookings */}
        <div
          onClick={() => setCurrentRoute('bookings')}
          className="p-3.5 bg-white rounded-xl border border-[#E2E8F0] shadow-xs hover:border-[#BFDBFE] hover:shadow-sm transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-[#64748B] mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
              Active Bookings
            </span>
            <div className="p-1 rounded-md bg-[#EFF6FF] text-[#2563EB] group-hover:scale-110 transition-transform">
              <CalendarCheck2 className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-extrabold text-[#0F172A] block leading-tight">
            {activeBookingsCount}
          </span>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#E2E8F0] text-[10px]">
            <span className="text-[#1D4ED8] font-semibold bg-[#EFF6FF] px-1 py-0.2 rounded">
              Rooms & Fleet
            </span>
            <span className="text-[#64748B]">No overlap</span>
          </div>
        </div>

        {/* KPI 5: Pending Transfers */}
        <div
          onClick={() => setCurrentRoute('allocations')}
          className="p-3.5 bg-white rounded-xl border border-[#E2E8F0] shadow-xs hover:border-[#0F2F57]/40 hover:shadow-sm transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-[#64748B] mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
              Pending Transfers
            </span>
            <div className="p-1 rounded-md bg-[#0F2F57]/10 text-[#0F2F57] group-hover:scale-110 transition-transform">
              <ArrowRightLeft className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-extrabold text-[#0F172A] block leading-tight">
            {pendingTransfersCount}
          </span>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#E2E8F0] text-[10px]">
            <span className="text-[#0F2F57] font-semibold bg-[#0F2F57]/10 px-1 py-0.2 rounded">
              Awaiting sign-off
            </span>
            <span className="text-[#64748B]">P2P</span>
          </div>
        </div>

        {/* KPI 6: Upcoming Returns */}
        <div
          onClick={() => setCurrentRoute('allocations')}
          className="p-3.5 bg-white rounded-xl border border-[#E2E8F0] shadow-xs hover:border-[#BFDBFE] hover:shadow-sm transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-[#64748B] mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
              Upcoming Returns
            </span>
            <div className="p-1 rounded-md bg-[#EFF6FF] text-[#2563EB] group-hover:scale-110 transition-transform">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-extrabold text-[#0F172A] block leading-tight">
            {upcomingReturns.length}
          </span>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#E2E8F0] text-[10px]">
            <span className="text-[#1D4ED8] font-semibold bg-[#EFF6FF] px-1 py-0.2 rounded">
              Next 7 days
            </span>
            <span className="text-[#64748B] font-mono">{overdueReturns.length} overdue</span>
          </div>
        </div>
      </div>

      {/* SEPARATE ALERT SECTION: DISTINGUISHING OVERDUE RETURNS FROM UPCOMING RETURNS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* PANEL 1: OVERDUE RETURNS (PAST EXPECTED RETURN DATE) */}
        <Card className="border-[#FECACA] shadow-xs">
          <CardHeader
            title="Overdue Returns Alert Board"
            badge={
              <span className="inline-flex items-center gap-1 bg-[#FEF2F2] text-[#B91C1C] text-[11px] font-bold px-2 py-0.5 rounded-full border border-[#FECACA]">
                <AlertOctagon className="w-3.5 h-3.5 text-[#B91C1C]" />
                {overdueReturns.length} Delinquent
              </span>
            }
          />
          <CardContent className="pt-2">
            {overdueReturns.length === 0 ? (
              <div className="p-6 text-center text-[#64748B]">
                <CheckCircle2 className="w-8 h-8 text-[#10B981] mx-auto mb-2" />
                <p className="text-xs font-semibold text-[#0F172A]">Zero Overdue Assets</p>
                <p className="text-[11px]">All checked-out inventory is currently within allocated return terms.</p>
              </div>
            ) : (
              <div className="divide-y divide-[#F1F3F5]">
                {overdueReturns.map((asset) => {
                  const daysOverdue = getDaysOverdue(asset.expectedReturnDate!)
                  return (
                    <div
                      key={asset.id}
                      className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#FEF2F2]/50 p-2 rounded-lg transition-colors"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-[#B91C1C] bg-[#FEF2F2] px-1.5 py-0.5 rounded border border-[#FECACA]">
                            {asset.tag}
                          </span>
                          <span className="font-semibold text-xs text-[#0F172A] truncate">
                            {asset.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-[#64748B] flex-wrap">
                          <span>Holder: <strong className="text-[#0F172A]">{asset.currentHolderName}</strong></span>
                          <span>&bull;</span>
                          <span>Expected: <span className="font-mono text-[#B91C1C] font-semibold">{asset.expectedReturnDate}</span></span>
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#B91C1C] bg-[#FEF2F2] px-1.5 py-0.2 rounded border border-[#FECACA]">
                            {daysOverdue} Days Overdue
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                        <Button
                          variant="danger"
                          size="xs"
                          onClick={() => handleOpenReturnModal(asset)}
                          leftIcon={<RotateCcw className="w-3 h-3" />}
                        >
                          Check-In Now
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* PANEL 2: UPCOMING RETURNS (DUE WITHIN NEXT 7 DAYS) */}
        <Card className="border-[#BFDBFE] shadow-xs">
          <CardHeader
            title="Upcoming Scheduled Returns"
            badge={
              <span className="inline-flex items-center gap-1 bg-[#EFF6FF] text-[#2563EB] text-[11px] font-semibold px-2 py-0.5 rounded-full border border-[#BFDBFE]">
                <Clock className="w-3.5 h-3.5 text-[#2563EB]" />
                {upcomingReturns.length} Incoming
              </span>
            }
          />
          <CardContent className="pt-2">
            {upcomingReturns.length === 0 ? (
              <div className="p-6 text-center text-[#64748B]">
                <p className="text-xs">No returns due within the next 7 days.</p>
              </div>
            ) : (
              <div className="divide-y divide-[#F1F3F5]">
                {upcomingReturns.map((asset) => {
                  const daysUntil = getDaysUntil(asset.expectedReturnDate!)
                  return (
                    <div
                      key={asset.id}
                      className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#F8F9FA] p-2 rounded-lg transition-colors"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-[#2563EB] bg-[#EFF6FF] px-1.5 py-0.5 rounded border border-[#BFDBFE]">
                            {asset.tag}
                          </span>
                          <span className="font-semibold text-xs text-[#0F172A] truncate">
                            {asset.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-[#64748B] flex-wrap">
                          <span>Holder: <strong className="text-[#0F172A]">{asset.currentHolderName}</strong></span>
                          <span>&bull;</span>
                          <span>Due: <span className="font-mono text-[#0F172A]">{asset.expectedReturnDate}</span></span>
                          <span className="text-[10px] font-semibold text-[#1D4ED8] bg-[#EFF6FF] px-1.5 py-0.2 rounded border border-[#BFDBFE]">
                            {daysUntil === 0 ? 'Due Today' : `In ${daysUntil} days`}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                        <Button
                          variant="secondary"
                          size="xs"
                          onClick={() => handleOpenReturnModal(asset)}
                          leftIcon={<RotateCcw className="w-3 h-3 text-[#64748B]" />}
                        >
                          Early Check-In
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* OPERATIONAL WORKSTREAM SPLIT: TRANSFERS & RESOURCE TIMELINES */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Pending Transfer Requests (Col 1) */}
        <Card className="lg:col-span-1">
          <CardHeader
            title="Pending Transfers"
            badge={<Badge variant="warning" size="xs">{pendingTransfersCount} Active</Badge>}
          />
          <CardContent className="pt-3">
            {transfers.length === 0 ? (
              <p className="text-xs text-[#64748B] py-6 text-center">No transfer requests pending.</p>
            ) : (
              <div className="space-y-3">
                {transfers.slice(0, 2).map((t) => (
                  <div
                    key={t.id}
                    className="p-3 rounded-xl border border-[#E2E8F0] bg-white hover:border-[#BFDBFE] transition-colors space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-[#2563EB] bg-[#EFF6FF] px-1.5 py-0.5 rounded text-[11px] border border-[#BFDBFE]">
                        {t.assetTag}
                      </span>
                      <span className="text-[10px] text-[#B45309] font-medium bg-[#FFFBEB] px-2 py-0.5 rounded-full border border-[#FDE68A]">
                        {t.status}
                      </span>
                    </div>

                    <div>
                      <p className="font-semibold text-[#0F172A] truncate">{t.assetName}</p>
                      <div className="flex items-center gap-1.5 text-[11px] text-[#64748B] mt-1">
                        <span className="text-[#0F172A] font-medium">{t.fromUserName}</span>
                        <ArrowRightLeft className="w-3 h-3 text-[#2563EB] shrink-0" />
                        <span className="text-[#0F172A] font-medium">{t.toUserName}</span>
                      </div>
                    </div>

                    <div className="text-[11px] text-[#64748B] bg-[#F8F9FA] px-2 py-1.5 rounded-md border border-[#E2E8F0] truncate" title={t.reason}>
                      <span className="text-[#0F172A] font-medium">Note:</span> {t.reason}
                    </div>

                    {/* Quick Approve Action */}
                    {t.status === 'Requested' && (
                      <div className="pt-1.5 flex items-center justify-end gap-2 border-t border-[#E2E8F0]">
                        <Button
                          variant="primary"
                          size="xs"
                          onClick={() => approveTransfer(t.id)}
                          leftIcon={<CheckCircle2 className="w-3 h-3" />}
                        >
                          Approve
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
                {transfers.length > 2 && (
                  <button
                    onClick={() => setCurrentRoute('allocations')}
                    className="w-full text-center text-[11px] font-semibold text-[#2563EB] hover:underline pt-1 cursor-pointer"
                  >
                    View all {transfers.length} transfers &rarr;
                  </button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Live Shared Resource Schedule (Col 2) */}
        <Card className="lg:col-span-1">
          <CardHeader
            title="Resource Bookings"
            badge={<Badge variant="info" size="xs">{bookings.length}</Badge>}
            action={
              <Button
                variant="outline"
                size="xs"
                onClick={() => setIsBookResourceOpen(true)}
                leftIcon={<Plus className="w-3 h-3" />}
              >
                Reserve
              </Button>
            }
          />
          <CardContent className="pt-3">
            <div className="space-y-2.5">
              {bookings.slice(0, 3).map((b) => (
                <div
                  key={b.id}
                  className="p-2.5 rounded-xl border border-[#E2E8F0] bg-white hover:border-[#BFDBFE] transition-colors space-y-1.5 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#0F172A] truncate max-w-[180px]">{b.resourceName}</span>
                    <BookingBadge status={b.status} size="xs" />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[#64748B]">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#64748B]" />
                      <span>{b.startTime} - {b.endTime}</span>
                    </div>
                    <span className="text-[10px] text-[#64748B] font-mono">{b.date}</span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-1 border-t border-[#F1F3F5]">
                    <span className="text-[#0F172A] font-medium truncate">{b.bookedByUserName}</span>
                    <span className="text-[#64748B] text-[10px] truncate max-w-[130px]">{b.purpose}</span>
                  </div>
                </div>
              ))}
              {bookings.length > 3 && (
                <button
                  onClick={() => setCurrentRoute('bookings')}
                  className="w-full text-center text-[11px] font-semibold text-[#2563EB] hover:underline pt-1 cursor-pointer"
                >
                  View all {bookings.length} reservations &rarr;
                </button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Active Maintenance Tickets (Col 3) */}
        <Card className="lg:col-span-1">
          <CardHeader
            title="Maintenance Hub"
            badge={<Badge variant="warning" size="xs">{tickets.length}</Badge>}
            action={
              <Button
                variant="outline"
                size="xs"
                onClick={() => setIsRaiseMaintOpen(true)}
                leftIcon={<Plus className="w-3 h-3" />}
              >
                Ticket
              </Button>
            }
          />
          <CardContent className="pt-3">
            <div className="space-y-2.5">
              {tickets.slice(0, 3).map((t) => (
                <div
                  key={t.id}
                  className="p-2.5 rounded-xl border border-[#E2E8F0] bg-white hover:border-[#BFDBFE] transition-colors space-y-1.5 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-[#0F172A]">{t.ticketNumber}</span>
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                          t.priority === 'Critical'
                            ? 'bg-[#FEF2F2] text-[#B91C1C]'
                            : t.priority === 'High'
                            ? 'bg-[#FFFBEB] text-[#B45309]'
                            : 'bg-[#F1F5F9] text-[#475569]'
                        }`}
                      >
                        {t.priority}
                      </span>
                    </div>
                    <MaintenanceBadge status={t.status} size="xs" />
                  </div>

                  <p className="font-semibold text-[#0F172A] truncate">
                    {t.assetTag} — {t.assetName}
                  </p>

                  <p className="text-[11px] text-[#64748B] line-clamp-1 leading-snug">
                    {t.issueDescription}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-[#64748B] pt-1 border-t border-[#F1F3F5]">
                    <span>By {t.reportedByName}</span>
                    <span className="font-mono">{t.createdAt}</span>
                  </div>
                </div>
              ))}
              {tickets.length > 3 && (
                <button
                  onClick={() => setCurrentRoute('maintenance')}
                  className="w-full text-center text-[11px] font-semibold text-[#2563EB] hover:underline pt-1 cursor-pointer"
                >
                  View all {tickets.length} work orders &rarr;
                </button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* DEPARTMENT ASSET UTILIZATION DISTRIBUTION */}
      <Card>
        <CardHeader
          title="Fleet Utilization by Department"
          badge={<Badge variant="neutral" size="xs">{departments.length} Departments</Badge>}
        />
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {departments.map((dept) => {
                const deptAssets = assets.filter((a) => a.departmentId === dept.id)
                const inUse = deptAssets.filter((a) => a.status === 'Allocated').length
                const total = deptAssets.length || 1
                const ratio = Math.round((inUse / total) * 100)

                return (
                  <div
                    key={dept.id}
                    className="p-3 rounded-xl bg-[#F8F9FA] border border-[#E2E8F0] space-y-2 hover:border-[#BFDBFE] transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-[#0F172A] truncate">{dept.name}</span>
                      <span className="font-mono text-[10px] text-[#64748B]">{dept.code}</span>
                    </div>

                    <div className="flex items-baseline justify-between text-xs">
                      <span className="text-[#64748B] text-[11px]">Utilization:</span>
                      <span className="font-bold text-[#0F172A]">{ratio}%</span>
                    </div>

                    <div className="w-full bg-[#E2E8F0] rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-[#2563EB] h-full rounded-full transition-all"
                        style={{ width: `${ratio}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-[#64748B] pt-1">
                      <span>{inUse} in use</span>
                      <span>{deptAssets.length} total</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CONTEXT MODALS */}
      <RegisterAssetModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
      />

      <BookResourceModal
        isOpen={isBookResourceOpen}
        onClose={() => setIsBookResourceOpen(false)}
      />

      <RaiseMaintenanceModal
        isOpen={isRaiseMaintOpen}
        onClose={() => setIsRaiseMaintOpen(false)}
      />

      <CheckInReturnModal
        isOpen={isCheckInOpen}
        onClose={() => setIsCheckInOpen(false)}
        targetAsset={selectedAssetForReturn}
      />
    </div>
  )
}
