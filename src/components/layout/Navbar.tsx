import React from 'react'
import {
  Menu,
  Bell,
  Search,
  ChevronDown,
  LogOut
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { Breadcrumbs } from './Breadcrumbs'
import { RoleBadge } from '../ui/Badge'

export const Navbar: React.FC = () => {
  const {
    currentUser,
    setSidebarCollapsed,
    sidebarCollapsed,
    unreadCount,
    setIsNotificationDrawerOpen,
    setIsRoleSwitcherOpen,
    setCurrentRoute,
    setIsCommandPaletteOpen,
  } = useApp()

  return (
    <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-[#E2E8F0] bg-white/95 px-4 backdrop-blur-md transition-all">
      {/* Left section: Sidebar toggle & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="rounded-lg p-1.5 text-[#64748B] hover:bg-[#F1F3F5] hover:text-[#0F172A] transition-colors cursor-pointer"
          aria-label="Toggle Sidebar"
          title="Toggle Sidebar (Cmd+B)"
        >
          <Menu className="w-4 h-4" />
        </button>

        <div className="h-4 w-px bg-[#E2E8F0]" />

        <Breadcrumbs />
      </div>

      {/* Center section: Global Quick Search */}
      <div className="hidden lg:flex items-center max-w-xs w-full mx-4">
        <button
          type="button"
          onClick={() => setIsCommandPaletteOpen(true)}
          className="relative w-full text-left bg-[#F8F9FA] hover:bg-white border border-[#E2E8F0] hover:border-[#2563EB] rounded-lg pl-8 pr-12 py-1.5 text-xs text-[#64748B] transition-all cursor-pointer shadow-2xs group"
        >
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#64748B] group-hover:text-[#2563EB] transition-colors" />
          <span className="truncate block">Search assets or press ⌘K...</span>
          <kbd className="absolute right-2 top-1/2 -translate-y-1/2 rounded border border-[#E2E8F0] bg-white px-1 text-[9px] font-mono text-[#64748B] group-hover:text-[#2563EB]">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right section: Notifications & Profile */}
      <div className="flex items-center gap-2">
        {/* Notification Bell */}
        <button
          onClick={() => setIsNotificationDrawerOpen(true)}
          className="relative rounded-lg p-2 text-[#64748B] hover:bg-[#F1F3F5] hover:text-[#0F172A] transition-colors cursor-pointer"
          title="Open Notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#EF4444] px-1 text-[10px] font-bold text-white shadow-xs animate-pulse">
              {unreadCount}
            </span>
          )}
        </button>

        <div className="h-4 w-px bg-[#E2E8F0]" />

        {/* User Profile dropdown button */}
        <button
          onClick={() => setIsRoleSwitcherOpen(true)}
          className="flex items-center gap-2.5 rounded-lg p-1.5 hover:bg-[#F1F3F5] transition-colors cursor-pointer text-left group"
          title="Click to view detailed RBAC profile & capabilities"
        >
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-7 h-7 rounded-full object-cover border border-[#E2E8F0] shrink-0 group-hover:ring-2 group-hover:ring-[#2563EB]/30 transition-all"
          />
          <div className="hidden md:block">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-[#0F172A] group-hover:text-[#2563EB] transition-colors">
                {currentUser.name}
              </span>
              <RoleBadge role={currentUser.role} size="xs" />
            </div>
            <p className="text-[10px] text-[#64748B] font-mono leading-tight">{currentUser.badgeNumber}</p>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-[#64748B] group-hover:text-[#0F172A] transition-colors hidden sm:block" />
        </button>

        <button
          onClick={() => setCurrentRoute('auth')}
          className="rounded-lg p-1.5 text-[#64748B] hover:bg-[#FEF2F2] hover:text-[#B91C1C] transition-colors cursor-pointer"
          title="Sign Out / Switch Account (Login Screen)"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  )
}
