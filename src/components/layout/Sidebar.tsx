import React from 'react'
import {
  LayoutDashboard,
  Boxes,
  ArrowRightLeft,
  CalendarCheck2,
  Wrench,
  ClipboardCheck,
  BarChart3,
  Settings2,
  History,
  Lock,
  ChevronLeft,
  ChevronRight,
  BoxesIcon,
  LogOut
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { AppRoute, UserRole } from '../../types'

interface SidebarGroup {
  heading: string
  items: {
    id: AppRoute
    label: string
    icon: React.ComponentType<{ className?: string }>
    badge?: string
    badgeColor?: 'default' | 'primary' | 'warning' | 'danger'
    adminOnly?: boolean
    allowedRoles: UserRole[]
  }[]
}

const NAV_GROUPS: SidebarGroup[] = [
  {
    heading: 'Core Operations',
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: LayoutDashboard,
        allowedRoles: ['admin', 'asset_manager', 'department_head', 'employee'],
      },
      {
        id: 'assets',
        label: 'Asset Directory',
        icon: Boxes,
        allowedRoles: ['admin', 'asset_manager', 'department_head', 'employee'],
      },
      {
        id: 'allocations',
        label: 'Allocations & Transfers',
        icon: ArrowRightLeft,
        badge: 'Transfers',
        badgeColor: 'warning',
        allowedRoles: ['admin', 'asset_manager', 'department_head', 'employee'],
      },
      {
        id: 'bookings',
        label: 'Resource Booking',
        icon: CalendarCheck2,
        allowedRoles: ['admin', 'asset_manager', 'department_head', 'employee'],
      },
    ],
  },
  {
    heading: 'Maintenance & Audits',
    items: [
      {
        id: 'maintenance',
        label: 'Maintenance Hub',
        icon: Wrench,
        badge: 'Kanban',
        badgeColor: 'primary',
        allowedRoles: ['admin', 'asset_manager', 'department_head', 'employee'],
      },
      {
        id: 'audits',
        label: 'Physical Audits',
        icon: ClipboardCheck,
        allowedRoles: ['admin', 'asset_manager', 'department_head'],
      },
    ],
  },
  {
    heading: 'Analytics & Governance',
    items: [
      {
        id: 'reports',
        label: 'Reports & Analytics',
        icon: BarChart3,
        allowedRoles: ['admin', 'asset_manager', 'department_head'],
      },
      {
        id: 'activity',
        label: 'Activity Trail',
        icon: History,
        allowedRoles: ['admin', 'asset_manager', 'department_head', 'employee'],
      },
      {
        id: 'org-setup',
        label: 'Organization Setup',
        icon: Settings2,
        adminOnly: true,
        allowedRoles: ['admin'],
      },
    ],
  },
]

