import React, { useState } from 'react'
import {
  ArrowRightLeft,
  RotateCcw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  UserCheck,
  Plus,
  ShieldCheck,
  Search,
  Filter,
  Building2,
  Calendar,
  AlertOctagon,
  Lock,
  ChevronRight
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { Card, CardHeader, CardContent } from '../ui/Card'
import { Badge, RoleBadge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Tabs } from '../ui/Tabs'
import { NewAllocationModal } from '../allocations/NewAllocationModal'
import { TransferRequestModal } from '../allocations/TransferRequestModal'
import { CheckInReturnModal } from '../dashboard/CheckInReturnModal'
import { Asset, TransferRequest } from '../../types'

export const AllocationsScreen: React.FC = () => {
  const {
    assets,
    transfers,
    currentUser,
    approveTransfer,
    rejectTransfer,
    departments,
  } = useApp()

  const [activeTab, setActiveTab] = useState<'allocations' | 'transfers'>('allocations')

  // Modals state
  const [isAllocateOpen, setIsAllocateOpen] = useState(false)
  const [isTransferReqOpen, setIsTransferReqOpen] = useState(false)
  const [isCheckInOpen, setIsCheckInOpen] = useState(false)
  const [selectedAssetForReturn, setSelectedAssetForReturn] = useState<Asset | null>(null)
  const [selectedAssetForTransfer, setSelectedAssetForTransfer] = useState<Asset | null>(null)

  // Filters state
  const [searchTerm, setSearchTerm] = useState('')
  const [deptFilter, setDeptFilter] = useState('ALL')
  const [transferStatusFilter, setTransferStatusFilter] = useState('ALL')

  // Reject modal state
  const [rejectingTransferId, setRejectingTransferId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  const CURRENT_DATE_STR = '2026-10-30'

  // Allocated assets list
  const allocatedAssets = assets.filter((a) => a.status === 'Allocated')

  // Overdue count
  const overdueCount = allocatedAssets.filter(
    (a) => a.expectedReturnDate && a.expectedReturnDate < CURRENT_DATE_STR
  ).length

  // Pending transfers count
  const pendingTransfers = transfers.filter((t) => t.status === 'Requested')

  // Filtered allocations
  const filteredAllocations = allocatedAssets.filter((a) => {
    const term = searchTerm.toLowerCase()
    const matchesSearch =
      !term ||
      a.tag.toLowerCase().includes(term) ||
      a.name.toLowerCase().includes(term) ||
      (a.currentHolderName && a.currentHolderName.toLowerCase().includes(term))
    const matchesDept = deptFilter === 'ALL' || a.departmentId === deptFilter
    return matchesSearch && matchesDept
  })

  // Filtered transfers
  const filteredTransfers = transfers.filter((t) => {
    return transferStatusFilter === 'ALL' || t.status === transferStatusFilter
  })

  const canApprove =
    currentUser.role === 'admin' ||
    currentUser.role === 'asset_manager' ||
    currentUser.role === 'department_head'

  const handleOpenCheckIn = (asset: Asset) => {
    setSelectedAssetForReturn(asset)
    setIsCheckInOpen(true)
  }

  const handleOpenTransfer = (asset: Asset) => {
    setSelectedAssetForTransfer(asset)
    setIsTransferReqOpen(true)
  }

  const handleConfirmReject = (e: React.FormEvent) => {
    e.preventDefault()
    if (!rejectingTransferId) return
    rejectTransfer(rejectingTransferId, rejectReason)
    setRejectingTransferId(null)
    setRejectReason('')
  }

  return (
    <div className="space-y-6">
      {/* Screen Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold text-[#0F172A] tracking-tight font-heading">
              Allocations & Transfers
            </h1>
            <span className="flex items-center gap-1 text-[11px] font-bold text-[#B91C1C] bg-[#FEF2F2] border border-[#FECACA] px-2 py-0.5 rounded-full">
              <ShieldCheck className="w-3.5 h-3.5 text-[#B91C1C]" /> Conflict Guard Active
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setSelectedAssetForTransfer(null)
              setIsTransferReqOpen(true)
            }}
            leftIcon={<ArrowRightLeft className="w-4 h-4 text-indigo-600" />}
          >
            Request Transfer
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAllocateOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Allocate Asset
          </Button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Active Allocations
          </span>
          <span className="text-xl font-extrabold text-slate-900 mt-0.5 block">
            {allocatedAssets.length}
          </span>
          <span className="text-[11px] text-indigo-600 font-medium">In Field Deployment</span>
        </div>

        <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Overdue Returns
          </span>
          <span className="text-xl font-extrabold text-rose-700 mt-0.5 block">
            {overdueCount}
          </span>
          <span className="text-[11px] text-rose-600 font-medium">Past Return Deadline</span>
        </div>

        <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Transfer Queue
          </span>
          <span className="text-xl font-extrabold text-amber-700 mt-0.5 block">
            {pendingTransfers.length}
          </span>
          <span className="text-[11px] text-amber-600 font-medium">Awaiting Authorization</span>
        </div>

        <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Sign-off Privilege
          </span>
          <span className="text-xs font-bold text-slate-900 mt-1 block">
            {canApprove ? 'Authorized Reviewer' : 'Requester Tier'}
          </span>
          <span className="text-[11px] text-slate-500">
            {canApprove ? 'Can approve/decline queue' : 'Requires Dept Head or Admin elevation'}
          </span>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-2">
        <Tabs
          size="md"
          variant="pill"
          tabs={[
            {
              id: 'allocations',
              label: 'Active Allocations Directory',
              count: allocatedAssets.length,
              icon: <UserCheck className="w-4 h-4 text-indigo-600" />,
            },
            {
              id: 'transfers',
              label: 'Transfer Requests & Approval Queue',
              count: pendingTransfers.length,
              icon: <ArrowRightLeft className="w-4 h-4 text-amber-600" />,
            },
          ]}
          activeTab={activeTab}
          onChange={(t) => setActiveTab(t as any)}
        />
      </div>

      {/* TAB 1: ACTIVE ALLOCATIONS DIRECTORY */}
      {activeTab === 'allocations' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-white rounded-xl border border-slate-200">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by tag, asset, or holder..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-slate-500">Department:</span>
              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
              >
                <option value="ALL">All Departments</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Allocations Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-semibold text-slate-600">
                    <th className="py-3 px-4">Asset Tag & Specification</th>
                    <th className="py-3 px-4">Current Custodian</th>
                    <th className="py-3 px-4">Department & Location</th>
                    <th className="py-3 px-4">Checkout Date</th>
                    <th className="py-3 px-4">Expected Return Date</th>
                    <th className="py-3 px-4">Timeline Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAllocations.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-slate-400">
                        No active allocations matching query.
                      </td>
                    </tr>
                  ) : (
                    filteredAllocations.map((asset) => {
                      const isOverdue =
                        asset.expectedReturnDate && asset.expectedReturnDate < CURRENT_DATE_STR

                      return (
                        <tr key={asset.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-xs text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200">
                                {asset.tag}
                              </span>
                              <span className="font-semibold text-slate-900 block truncate max-w-xs">
                                {asset.name}
                              </span>
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              {asset.currentHolderAvatar && (
                                <img
                                  src={asset.currentHolderAvatar}
                                  alt={asset.currentHolderName}
                                  className="w-6 h-6 rounded-full object-cover shrink-0"
                                />
                              )}
                              <span className="font-medium text-slate-800">{asset.currentHolderName}</span>
                            </div>
                          </td>

                          <td className="py-3 px-4 text-slate-600">
                            <span className="block">{asset.departmentName}</span>
                            <span className="text-[10px] text-slate-400">{asset.location}</span>
                          </td>

                          <td className="py-3 px-4 font-mono text-slate-600">
                            {asset.allocatedDate || '2026-10-15'}
                          </td>

                          <td className="py-3 px-4 font-mono font-medium text-slate-900">
                            {asset.expectedReturnDate || 'Open Allocation'}
                          </td>

                          <td className="py-3 px-4">
                            {isOverdue ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full animate-pulse">
                                <AlertOctagon className="w-3 h-3 text-rose-600" /> Overdue
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                                <Clock className="w-3 h-3 text-emerald-600" /> Active Term
                              </span>
                            )}
                          </td>

                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                variant="secondary"
                                size="xs"
                                onClick={() => handleOpenTransfer(asset)}
                                leftIcon={<ArrowRightLeft className="w-3 h-3 text-indigo-600" />}
                              >
                                Transfer
                              </Button>

                              <Button
                                variant="primary"
                                size="xs"
                                onClick={() => handleOpenCheckIn(asset)}
                                leftIcon={<RotateCcw className="w-3 h-3" />}
                              >
                                Check-In
                              </Button>
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

      {/* TAB 2: TRANSFER REQUESTS & APPROVAL QUEUE */}
      {activeTab === 'transfers' && (
        <div className="space-y-4">
          {/* Approval Role Notice */}
          <div className="p-3 bg-linear-to-r from-amber-50 to-orange-50 border border-amber-200/80 rounded-xl flex items-center justify-between text-xs text-amber-950">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Authorization Rule:</strong> Transfer requests must be reviewed by a Department Head or Asset Manager.
                {canApprove ? ' You have approval authority.' : ' Your active role is read-only for queue sign-offs.'}
              </span>
            </div>
            <RoleBadge role={currentUser.role} size="xs" />
          </div>

          {/* Transfers Queue Cards */}
          <div className="space-y-3">
            {filteredTransfers.length === 0 ? (
              <div className="p-10 text-center text-slate-400 bg-white rounded-xl border border-slate-200">
                <ArrowRightLeft className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-700">No Transfer Requests in Queue</p>
                <p className="text-[11px]">All peer-to-peer equipment transfers are fully settled.</p>
              </div>
            ) : (
              filteredTransfers.map((trf) => (
                <div
                  key={trf.id}
                  className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-xs text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                        {trf.assetTag}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900">{trf.assetName}</h4>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          trf.status === 'Requested'
                            ? 'bg-amber-100 text-amber-800'
                            : trf.status === 'Re-allocated'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {trf.status}
                      </span>
                    </div>

                    {/* From & To Visual Flow */}
                    <div className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-700 max-w-lg">
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Current Holder (From)
                        </span>
                        <span className="font-semibold text-slate-900 block truncate">{trf.fromUserName}</span>
                      </div>

                      <ArrowRightLeft className="w-4 h-4 text-indigo-500 shrink-0" />

                      <div className="min-w-0">
                        <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">
                          Target Recipient (To)
                        </span>
                        <span className="font-semibold text-indigo-950 block truncate">{trf.toUserName}</span>
                        <span className="text-[10px] text-slate-400 block">{trf.departmentName}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 italic">
                      &quot;{trf.reason}&quot;
                    </p>

                    <div className="text-[10px] text-slate-400 font-mono">
                      Request logged: {trf.requestDate}
                    </div>
                  </div>

                  {/* Authorization Controls */}
                  <div className="shrink-0 flex items-center gap-2 self-end md:self-center border-t md:border-t-0 pt-2 md:pt-0 w-full md:w-auto justify-end">
                    {trf.status === 'Requested' ? (
                      canApprove ? (
                        <>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              setRejectingTransferId(trf.id)
                              setRejectReason('')
                            }}
                            leftIcon={<XCircle className="w-3.5 h-3.5 text-rose-600" />}
                          >
                            Decline
                          </Button>

                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => approveTransfer(trf.id)}
                            leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                          >
                            Approve & Re-allocate
                          </Button>
                        </>
                      ) : (
                        <div className="flex items-center gap-1 text-[11px] text-slate-400 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                          <Lock className="w-3 h-3 text-slate-400" />
                          <span>Requires Dept Head / Manager</span>
                        </div>
                      )
                    ) : (
                      <span className="text-xs text-slate-500 font-medium">
                        Workflow Settled ({trf.status})
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ALLOCATION MODAL */}
      <NewAllocationModal
        isOpen={isAllocateOpen}
        onClose={() => setIsAllocateOpen(false)}
      />

      {/* TRANSFER REQUEST MODAL */}
      <TransferRequestModal
        isOpen={isTransferReqOpen}
        onClose={() => {
          setIsTransferReqOpen(false)
          setSelectedAssetForTransfer(null)
        }}
        initialAsset={selectedAssetForTransfer}
      />

      {/* CHECK-IN RETURN MODAL */}
      <CheckInReturnModal
        isOpen={isCheckInOpen}
        onClose={() => {
          setIsCheckInOpen(false)
          setSelectedAssetForReturn(null)
        }}
        targetAsset={selectedAssetForReturn}
      />

      {/* REJECT JUSTIFICATION DIALOG */}
      {rejectingTransferId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-rose-600 font-bold text-sm">
              <XCircle className="w-5 h-5" />
              <span>Decline Transfer Request</span>
            </div>
            <p className="text-xs text-slate-600">
              Provide an administrative explanation for declining this transfer. The requester will be notified.
            </p>
            <form onSubmit={handleConfirmReject} className="space-y-3">
              <textarea
                rows={3}
                required
                placeholder="Reason for declining transfer..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-900 focus:outline-none focus:border-rose-500"
              />
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setRejectingTransferId(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="danger" size="sm">
                  Confirm Decline
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
