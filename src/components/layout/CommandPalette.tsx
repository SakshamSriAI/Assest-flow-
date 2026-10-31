import React, { useState, useEffect, useRef } from 'react'
import {
  Search,
  X,
  LayoutDashboard,
  Boxes,
  ArrowRightLeft,
  CalendarCheck2,
  Wrench,
  ClipboardCheck,
  BarChart3,
  Settings2,
  History,
  Plus,
  RotateCcw,
  UserCheck,
  ShieldAlert,
  ArrowRight,
  Trash2
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { AppRoute, Asset } from '../../types'
import { AssetStateBadge } from '../ui/Badge'

export const CommandPalette: React.FC = () => {
  const {
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    setCurrentRoute,
    assets,
    setIsRegisterAssetOpen,
    setIsBookResourceOpen,
    setIsRaiseMaintenanceOpen,
    setIsRoleSwitcherOpen,
    setDetailAsset,
    resetDatabase,
    clearDatabase,
  } = useApp()

  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  // Global keyboard shortcut listener for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setIsCommandPaletteOpen(!isCommandPaletteOpen)
      } else if (e.key === 'Escape' && isCommandPaletteOpen) {
        setIsCommandPaletteOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isCommandPaletteOpen, setIsCommandPaletteOpen])

  // Focus input when opened
  useEffect(() => {
    if (isCommandPaletteOpen) {
      setQuery('')
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isCommandPaletteOpen])

  if (!isCommandPaletteOpen) return null

  // Available navigation destinations
  const navItems = [
    { label: 'Operational Dashboard', route: 'dashboard' as AppRoute, icon: LayoutDashboard, category: 'Pages' },
    { label: 'Asset Directory & Hardware Vault', route: 'assets' as AppRoute, icon: Boxes, category: 'Pages' },
    { label: 'Allocations & Custody Transfers', route: 'allocations' as AppRoute, icon: ArrowRightLeft, category: 'Pages' },
    { label: 'Resource Booking & Conflict Scheduler', route: 'bookings' as AppRoute, icon: CalendarCheck2, category: 'Pages' },
    { label: 'Maintenance & Hardware Repairs', route: 'maintenance' as AppRoute, icon: Wrench, category: 'Pages' },
    { label: 'Physical Audit Cycles', route: 'audits' as AppRoute, icon: ClipboardCheck, category: 'Pages' },
    { label: 'Reports & Telemetry Analytics', route: 'reports' as AppRoute, icon: BarChart3, category: 'Pages' },
    { label: 'Organization Setup & Role Elevation', route: 'org-setup' as AppRoute, icon: Settings2, category: 'Pages' },
    { label: 'Activity Audit Trail & Immutable Log', route: 'activity' as AppRoute, icon: History, category: 'Pages' },
  ]

  // Available quick action triggers
  const actionItems = [
    {
      label: 'Register New Physical Asset',
      category: 'Actions',
      icon: Plus,
      action: () => setIsRegisterAssetOpen(true),
    },
    {
      label: 'Reserve Shared Resource / Room',
      category: 'Actions',
      icon: CalendarCheck2,
      action: () => setIsBookResourceOpen(true),
    },
    {
      label: 'Raise Maintenance Ticket',
      category: 'Actions',
      icon: Wrench,
      action: () => setIsRaiseMaintenanceOpen(true),
    },
    {
      label: 'Switch User Persona / RBAC Role',
      category: 'Actions',
      icon: UserCheck,
      action: () => setIsRoleSwitcherOpen(true),
    },
    {
      label: 'Reset System Database to Clean Demo State',
      category: 'Actions',
      icon: RotateCcw,
      action: () => resetDatabase(),
    },
    {
      label: 'Clear All Records (Empty Zero-State Database)',
      category: 'Actions',
      icon: Trash2,
      action: () => clearDatabase(),
    },
  ]

  const q = query.toLowerCase().trim()

  // Filtered Assets
  const matchingAssets = q
    ? assets
        .filter(
          (a) =>
            a.tag.toLowerCase().includes(q) ||
            a.name.toLowerCase().includes(q) ||
            a.departmentName.toLowerCase().includes(q) ||
            (a.currentHolderName && a.currentHolderName.toLowerCase().includes(q)) ||
            (a.serialNumber && a.serialNumber.toLowerCase().includes(q))
        )
        .slice(0, 5)
    : assets.slice(0, 4)

  // Filtered Navigation
  const matchingNav = navItems.filter((item) => !q || item.label.toLowerCase().includes(q))

  // Filtered Actions
  const matchingActions = actionItems.filter((item) => !q || item.label.toLowerCase().includes(q))

  const handleSelectNav = (route: AppRoute) => {
    setCurrentRoute(route)
    setIsCommandPaletteOpen(false)
  }

  const handleSelectAction = (action: () => void) => {
    action()
    setIsCommandPaletteOpen(false)
  }

  const handleSelectAsset = (asset: Asset) => {
    setDetailAsset(asset)
    setIsCommandPaletteOpen(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-900/40 backdrop-blur-xs">
      <div
        className="fixed inset-0"
        onClick={() => setIsCommandPaletteOpen(false)}
      />

      <div className="relative w-full max-w-xl bg-white rounded-2xl border border-[#E2E8F0] shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#E2E8F0] bg-white">
          <Search className="w-5 h-5 text-[#2563EB] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command, screen, or search assets (e.g. AF-0001, MacBook, Audit)..."
            className="flex-1 bg-transparent text-sm text-[#0F172A] placeholder:text-[#64748B] focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F3F5] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block rounded border border-[#E2E8F0] bg-[#F8F9FA] px-1.5 py-0.5 text-[10px] font-mono font-medium text-[#64748B]">
            ESC
          </kbd>
        </div>

        {/* Results Container */}
        <div className="flex-1 overflow-y-auto p-2 space-y-4 text-xs divide-y divide-[#F1F3F5]">
          {/* Section 1: Matching Physical Assets */}
          {matchingAssets.length > 0 && (
            <div className="space-y-1 pt-1 first:pt-0">
              <span className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#64748B] block">
                Physical Inventory ({matchingAssets.length})
              </span>
              {matchingAssets.map((asset) => (
                <button
                  key={asset.id}
                  onClick={() => handleSelectAsset(asset)}
                  className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-[#EFF6FF] text-left transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="font-mono font-bold text-[#2563EB] bg-[#EFF6FF] px-1.5 py-0.5 rounded text-[11px] border border-[#BFDBFE] shrink-0">
                      {asset.tag}
                    </span>
                    <div className="min-w-0">
                      <p className="font-semibold text-[#0F172A] truncate group-hover:text-[#2563EB] transition-colors">
                        {asset.name}
                      </p>
                      <p className="text-[10px] text-[#64748B] truncate">
                        {asset.departmentName} &bull; Holder: {asset.currentHolderName || 'Inventory Vault'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <AssetStateBadge status={asset.status} size="xs" />
                    <ArrowRight className="w-3.5 h-3.5 text-[#64748B] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Section 2: Quick Actions */}
          {matchingActions.length > 0 && (
            <div className="space-y-1 pt-2">
              <span className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#64748B] block">
                Quick Actions
              </span>
              {matchingActions.map((item, idx) => {
                const Icon = item.icon
                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectAction(item.action)}
                    className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-[#EFF6FF] text-left transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-md bg-[#F1F3F5] text-[#2563EB] group-hover:bg-[#2563EB] group-hover:text-white transition-colors">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-medium text-[#0F172A] group-hover:text-[#2563EB] transition-colors">
                        {item.label}
                      </span>
                    </div>
                    <span className="text-[10px] text-[#64748B] font-mono">Execute</span>
                  </button>
                )
              })}
            </div>
          )}

          {/* Section 3: Navigation Routes */}
          {matchingNav.length > 0 && (
            <div className="space-y-1 pt-2">
              <span className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#64748B] block">
                Navigation
              </span>
              {matchingNav.map((item, idx) => {
                const Icon = item.icon
                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectNav(item.route)}
                    className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-[#EFF6FF] text-left transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-md bg-[#F1F3F5] text-[#64748B] group-hover:bg-[#2563EB] group-hover:text-white transition-colors">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-medium text-[#0F172A] group-hover:text-[#2563EB] transition-colors">
                        {item.label}
                      </span>
                    </div>
                    <span className="text-[10px] text-[#64748B] font-mono">Go to screen &rarr;</span>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer Shortcut Bar */}
        <div className="px-4 py-2 bg-[#F8F9FA] border-t border-[#E2E8F0] flex items-center justify-between text-[11px] text-[#64748B]">
          <div className="flex items-center gap-3">
            <span>Press <kbd className="font-mono bg-white border border-[#E2E8F0] px-1 rounded text-[10px]">Enter</kbd> to select</span>
            <span><kbd className="font-mono bg-white border border-[#E2E8F0] px-1 rounded text-[10px]">ESC</kbd> to close</span>
          </div>
          <span className="font-mono text-[#2563EB]">AssetFlow Core v2.0</span>
        </div>
      </div>
    </div>
  )
}