export const Sidebar: React.FC = () => {
  const {
    currentRoute,
    setCurrentRoute,
    sidebarCollapsed,
    setSidebarCollapsed,
    currentUser,
    canAccessRoute,
    setIsRoleSwitcherOpen,
  } = useApp()

  const handleNavClick = (item: SidebarGroup['items'][0]) => {
    if (canAccessRoute(item.id)) {
      setCurrentRoute(item.id)
    } else {
      // If unauthorized, prompt role switcher modal with hint
      setIsRoleSwitcherOpen(true)
    }
  }

  return (
    <aside
      className={`relative flex flex-col border-r border-[#E2E8F0] bg-white transition-all duration-200 ease-in-out select-none z-20 ${
        sidebarCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="flex h-14 items-center justify-between border-b border-[#E2E8F0] px-4">
        <div
          onClick={() => setCurrentRoute('dashboard')}
          className="flex items-center gap-2.5 cursor-pointer overflow-hidden"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-[#0F2F57] to-[#2563EB] text-white shadow-xs ring-2 ring-[#2563EB]/20">
            <BoxesIcon className="h-5 w-5" />
          </div>
          {!sidebarCollapsed && (
            <div className="flex flex-col">
              <span className="font-extrabold text-sm tracking-tight text-[#0F172A] leading-tight">
                Asset<span className="text-[#2563EB]">Flow</span>
              </span>
              <span className="text-[10px] font-semibold text-[#64748B] tracking-wider uppercase">
                Enterprise ERP
              </span>
            </div>
          )}
        </div>

        {/* Desktop collapse toggle */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="hidden md:flex h-6 w-6 items-center justify-center rounded-md border border-[#E2E8F0] text-[#64748B] hover:bg-[#F1F3F5] hover:text-[#0F172A] cursor-pointer"
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
        {NAV_GROUPS.map((group, groupIdx) => (
          <div key={groupIdx} className="space-y-0.5">
            {!sidebarCollapsed && (
              <h4 className="px-2.5 pb-1 text-[10px] font-bold tracking-wider text-[#64748B] uppercase">
                {group.heading}
              </h4>
            )}
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = currentRoute === item.id
                const isAllowed = canAccessRoute(item.id)
                const IconComponent = item.icon

                return (
                  <li key={item.id}>
                    <button
                      onClick={() => handleNavClick(item)}
                      title={
                        !isAllowed
                          ? `${item.label} (Requires Admin Elevation)`
                          : item.label
                      }
                      className={`group relative flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-xs font-medium transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#EFF6FF] text-[#2563EB] font-semibold shadow-xs'
                          : isAllowed
                          ? 'text-[#64748B] hover:bg-[#F1F3F5] hover:text-[#0F172A]'
                          : 'text-slate-300 hover:text-slate-400 hover:bg-slate-50 cursor-not-allowed opacity-60'
                      } ${sidebarCollapsed ? 'justify-center px-0' : ''}`}
                    >
                      <IconComponent
                        className={`h-4 w-4 shrink-0 transition-colors ${
                          isActive
                            ? 'text-[#2563EB]'
                            : isAllowed
                            ? 'text-[#64748B] group-hover:text-[#0F172A]'
                            : 'text-slate-300'
                        }`}
                      />

                      {!sidebarCollapsed && (
                        <div className="flex flex-1 items-center justify-between overflow-hidden">
                          <span className="truncate">{item.label}</span>

                          {/* Indicators & Badges */}
                          <div className="flex items-center gap-1.5 ml-1">
                            {!isAllowed && (
                              <span className="flex items-center text-[10px] text-[#64748B] bg-[#F1F5F9] px-1.5 py-0.2 rounded font-mono">
                                <Lock className="w-2.5 h-2.5 mr-0.5" />
                                Locked
                              </span>
                            )}
                            {isAllowed && item.badge && (
                              <span
                                className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold uppercase tracking-wider ${
                                  item.badgeColor === 'warning'
                                    ? 'bg-[#FFFBEB] text-[#B45309]'
                                    : 'bg-[#EFF6FF] text-[#2563EB]'
                                }`}
                              >
                                {item.badge}
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Tooltip on collapsed mode */}
                      {sidebarCollapsed && (
                        <div className="absolute left-full ml-2 hidden rounded-md bg-[#0F172A] px-2 py-1 text-xs text-white shadow-md group-hover:block z-50 whitespace-nowrap">
                          {item.label} {!isAllowed && '(Locked)'}
                        </div>
                      )}
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </div>

      {/* Role Context Bar in Sidebar */}
      {!sidebarCollapsed ? (
        <div className="p-3 border-t border-[#E2E8F0] bg-[#F8F9FA]">
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="text-[#64748B] font-medium">Logged Persona</span>
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-[#2563EB] font-semibold">{currentUser.role}</span>
              <button
                onClick={() => setCurrentRoute('auth')}
                className="text-[#64748B] hover:text-[#B91C1C] transition-colors cursor-pointer p-0.5 rounded hover:bg-[#FEF2F2]"
                title="Sign out / Login Screen"
              >
                <LogOut className="w-3 h-3" />
              </button>
            </div>
          </div>
          <div className="w-full bg-[#E2E8F0] rounded-full h-1 overflow-hidden">
            <div
              className={`h-full ${
                currentUser.role === 'admin'
                  ? 'w-full bg-[#0F2F57]'
                  : currentUser.role === 'asset_manager'
                  ? 'w-3/4 bg-[#2563EB]'
                  : currentUser.role === 'department_head'
                  ? 'w-2/3 bg-[#3B82F6]'
                  : 'w-1/3 bg-[#10B981]'
              }`}
            />
          </div>
          <div className="flex items-center justify-between mt-1 text-[10px] text-[#64748B]">
            <p className="truncate max-w-[130px]">{currentUser.department}</p>
            <button
              onClick={() => setCurrentRoute('auth')}
              className="text-[#2563EB] hover:underline cursor-pointer shrink-0 font-medium"
            >
              Sign out
            </button>
          </div>
        </div>
      ) : (
        <div className="p-2 border-t border-[#E2E8F0] flex justify-center">
          <button
            onClick={() => setCurrentRoute('auth')}
            className="p-2 rounded-lg text-[#64748B] hover:text-[#B91C1C] hover:bg-[#FEF2F2] transition-colors cursor-pointer"
            title="Sign Out / Switch Account"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      )}
    </aside>
  )
}
