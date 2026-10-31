import React, { useState, useEffect } from 'react'
import {
  X,
  QrCode,
  RotateCcw,
  Wrench,
  Building2,
  MapPin,
  History,
  FileText,
  DollarSign,
  CheckCircle2,
  AlertTriangle,
  Edit3,
  Trash2,
  Save,
  Check,
  ShieldAlert,
  Boxes,
  Barcode
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { Asset, AssetState } from '../../types'
import { AssetStateBadge, Badge, MaintenanceBadge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Tabs } from '../ui/Tabs'
import { QrCodeModal } from './QrCodeModal'
import { CheckInReturnModal } from '../dashboard/CheckInReturnModal'
import { RaiseMaintenanceModal } from '../dashboard/RaiseMaintenanceModal'

interface AssetDetailDrawerProps {
  asset: Asset | null
  isOpen: boolean
  onClose: () => void
  onOpenQr?: (asset: Asset) => void
  onCheckIn?: (asset: Asset) => void
  onRaiseTicket?: (asset: Asset) => void
}

export const AssetDetailDrawer: React.FC<AssetDetailDrawerProps> = ({
  asset,
  isOpen,
  onClose,
  onOpenQr,
  onCheckIn,
  onRaiseTicket,
}) => {
  const {
    tickets,
    updateAssetStatus,
    currentUser,
    departments,
    categories,
    updateAsset,
    deleteAsset,
    addToast,
  } = useApp()

  const [activeTab, setActiveTab] = useState<'specs' | 'history' | 'maintenance'>('specs')
  const [isEditing, setIsEditing] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Internal modal states for standalone fallback
  const [internalQrOpen, setInternalQrOpen] = useState(false)
  const [internalCheckInOpen, setInternalCheckInOpen] = useState(false)
  const [internalRaiseOpen, setInternalRaiseOpen] = useState(false)

  // Form edit states
  const [editName, setEditName] = useState('')
  const [editLocation, setEditLocation] = useState('')
  const [editCondition, setEditCondition] = useState<'New' | 'Good' | 'Fair' | 'Maintenance Required'>('Good')
  const [editCost, setEditCost] = useState<number>(0)
  const [editSerialNumber, setEditSerialNumber] = useState('')
  const [editDepartment, setEditDepartment] = useState('')
  const [editCategory, setEditCategory] = useState('')
  const [editIsBookable, setEditIsBookable] = useState(false)

  useEffect(() => {
    if (asset) {
      setEditName(asset.name || '')
      setEditLocation(asset.location || '')
      setEditCondition(asset.condition || 'Good')
      setEditCost(asset.costTracking || 0)
      setEditSerialNumber(asset.serialNumber || '')
      setEditDepartment(asset.departmentName || departments[0]?.name || '')
      setEditCategory(asset.categoryName || categories[0]?.name || '')
      setEditIsBookable(!!asset.isBookable)
      setIsEditing(false)
      setShowDeleteConfirm(false)
    }
  }, [asset, departments, categories])

  if (!isOpen || !asset) return null

  // Linked tickets for this specific asset
  const assetTickets = tickets.filter((t) => t.assetId === asset.id || t.assetTag === asset.tag)

  // Allocation history
  const historyList = asset.allocationHistory || []

  const handleStateChange = (newStatus: AssetState) => {
    updateAssetStatus(asset.id, newStatus, `Manually updated to ${newStatus} by ${currentUser.name}`)
  }

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editName.trim()) {
      addToast('Asset name cannot be empty.', 'warning')
      return
    }

    const deptObj = departments.find((d) => d.name === editDepartment)
    const catObj = categories.find((c) => c.name === editCategory)

    updateAsset(asset.id, {
      name: editName.trim(),
      location: editLocation.trim(),
      condition: editCondition,
      costTracking: Number(editCost) || 0,
      serialNumber: editSerialNumber.trim(),
      departmentName: editDepartment,
      departmentId: deptObj?.id || asset.departmentId,
      categoryName: editCategory,
      categoryId: catObj?.id || asset.categoryId,
      isBookable: editIsBookable,
    })

    setIsEditing(false)
  }

  const handleDeleteConfirm = () => {
    deleteAsset(asset.id)
    setShowDeleteConfirm(false)
    onClose()
  }

  const handleOpenQrTrigger = () => {
    if (onOpenQr) {
      onOpenQr(asset)
    } else {
      setInternalQrOpen(true)
    }
  }

  const handleCheckInTrigger = () => {
    if (onCheckIn) {
      onCheckIn(asset)
    } else {
      setInternalCheckInOpen(true)
    }
  }

  const handleRaiseTicketTrigger = () => {
    if (onRaiseTicket) {
      onRaiseTicket(asset)
    } else {
      setInternalRaiseOpen(true)
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex justify-end">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity animate-in fade-in"
          onClick={onClose}
        />

        {/* Drawer Container */}
        <div className="relative w-full max-w-xl bg-white shadow-2xl border-l border-[#E2E8F0] h-full flex flex-col z-10 animate-in slide-in-from-right duration-200 overflow-hidden">
          {/* Header Bar */}
          <div className="p-5 border-b border-[#E2E8F0] flex items-start justify-between bg-[#F8F9FA]">
            <div className="space-y-1 min-w-0 pr-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono font-extrabold text-xs text-[#2563EB] bg-[#EFF6FF] border border-[#BFDBFE] px-2 py-0.5 rounded">
                  {asset.tag}
                </span>
                <AssetStateBadge status={asset.status} size="sm" />
                {asset.isBookable && (
                  <Badge variant="primary" size="xs" dot>
                    Bookable Resource
                  </Badge>
                )}
              </div>

              <h3 className="font-bold text-[#0F172A] text-base leading-tight mt-1 font-heading">
                {asset.name}
              </h3>
              <p className="text-xs text-[#64748B] font-mono">
                SN: {asset.serialNumber || 'N/A'} &bull; {asset.categoryName}
              </p>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={handleOpenQrTrigger}
                className="p-1.5 rounded-lg text-[#64748B] hover:text-[#2563EB] hover:bg-white border border-[#E2E8F0] cursor-pointer transition-colors"
                title="Print QR Badge"
              >
                <QrCode className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-slate-200/60 cursor-pointer transition-colors"
                title="Close Drawer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="px-5 py-2.5 border-b border-slate-100 bg-white flex items-center justify-between gap-2 overflow-x-auto">
            <div className="flex items-center gap-1.5 flex-wrap">
              {asset.status === 'Allocated' && (
                <Button
                  variant="primary"
                  size="xs"
                  onClick={handleCheckInTrigger}
                  leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                >
                  Check-In
                </Button>
              )}

              <Button
                variant="outline"
                size="xs"
                onClick={handleRaiseTicketTrigger}
                leftIcon={<Wrench className="w-3.5 h-3.5 text-amber-600" />}
              >
                Report Issue
              </Button>

              <Button
                variant={isEditing ? 'secondary' : 'outline'}
                size="xs"
                onClick={() => setIsEditing(!isEditing)}
                leftIcon={<Edit3 className="w-3.5 h-3.5 text-[#2563EB]" />}
              >
                {isEditing ? 'Cancel Edit' : 'Edit Asset'}
              </Button>

              {(currentUser.role === 'admin' || currentUser.role === 'asset_manager') && (
                <Button
                  variant="ghost"
                  size="xs"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => setShowDeleteConfirm(true)}
                  leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                >
                  Decommission
                </Button>
              )}
            </div>

            {/* Quick status transition dropdown for Admin / Asset Manager */}
            {(currentUser.role === 'admin' || currentUser.role === 'asset_manager') && (
              <div className="flex items-center gap-1 text-[11px] text-slate-500 shrink-0">
                <span className="hidden sm:inline">Status:</span>
                <select
                  value={asset.status}
                  onChange={(e) => handleStateChange(e.target.value as AssetState)}
                  className="rounded border border-[#E2E8F0] bg-[#F8F9FA] px-2 py-1 text-xs text-[#0F172A] font-medium focus:outline-none focus:border-[#2563EB]"
                >
                  <option value="Available">Available</option>
                  <option value="Allocated">Allocated</option>
                  <option value="Reserved">Reserved</option>
                  <option value="Under Maintenance">Under Maintenance</option>
                  <option value="Lost">Lost</option>
                  <option value="Retired">Retired</option>
                  <option value="Disposed">Disposed</option>
                </select>
              </div>
            )}
          </div>

          {/* Delete Confirmation Alert Banner */}
          {showDeleteConfirm && (
            <div className="p-4 bg-red-50 border-b border-red-200 animate-in fade-in">
              <div className="flex items-start gap-2.5">
                <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div className="space-y-1.5 flex-1 text-xs">
                  <p className="font-bold text-red-900">Decommission & Permanently Delete {asset.tag}?</p>
                  <p className="text-red-700">
                    This removes <strong>{asset.name}</strong> from enterprise inventory and logs an immutable audit trail entry. This action cannot be reversed.
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <Button
                      variant="primary"
                      size="xs"
                      className="bg-red-600 hover:bg-red-700 text-white"
                      onClick={handleDeleteConfirm}
                    >
                      Yes, Decommission & Delete
                    </Button>
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => setShowDeleteConfirm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab Selector */}
          <div className="px-5 pt-3 pb-1 border-b border-slate-100">
            <Tabs
              size="sm"
              tabs={[
                { id: 'specs', label: 'Specifications & Custody', icon: <FileText className="w-3.5 h-3.5" /> },
                { id: 'history', label: 'Allocation History', count: historyList.length, icon: <History className="w-3.5 h-3.5" /> },
                { id: 'maintenance', label: 'Maintenance Logs', count: assetTickets.length, icon: <Wrench className="w-3.5 h-3.5" /> },
              ]}
              activeTab={activeTab}
              onChange={(t) => setActiveTab(t as any)}
            />
          </div>

          {/* Tab Content Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {/* TAB 1: SPECIFICATIONS & CURRENT CUSTODY */}
            {activeTab === 'specs' && (
              <div className="space-y-4">
                {isEditing ? (
                  /* INLINE EDIT FORM */
                  <form onSubmit={handleSaveEdit} className="p-4 rounded-xl border border-[#2563EB]/30 bg-blue-50/20 space-y-3.5 text-xs animate-in fade-in">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                      <span className="font-bold text-[#0F172A] flex items-center gap-1.5 text-xs">
                        <Edit3 className="w-3.5 h-3.5 text-[#2563EB]" /> Edit Asset Specifications
                      </span>
                      <span className="text-[10px] text-[#64748B] font-mono">{asset.tag}</span>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[11px] font-semibold text-[#0F172A]">Asset Name</label>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border border-[#E2E8F0] bg-white text-xs text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="block text-[11px] font-semibold text-[#0F172A]">Physical Location</label>
                        <input
                          type="text"
                          value={editLocation}
                          onChange={(e) => setEditLocation(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg border border-[#E2E8F0] bg-white text-xs text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-semibold text-[#0F172A]">Serial Number</label>
                        <input
                          type="text"
                          value={editSerialNumber}
                          onChange={(e) => setEditSerialNumber(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg border border-[#E2E8F0] bg-white text-xs font-mono text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="block text-[11px] font-semibold text-[#0F172A]">Physical Condition</label>
                        <select
                          value={editCondition}
                          onChange={(e) => setEditCondition(e.target.value as any)}
                          className="w-full px-3 py-1.5 rounded-lg border border-[#E2E8F0] bg-white text-xs text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                        >
                          <option value="New">New</option>
                          <option value="Good">Good</option>
                          <option value="Fair">Fair</option>
                          <option value="Maintenance Required">Maintenance Required</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-semibold text-[#0F172A]">Acquisition Cost ($)</label>
                        <input
                          type="number"
                          value={editCost}
                          onChange={(e) => setEditCost(Number(e.target.value))}
                          className="w-full px-3 py-1.5 rounded-lg border border-[#E2E8F0] bg-white text-xs font-mono text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                          min="0"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="block text-[11px] font-semibold text-[#0F172A]">Custodial Department</label>
                        <select
                          value={editDepartment}
                          onChange={(e) => setEditDepartment(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg border border-[#E2E8F0] bg-white text-xs text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                        >
                          {departments.map((d) => (
                            <option key={d.id} value={d.name}>{d.name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-semibold text-[#0F172A]">Category</label>
                        <select
                          value={editCategory}
                          onChange={(e) => setEditCategory(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg border border-[#E2E8F0] bg-white text-xs text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                        >
                          {categories.map((c) => (
                            <option key={c.id} value={c.name}>{c.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="checkbox"
                        id="drawer-isBookable"
                        checked={editIsBookable}
                        onChange={(e) => setEditIsBookable(e.target.checked)}
                        className="rounded border-[#E2E8F0] text-[#2563EB] focus:ring-[#2563EB]"
                      />
                      <label htmlFor="drawer-isBookable" className="text-xs text-[#0F172A] font-medium cursor-pointer">
                        Mark as pool-bookable shared resource (Rooms, fleet, rigs)
                      </label>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                      <Button
                        type="button"
                        variant="outline"
                        size="xs"
                        onClick={() => setIsEditing(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        variant="primary"
                        size="xs"
                        leftIcon={<Save className="w-3.5 h-3.5" />}
                      >
                        Save Changes
                      </Button>
                    </div>
                  </form>
                ) : (
                  <>
                    {/* Current Custodian Highlight Card */}
                    <div className="p-4 rounded-xl border border-[#E2E8F0] bg-[#F8F9FA] space-y-2">
                      <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">
                        Current Custody & Deployment
                      </span>

                      {asset.currentHolderName ? (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            {asset.currentHolderAvatar && (
                              <img
                                src={asset.currentHolderAvatar}
                                alt={asset.currentHolderName}
                                className="w-9 h-9 rounded-full object-cover border border-[#E2E8F0]"
                              />
                            )}
                            <div>
                              <h4 className="text-xs font-bold text-[#0F172A]">{asset.currentHolderName}</h4>
                              <p className="text-[11px] text-[#64748B]">{asset.departmentName}</p>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="text-[10px] text-[#64748B] block">Expected Return</span>
                            <span className="font-mono text-xs font-bold text-[#0F172A] block">
                              {asset.expectedReturnDate || 'Open Allocation'}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between text-xs text-[#64748B]">
                          <span>Unallocated — Secured in Storage Bay</span>
                          <Badge variant="success" size="xs" dot>Ready to check out</Badge>
                        </div>
                      )}
                    </div>

                    {/* Technical Specifications Grid */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider font-heading">
                          Hardware Specifications
                        </h4>
                        <button
                          onClick={() => setIsEditing(true)}
                          className="text-[11px] text-[#2563EB] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <Edit3 className="w-3 h-3" /> Quick Edit
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="p-3 rounded-lg border border-[#E2E8F0] bg-white space-y-0.5">
                          <span className="text-[10px] text-[#64748B] block">Physical Location</span>
                          <span className="font-semibold text-[#0F172A] flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-[#2563EB]" />
                            {asset.location}
                          </span>
                        </div>

                        <div className="p-3 rounded-lg border border-[#E2E8F0] bg-white space-y-0.5">
                          <span className="text-[10px] text-[#64748B] block">Custodial Department</span>
                          <span className="font-semibold text-[#0F172A] flex items-center gap-1">
                            <Building2 className="w-3.5 h-3.5 text-[#64748B]" />
                            {asset.departmentName}
                          </span>
                        </div>

                        <div className="p-3 rounded-lg border border-[#E2E8F0] bg-white space-y-0.5">
                          <span className="text-[10px] text-[#64748B] block">Physical Condition</span>
                          <span className="font-semibold text-[#0F172A]">
                            {asset.condition}
                          </span>
                        </div>

                        <div className="p-3 rounded-lg border border-[#E2E8F0] bg-white space-y-0.5">
                          <span className="text-[10px] text-[#64748B] block">Acquisition Cost (Reporting)</span>
                          <span className="font-semibold text-[#0F172A] font-mono">
                            ${asset.costTracking?.toLocaleString() || '0'}
                          </span>
                        </div>

                        <div className="p-3 rounded-lg border border-[#E2E8F0] bg-white space-y-0.5">
                          <span className="text-[10px] text-[#64748B] block">Commission Date</span>
                          <span className="font-semibold text-[#0F172A] font-mono">
                            {asset.commissionDate || '2024-01-01'}
                          </span>
                        </div>

                        <div className="p-3 rounded-lg border border-[#E2E8F0] bg-white space-y-0.5">
                          <span className="text-[10px] text-[#64748B] block">Warranty Expiration</span>
                          <span className="font-semibold text-[#0F172A] font-mono">
                            {asset.warrantyExpiryDate || '2027-01-01'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* TAB 2: TABBED ALLOCATION HISTORY TIMELINE */}
            {activeTab === 'history' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider font-heading">
                    Custody Timeline & Historical Check-outs
                  </h4>
                  <span className="text-[11px] text-[#64748B]">{historyList.length} Historical records</span>
                </div>

                {historyList.length === 0 ? (
                  <div className="p-8 text-center text-[#64748B] border border-dashed rounded-xl">
                    <p className="text-xs">No previous check-out cycles recorded for this asset.</p>
                  </div>
                ) : (
                  <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E2E8F0]">
                    {historyList.map((hist, idx) => {
                      const isCurrent = !hist.returnedDate
                      return (
                        <div key={hist.id || idx} className="relative text-xs">
                          {/* Timeline node */}
                          <div
                            className={`absolute -left-6 top-1 w-3 h-3 rounded-full border-2 bg-white ${
                              isCurrent ? 'border-[#2563EB] ring-2 ring-blue-100' : 'border-[#94A3B8]'
                            }`}
                          />

                          <div className="p-3 rounded-xl border border-[#E2E8F0] bg-white shadow-2xs space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-[#0F172A]">{hist.holderName}</span>
                              {isCurrent ? (
                                <Badge variant="primary" size="xs" dot>Active Custody</Badge>
                              ) : (
                                <Badge variant="success" size="xs">Returned ({hist.conditionOnReturn || 'Good'})</Badge>
                              )}
                            </div>

                            <div className="text-[11px] text-[#64748B] space-y-0.5">
                              <p>Dept: {hist.departmentName}</p>
                              <p className="font-mono text-[10px] text-[#64748B]">
                                Checked out: {hist.allocatedDate} &bull; {hist.returnedDate ? `Returned: ${hist.returnedDate}` : `Due: ${hist.expectedReturnDate || 'Open'}`}
                              </p>
                            </div>

                            {hist.notes && (
                              <p className="text-[11px] text-[#0F172A] bg-[#F8F9FA] p-1.5 rounded border border-[#E2E8F0] italic">
                                &quot;{hist.notes}&quot;
                              </p>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: MAINTENANCE LOGS */}
            {activeTab === 'maintenance' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider font-heading">
                    Repair & Ticket Records
                  </h4>
                  <Button
                    variant="primary"
                    size="xs"
                    onClick={handleRaiseTicketTrigger}
                    leftIcon={<Wrench className="w-3 h-3" />}
                  >
                    Raise Ticket
                  </Button>
                </div>

                {assetTickets.length === 0 ? (
                  <div className="p-8 text-center text-[#64748B] border border-dashed rounded-xl">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-[#0F172A]">Clean Maintenance History</p>
                    <p className="text-[11px]">No active defect tickets or historical failures recorded for this unit.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {assetTickets.map((t) => (
                      <div
                        key={t.id}
                        className="p-3.5 rounded-xl border border-[#E2E8F0] bg-white shadow-2xs space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-[#0F172A]">{t.ticketNumber}</span>
                            <span
                              className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                                t.priority === 'Critical'
                                  ? 'bg-[#FEF2F2] text-red-700'
                                  : t.priority === 'High'
                                  ? 'bg-[#FFFBEB] text-amber-800'
                                  : 'bg-[#F1F5F9] text-slate-700'
                              }`}
                            >
                              {t.priority}
                            </span>
                          </div>
                          <MaintenanceBadge status={t.status} size="xs" />
                        </div>

                        <p className="text-[#0F172A] leading-relaxed font-medium">
                          {t.issueDescription}
                        </p>

                        {t.assignedTechnician && (
                          <div className="p-2 rounded bg-[#EFF6FF] border border-[#BFDBFE] text-[11px] text-[#1E40AF]">
                            <strong>Assigned Technician:</strong> {t.assignedTechnician}
                          </div>
                        )}

                        <div className="flex items-center justify-between text-[10px] text-[#64748B] pt-1 border-t border-[#E2E8F0]">
                          <span>Reported by: {t.reportedByName}</span>
                          <span>{t.createdAt}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Internal Modals when callbacks are not provided */}
      {internalQrOpen && (
        <QrCodeModal
          isOpen={internalQrOpen}
          onClose={() => setInternalQrOpen(false)}
          asset={asset}
        />
      )}
      {internalCheckInOpen && (
        <CheckInReturnModal
          isOpen={internalCheckInOpen}
          onClose={() => setInternalCheckInOpen(false)}
          targetAsset={asset}
        />
      )}
      {internalRaiseOpen && (
        <RaiseMaintenanceModal
          isOpen={internalRaiseOpen}
          onClose={() => setInternalRaiseOpen(false)}
          targetAsset={asset}
        />
      )}
    </>
  )
}
