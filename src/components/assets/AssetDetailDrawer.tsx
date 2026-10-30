import React, { useState } from 'react'
import {
  X,
  QrCode,
  RotateCcw,
  Wrench,
  ArrowRightLeft,
  Calendar,
  Clock,
  User,
  Building2,
  MapPin,
  ShieldAlert,
  History,
  FileText,
  DollarSign,
  Tag,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  ChevronRight
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { Asset, AssetState } from '../../types'
import { AssetStateBadge, Badge, MaintenanceBadge, RoleBadge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Tabs } from '../ui/Tabs'

interface AssetDetailDrawerProps {
  asset: Asset | null
  isOpen: boolean
  onClose: () => void
  onOpenQr: (asset: Asset) => void
  onCheckIn: (asset: Asset) => void
  onRaiseTicket: (asset: Asset) => void
}

export const AssetDetailDrawer: React.FC<AssetDetailDrawerProps> = ({
  asset,
  isOpen,
  onClose,
  onOpenQr,
  onCheckIn,
  onRaiseTicket,
}) => {
  const { tickets, updateAssetStatus, currentUser } = useApp()
  const [activeTab, setActiveTab] = useState<'specs' | 'history' | 'maintenance'>('specs')

  if (!isOpen || !asset) return null

  // Linked tickets for this specific asset
  const assetTickets = tickets.filter((t) => t.assetId === asset.id || t.assetTag === asset.tag)

  // Allocation history
  const historyList = asset.allocationHistory || []

  const handleStateChange = (newStatus: AssetState) => {
    updateAssetStatus(asset.id, newStatus, `Manually updated to ${newStatus} by ${currentUser.name}`)
  }

  return (
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

            <h3 className="font-bold text-[#0F172A] text-base leading-tight mt-1">
              {asset.name}
            </h3>
            <p className="text-xs text-[#64748B] font-mono">
              SN: {asset.serialNumber || 'N/A'} &bull; {asset.categoryName}
            </p>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => onOpenQr(asset)}
              className="p-1.5 rounded-lg text-[#64748B] hover:text-[#2563EB] hover:bg-white border border-[#E2E8F0] cursor-pointer transition-colors"
              title="Print QR Badge"
            >
              <QrCode className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-slate-200/60 cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="px-5 py-2.5 border-b border-slate-100 bg-white flex items-center justify-between gap-2 overflow-x-auto">
          <div className="flex items-center gap-1.5">
            {asset.status === 'Allocated' && (
              <Button
                variant="primary"
                size="xs"
                onClick={() => onCheckIn(asset)}
                leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              >
                Check-In / Return
              </Button>
            )}

            <Button
              variant="outline"
              size="xs"
              onClick={() => onRaiseTicket(asset)}
              leftIcon={<Wrench className="w-3.5 h-3.5 text-amber-600" />}
            >
              Report Issue
            </Button>
          </div>

          {/* Quick status transition dropdown for Admin / Asset Manager */}
          {(currentUser.role === 'admin' || currentUser.role === 'asset_manager') && (
            <div className="flex items-center gap-1 text-[11px] text-slate-500">
              <span className="hidden sm:inline">Set Status:</span>
              <select
                value={asset.status}
                onChange={(e) => handleStateChange(e.target.value as AssetState)}
                className="rounded border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-800 font-medium focus:outline-none focus:border-indigo-500"
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
              {/* Current Custodian Highlight Card */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Current Custody & Deployment
                </span>

                {asset.currentHolderName ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      {asset.currentHolderAvatar && (
                        <img
                          src={asset.currentHolderAvatar}
                          alt={asset.currentHolderName}
                          className="w-9 h-9 rounded-full object-cover border border-slate-200"
                        />
                      )}
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{asset.currentHolderName}</h4>
                        <p className="text-[11px] text-slate-500">{asset.departmentName}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block">Expected Return</span>
                      <span className="font-mono text-xs font-bold text-slate-900 block">
                        {asset.expectedReturnDate || 'Open Allocation'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span>Unallocated — Secured in Storage Bay</span>
                    <Badge variant="success" size="xs" dot>Ready to check out</Badge>
                  </div>
                )}
              </div>

              {/* Technical Specifications Grid */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Hardware Specifications
                </h4>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg border border-slate-200/80 bg-white space-y-0.5">
                    <span className="text-[10px] text-slate-400 block">Physical Location</span>
                    <span className="font-semibold text-slate-800 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                      {asset.location}
                    </span>
                  </div>

                  <div className="p-3 rounded-lg border border-slate-200/80 bg-white space-y-0.5">
                    <span className="text-[10px] text-slate-400 block">Custodial Department</span>
                    <span className="font-semibold text-slate-800 flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-slate-500" />
                      {asset.departmentName}
                    </span>
                  </div>

                  <div className="p-3 rounded-lg border border-slate-200/80 bg-white space-y-0.5">
                    <span className="text-[10px] text-slate-400 block">Physical Condition</span>
                    <span className="font-semibold text-slate-800">
                      {asset.condition}
                    </span>
                  </div>

                  <div className="p-3 rounded-lg border border-slate-200/80 bg-white space-y-0.5">
                    <span className="text-[10px] text-slate-400 block">Acquisition Cost (Reporting)</span>
                    <span className="font-semibold text-slate-800 font-mono">
                      ${asset.costTracking?.toLocaleString() || '0'}
                    </span>
                  </div>

                  <div className="p-3 rounded-lg border border-slate-200/80 bg-white space-y-0.5">
                    <span className="text-[10px] text-slate-400 block">Commission Date</span>
                    <span className="font-semibold text-slate-800 font-mono">
                      {asset.commissionDate || '2024-01-01'}
                    </span>
                  </div>

                  <div className="p-3 rounded-lg border border-slate-200/80 bg-white space-y-0.5">
                    <span className="text-[10px] text-slate-400 block">Warranty Expiration</span>
                    <span className="font-semibold text-slate-800 font-mono">
                      {asset.warrantyExpiryDate || '2027-01-01'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TABBED ALLOCATION HISTORY TIMELINE */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Custody Timeline & Historical Check-outs
                </h4>
                <span className="text-[11px] text-slate-400">{historyList.length} Historical records</span>
              </div>

              {historyList.length === 0 ? (
                <div className="p-8 text-center text-slate-400 border border-dashed rounded-xl">
                  <p className="text-xs">No previous check-out cycles recorded for this asset.</p>
                </div>
              ) : (
                <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {historyList.map((hist, idx) => {
                    const isCurrent = !hist.returnedDate
                    return (
                      <div key={hist.id || idx} className="relative text-xs">
                        {/* Timeline node */}
                        <div
                          className={`absolute -left-6 top-1 w-3 h-3 rounded-full border-2 bg-white ${
                            isCurrent ? 'border-indigo-600 ring-2 ring-indigo-200' : 'border-slate-400'
                          }`}
                        />

                        <div className="p-3 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900">{hist.holderName}</span>
                            {isCurrent ? (
                              <Badge variant="primary" size="xs" dot>Active Custody</Badge>
                            ) : (
                              <Badge variant="success" size="xs">Returned ({hist.conditionOnReturn || 'Good'})</Badge>
                            )}
                          </div>

                          <div className="text-[11px] text-slate-500 space-y-0.5">
                            <p>Dept: {hist.departmentName}</p>
                            <p className="font-mono text-[10px] text-slate-400">
                              Checked out: {hist.allocatedDate} &bull; {hist.returnedDate ? `Returned: ${hist.returnedDate}` : `Due: ${hist.expectedReturnDate || 'Open'}`}
                            </p>
                          </div>

                          {hist.notes && (
                            <p className="text-[11px] text-slate-600 bg-slate-50 p-1.5 rounded border border-slate-100 italic">
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
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Repair & Ticket Records
                </h4>
                <Button
                  variant="primary"
                  size="xs"
                  onClick={() => onRaiseTicket(asset)}
                  leftIcon={<Wrench className="w-3 h-3" />}
                >
                  Raise Ticket
                </Button>
              </div>

              {assetTickets.length === 0 ? (
                <div className="p-8 text-center text-slate-400 border border-dashed rounded-xl">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-700">Clean Maintenance History</p>
                  <p className="text-[11px]">No active defect tickets or historical failures recorded for this unit.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {assetTickets.map((t) => (
                    <div
                      key={t.id}
                      className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-900">{t.ticketNumber}</span>
                          <span
                            className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                              t.priority === 'Critical'
                                ? 'bg-rose-100 text-rose-700'
                                : t.priority === 'High'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {t.priority}
                          </span>
                        </div>
                        <MaintenanceBadge status={t.status} size="xs" />
                      </div>

                      <p className="text-slate-700 leading-relaxed font-medium">
                        {t.issueDescription}
                      </p>

                      {t.assignedTechnician && (
                        <div className="p-2 rounded bg-indigo-50/60 border border-indigo-100 text-[11px] text-indigo-900">
                          <strong>Assigned Technician:</strong> {t.assignedTechnician}
                        </div>
                      )}

                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100">
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
  )
}
