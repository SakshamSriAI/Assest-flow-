import React from 'react'
import { Modal } from '../ui/Modal'
import { RoleBadge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { useApp } from '../../context/AppContext'
import { UserRole, User } from '../../types'
import { Check, Info, LogOut } from 'lucide-react'

interface RoleSwitcherModalProps {
  isOpen: boolean
  onClose: () => void
}

const ROLE_DESCRIPTIONS: Record<
  UserRole,
  {
    tagline: string
    capabilities: string[]
    restrictions: string[]
  }
> = {
  admin: {
    tagline: 'Full operational & governance authority across all enterprise modules.',
    capabilities: [
      'Promote employees to Department Head / Asset Manager',
      'Manage departments, hierarchies, and custom asset categories',
      'Create and close physical audit cycles',
      'Override and re-allocate asset conflicts directly',
    ],
    restrictions: ['None (Superuser privilege)'],
  },
  asset_manager: {
    tagline: 'Primary asset custodian managing inventory lifecycle, health & assignments.',
    capabilities: [
      'Register new physical assets and generate QR tags',
      'Approve and manage cross-department transfer requests',
      'Assign technicians to maintenance tickets and track progress',
      'Execute department audit checklists and flag discrepancies',
    ],
    restrictions: ['Cannot alter organization department hierarchy or promote roles'],
  },
  department_head: {
    tagline: 'Team leader responsible for department assets, approvals and bookings.',
    capabilities: [
      'Approve or decline asset transfer requests involving department staff',
      'View department-scoped asset allocation history and status',
      'Book high-value shared resources (labs, vehicles, conference rooms)',
      'Participate in department physical audit verification',
    ],
    restrictions: [
      'Cannot elevate user roles or edit global asset categories',
      'Cannot assign external maintenance contractors directly',
    ],
  },
  employee: {
    tagline: 'Standard team member with self-service asset & resource capabilities.',
    capabilities: [
      'View currently allocated physical hardware and expected return dates',
      'Initiate transfer requests when borrowing assets from peers',
      'Reserve shared resources (meeting rooms, project kits, vehicles)',
      'Submit maintenance tickets with issue descriptions and photos',
    ],
    restrictions: [
      'No access to Organization Setup or Role Elevation',
      'Cannot approve transfers or close audit cycles',
    ],
  },
}

export const RoleSwitcherModal: React.FC<RoleSwitcherModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, setCurrentUser, users, setCurrentRoute } = useApp()

  // Group by unique 4 roles for the main cards
  const primaryRoleUsers: User[] = [
    users.find((u) => u.role === 'admin') || users[0],
    users.find((u) => u.role === 'asset_manager') || users[1],
    users.find((u) => u.role === 'department_head') || users[2],
    users.find((u) => u.role === 'employee') || users[3],
  ]

  const handleSelectUser = (user: User) => {
    setCurrentUser(user)
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Role & Persona Switcher (RBAC Mock)"
      description="Switch personas instantaneously to test role-based UI restrictions, workflows, and permissions."
      maxWidth="2xl"
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {primaryRoleUsers.map((user) => {
            const isSelected = user.role === currentUser.role
            const roleInfo = ROLE_DESCRIPTIONS[user.role]

            return (
              <div
                key={user.id}
                onClick={() => handleSelectUser(user)}
                className={`relative p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-[#2563EB] bg-[#EFF6FF] ring-2 ring-[#2563EB]/20 shadow-xs'
                    : 'border-[#E2E8F0] bg-white hover:border-slate-300 hover:bg-[#F8F9FA]'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-3">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-10 h-10 rounded-full object-cover border border-[#E2E8F0]"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-[#0F172A]">{user.name}</h4>
                          {isSelected && (
                            <span className="flex items-center gap-1 text-[10px] font-semibold text-[#2563EB] bg-white px-2 py-0.5 rounded-full border border-[#BFDBFE]">
                              <Check className="w-2.5 h-2.5" /> Active
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-[#64748B]">{user.title}</p>
                      </div>
                    </div>
                    <RoleBadge role={user.role} size="xs" />
                  </div>

                  <p className="text-xs text-[#64748B] mb-2 leading-relaxed">
                    {roleInfo.tagline}
                  </p>

                  <div className="space-y-1 pt-2 border-t border-[#E2E8F0]">
                    <p className="text-[10px] font-bold text-[#0F172A] uppercase tracking-wider">
                      Key Capabilities:
                    </p>
                    <ul className="text-[11px] text-[#64748B] space-y-0.5">
                      {roleInfo.capabilities.slice(0, 2).map((cap, i) => (
                        <li key={i} className="flex items-center gap-1.5">
                          <span className="text-emerald-500 text-xs">✓</span>
                          <span>{cap}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-3 pt-2 text-[10px] text-[#64748B] flex items-center justify-between border-t border-slate-100">
                  <span>Badge: <code className="text-[#0F172A] font-mono">{user.badgeNumber}</code></span>
                  <span>{user.department}</span>
                </div>
              </div>
            )
          })}
        </div>

        {/* All Active Users Quick Picker */}
        <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
              All Active Organization Users ({users.length})
            </span>
            <span className="text-[11px] text-slate-500">Click any user to impersonate</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {users.map((u) => {
              const isCurrent = currentUser.id === u.id
              return (
                <button
                  key={u.id}
                  onClick={() => handleSelectUser(u)}
                  className={`flex items-center gap-2 p-1.5 rounded-lg border text-left text-xs transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-[#2563EB] text-white border-[#2563EB] shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-[#BFDBFE]'
                  }`}
                >
                  <img src={u.avatar} alt={u.name} className="w-6 h-6 rounded-full object-cover shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className={`font-semibold truncate text-[11px] ${isCurrent ? 'text-white' : 'text-slate-900'}`}>
                      {u.name}
                    </p>
                    <p className={`text-[10px] truncate ${isCurrent ? 'text-blue-100' : 'text-slate-400'}`}>
                      {u.role.replace('_', ' ')}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center gap-3 text-xs text-slate-600">
          <Info className="w-4 h-4 text-[#2563EB] shrink-0" />
          <span>
            <strong>Role Elevation Notice:</strong> Administrators can elevate Employees to Department Head or Asset Manager under{' '}
            <code className="text-[#2563EB] bg-[#EFF6FF] px-1 py-0.5 rounded font-mono">Org Setup &rarr; Employee Directory</code>.
          </span>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-[#E2E8F0]">
          <button
            type="button"
            onClick={() => {
              setCurrentRoute('auth')
              onClose()
            }}
            className="flex items-center gap-1.5 text-xs text-[#2563EB] hover:text-[#1D4ED8] hover:underline font-medium cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            Switch to Login Screen
          </button>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  )
}
