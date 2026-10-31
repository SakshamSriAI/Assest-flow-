import React, { useState } from 'react'
import {
  Boxes,
  QrCode,
  Search,
  Filter,
  Plus,
  ArrowRight,
  Download,
  RotateCcw,
  Wrench,
  Eye,
  Building2,
  MapPin,
  Sparkles,
  Calendar,
  X,
  FileSpreadsheet
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { Card } from '../ui/Card'
import { Badge, AssetStateBadge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { RegisterAssetModal } from '../dashboard/RegisterAssetModal'
import { QrCodeModal } from '../assets/QrCodeModal'
import { AssetDetailDrawer } from '../assets/AssetDetailDrawer'
import { CheckInReturnModal } from '../dashboard/CheckInReturnModal'
import { RaiseMaintenanceModal } from '../dashboard/RaiseMaintenanceModal'
import { Asset, AssetState } from '../../types'

export const AssetDirectoryScreen: React.FC = () => {
  const { assets, categories, departments, currentUser } = useApp()

  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('ALL')
  const [selectedDepartment, setSelectedDepartment] = useState('ALL')
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL')
  const [selectedCondition, setSelectedCondition] = useState('ALL')
  const [onlyBookable, setOnlyBookable] = useState(false)

  // Modals & Drawer states
  const [isRegisterOpen, setIsRegisterOpen] = useState(false)
  const [selectedQrAsset, setSelectedQrAsset] = useState<Asset | null>(null)
  const [selectedDetailAsset, setSelectedDetailAsset] = useState<Asset | null>(null)
  const [selectedReturnAsset, setSelectedReturnAsset] = useState<Asset | null>(null)
  const [selectedMaintAsset, setSelectedMaintAsset] = useState<Asset | null>(null)

  // Metrics computation
  const totalCount = assets.length
  const allocatedCount = assets.filter((a) => a.status === 'Allocated').length
  const availableCount = assets.filter((a) => a.status === 'Available').length
  const maintenanceCount = assets.filter((a) => a.status === 'Under Maintenance').length
  const lostCount = assets.filter((a) => a.status === 'Lost').length

  // Filter application
  const filteredAssets = assets.filter((asset) => {
    // Quick search: matches Tag, Name, Serial Number, Location, or Holder
    const term = searchTerm.toLowerCase().trim()
    const matchesSearch =
      !term ||
      asset.tag.toLowerCase().includes(term) ||
      asset.name.toLowerCase().includes(term) ||
      (asset.serialNumber && asset.serialNumber.toLowerCase().includes(term)) ||
      asset.location.toLowerCase().includes(term) ||
      (asset.currentHolderName && asset.currentHolderName.toLowerCase().includes(term))

    const matchesCategory = selectedCategory === 'ALL' || asset.categoryId === selectedCategory
    const matchesDept = selectedDepartment === 'ALL' || asset.departmentId === selectedDepartment
    const matchesStatus = selectedStatus === 'ALL' || asset.status === selectedStatus
    const matchesCondition = selectedCondition === 'ALL' || asset.condition === selectedCondition
    const matchesBookable = !onlyBookable || asset.isBookable

    return (
      matchesSearch &&
      matchesCategory &&
      matchesDept &&
      matchesStatus &&
      matchesCondition &&
      matchesBookable
    )
  })

  const resetFilters = () => {
    setSearchTerm('')
    setSelectedCategory('ALL')
    setSelectedDepartment('ALL')
    setSelectedStatus('ALL')
    setSelectedCondition('ALL')
    setOnlyBookable(false)
  }

  const exportCsv = () => {
    const headers = ['Tag', 'Name', 'Category', 'Department', 'Status', 'Holder', 'Serial', 'Condition', 'Location', 'Cost']
    const rows = filteredAssets.map((a) => [
      a.tag,
      `"${a.name.replace(/"/g, '""')}"`,
      a.categoryName,
      a.departmentName,
      a.status,
      a.currentHolderName || 'N/A',
      a.serialNumber || 'N/A',
      a.condition,
      `"${a.location}"`,
      a.costTracking,
    ])
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `AssetFlow_Inventory_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6">
      {/* Screen Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[#0F172A] tracking-tight font-heading">
              Asset Directory
            </h1>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="secondary"
            size="sm"
            onClick={exportCsv}
            leftIcon={<FileSpreadsheet className="w-4 h-4 text-emerald-600" />}
          >
            Export CSV
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsRegisterOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Register Asset
          </Button>
        </div>
      </div>

      {/* Quick Metrics KPI Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-3 bg-white rounded-xl border border-[#E2E8F0] shadow-2xs">
          <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">Total Catalog</span>
          <span className="text-lg font-extrabold text-[#0F172A] mt-0.5 block">{totalCount}</span>
          <span className="text-[11px] text-[#64748B]">Tracked Units</span>
        </div>

        <div className="p-3 bg-white rounded-xl border border-[#E2E8F0] shadow-2xs">
          <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">Allocated / Field</span>
          <span className="text-lg font-extrabold text-[#2563EB] mt-0.5 block">{allocatedCount}</span>
          <span className="text-[11px] text-[#2563EB] font-medium">In Staff Custody</span>
        </div>

        <div className="p-3 bg-white rounded-xl border border-[#E2E8F0] shadow-2xs">
          <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">Available Storage</span>
          <span className="text-lg font-extrabold text-[#047857] mt-0.5 block">{availableCount}</span>
          <span className="text-[11px] text-[#047857] font-medium">Ready for Deploy</span>
        </div>

        <div className="p-3 bg-white rounded-xl border border-[#E2E8F0] shadow-2xs">
          <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">Maintenance</span>
          <span className="text-lg font-extrabold text-[#B45309] mt-0.5 block">{maintenanceCount}</span>
          <span className="text-[11px] text-[#B45309] font-medium">Repairs & Diagnostics</span>
        </div>

        <div className="p-3 bg-white rounded-xl border border-[#E2E8F0] shadow-2xs">
          <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">Flagged / Lost</span>
          <span className="text-lg font-extrabold text-[#B91C1C] mt-0.5 block">{lostCount}</span>
          <span className="text-[11px] text-[#B91C1C] font-medium">Audit Discrepancies</span>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="p-4 bg-white rounded-xl border border-[#E2E8F0] shadow-xs space-y-3">
        {/* Row 1: Search & Quick Reset */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
            <input
              type="text"
              placeholder="Search by tag (e.g. AF-0001), name, serial, holder, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#F8F9FA] border border-[#E2E8F0] rounded-lg pl-8 pr-4 py-1.5 text-xs text-[#0F172A] placeholder:text-[#64748B] focus:outline-none focus:border-[#2563EB] focus:bg-white transition-all"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            <span className="text-xs text-[#64748B]">
              Showing <strong>{filteredAssets.length}</strong> of {assets.length} assets
            </span>
            {(searchTerm || selectedCategory !== 'ALL' || selectedDepartment !== 'ALL' || selectedStatus !== 'ALL' || selectedCondition !== 'ALL' || onlyBookable) && (
              <button
                onClick={resetFilters}
                className="text-[11px] text-[#B91C1C] hover:text-[#991B1B] font-medium flex items-center gap-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" /> Reset Filters
              </button>
            )}
          </div>
        </div>

        {/* Row 2: Faceted Select Filters */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 border-t border-[#E2E8F0] text-xs">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-lg border border-[#E2E8F0] bg-[#F8F9FA] px-2 py-1.5 text-[#0F172A] focus:outline-none focus:border-[#2563EB]"
          >
            <option value="ALL">All Categories ({categories.length})</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Department Filter */}
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="rounded-lg border border-[#E2E8F0] bg-[#F8F9FA] px-2 py-1.5 text-[#0F172A] focus:outline-none focus:border-[#2563EB]"
          >
            <option value="ALL">All Departments ({departments.length})</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.code})
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="rounded-lg border border-[#E2E8F0] bg-[#F8F9FA] px-2 py-1.5 text-[#0F172A] focus:outline-none focus:border-[#2563EB] font-medium"
          >
            <option value="ALL">All States (7 States)</option>
            {(['Available', 'Allocated', 'Reserved', 'Under Maintenance', 'Lost', 'Retired', 'Disposed'] as AssetState[]).map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>

          {/* Condition Filter */}
          <select
            value={selectedCondition}
            onChange={(e) => setSelectedCondition(e.target.value)}
            className="rounded-lg border border-[#E2E8F0] bg-[#F8F9FA] px-2 py-1.5 text-[#0F172A] focus:outline-none focus:border-[#2563EB]"
          >
            <option value="ALL">All Conditions</option>
            <option value="New">Brand New</option>
            <option value="Good">Good Condition</option>
            <option value="Fair">Fair</option>
            <option value="Maintenance Required">Maintenance Required</option>
          </select>

          {/* Bookable Toggle Checkbox */}
          <label className="flex items-center gap-2 rounded-lg border border-[#E2E8F0] bg-[#F8F9FA] px-2.5 py-1.5 cursor-pointer hover:bg-slate-100 transition-colors">
            <input
              type="checkbox"
              checked={onlyBookable}
              onChange={(e) => setOnlyBookable(e.target.checked)}
              className="rounded text-[#2563EB] focus:ring-[#2563EB] w-3.5 h-3.5"
            />
            <span className="text-[11px] font-semibold text-[#0F172A] truncate">
              Shared Bookable Only
            </span>
          </label>
        </div>
      </div>

      {/* CENTRAL HIGH-DENSITY ASSET TABLE */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-[#F1F3F5] text-[11px] font-semibold text-[#64748B]">
                <th className="py-3 px-4">Asset Tag & QR</th>
                <th className="py-3 px-4">Specification / Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Department & Location</th>
                <th className="py-3 px-4">Operational Status</th>
                <th className="py-3 px-4">Current Custodian</th>
                <th className="py-3 px-4 text-center">Condition</th>
                <th className="py-3 px-4 text-right">Acquisition</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F3F5]">
              {filteredAssets.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-[#64748B]">
                    <Boxes className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-[#0F172A]">No assets matching query</p>
                    <p className="text-[11px]">Try adjusting your search criteria or reset filters.</p>
                  </td>
                </tr>
              ) : (
                filteredAssets.map((asset) => (
                  <tr
                    key={asset.id}
                    onClick={() => setSelectedDetailAsset(asset)}
                    className="hover:bg-[#EFF6FF]/60 transition-colors cursor-pointer group"
                  >
                    {/* Tag & QR */}
                    <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setSelectedQrAsset(asset)}
                          className="p-1 rounded bg-[#F1F3F5] hover:bg-[#EFF6FF] text-[#64748B] hover:text-[#2563EB] transition-colors"
                          title="View & Print Barcode Sticker"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                        </button>
                        <span className="font-mono font-bold text-[#0F172A] group-hover:text-[#2563EB] transition-colors">
                          {asset.tag}
                        </span>
                      </div>
                    </td>

                    {/* Specification / Name & Serial */}
                    <td className="py-3 px-4">
                      <div className="space-y-0.5 max-w-xs">
                        <span className="font-semibold text-[#0F172A] block truncate">
                          {asset.name}
                        </span>
                        <div className="flex items-center gap-1.5 text-[10px] text-[#64748B] font-mono">
                          <span>SN: {asset.serialNumber || 'N/A'}</span>
                          {asset.isBookable && (
                            <span className="text-[9px] font-bold text-[#2563EB] bg-[#EFF6FF] px-1 rounded">
                              Bookable
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4 text-slate-600 text-[11px]">
                      {asset.categoryName}
                    </td>

                    {/* Department & Location */}
                    <td className="py-3 px-4">
                      <div className="space-y-0.5 max-w-[180px]">
                        <span className="font-medium text-slate-800 block truncate">
                          {asset.departmentName}
                        </span>
                        <span className="text-[10px] text-slate-400 block truncate flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          {asset.location}
                        </span>
                      </div>
                    </td>

                    {/* Operational Status */}
                    <td className="py-3 px-4">
                      <AssetStateBadge status={asset.status} size="xs" />
                    </td>

                    {/* Current Custodian */}
                    <td className="py-3 px-4">
                      {asset.currentHolderName ? (
                        <div className="flex items-center gap-2">
                          {asset.currentHolderAvatar && (
                            <img
                              src={asset.currentHolderAvatar}
                              alt={asset.currentHolderName}
                              className="w-5 h-5 rounded-full object-cover shrink-0"
                            />
                          )}
                          <div className="min-w-0">
                            <span className="font-medium text-slate-800 block truncate">
                              {asset.currentHolderName}
                            </span>
                            {asset.expectedReturnDate && (
                              <span className="text-[10px] text-slate-400 block font-mono">
                                Due: {asset.expectedReturnDate}
                              </span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">In Storage Bay</span>
                      )}
                    </td>

                    {/* Physical Condition */}
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                          asset.condition === 'New'
                            ? 'bg-emerald-50 text-emerald-700'
                            : asset.condition === 'Good'
                            ? 'bg-indigo-50 text-indigo-700'
                            : asset.condition === 'Fair'
                            ? 'bg-amber-50 text-amber-800'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {asset.condition}
                      </span>
                    </td>

                    {/* Acquisition Cost */}
                    <td className="py-3 px-4 text-right font-mono text-slate-700">
                      ${asset.costTracking?.toLocaleString() || '0'}
                    </td>

                    {/* Quick Action Buttons */}
                    <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() => setSelectedDetailAsset(asset)}
                          leftIcon={<Eye className="w-3.5 h-3.5" />}
                        >
                          Lifecycle
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODALS & DRAWERS */}
      <RegisterAssetModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
      />

      <QrCodeModal
        isOpen={Boolean(selectedQrAsset)}
        onClose={() => setSelectedQrAsset(null)}
        asset={selectedQrAsset}
      />

      <AssetDetailDrawer
        isOpen={Boolean(selectedDetailAsset)}
        onClose={() => setSelectedDetailAsset(null)}
        asset={selectedDetailAsset}
        onOpenQr={(a) => setSelectedQrAsset(a)}
        onCheckIn={(a) => {
          setSelectedReturnAsset(a)
        }}
        onRaiseTicket={(a) => {
          setSelectedMaintAsset(a)
        }}
      />

      {/* Return Modal */}
      {selectedReturnAsset && (
        <CheckInReturnModal
          isOpen={Boolean(selectedReturnAsset)}
          onClose={() => setSelectedReturnAsset(null)}
          targetAsset={selectedReturnAsset}
        />
      )}

      {/* Maintenance Modal */}
      {selectedMaintAsset && (
        <RaiseMaintenanceModal
          isOpen={Boolean(selectedMaintAsset)}
          onClose={() => setSelectedMaintAsset(null)}
          targetAsset={selectedMaintAsset}
        />
      )}
    </div>
  )
}
