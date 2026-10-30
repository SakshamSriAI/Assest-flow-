import React, { useState } from 'react'
import {
  FolderTree,
  Tags,
  Users,
  Plus,
  ShieldCheck,
  Building2,
  Lock,
  ArrowUpRight,
  CheckCircle2,
  AlertTriangle,
  History,
  Calendar,
  Layers,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Pencil,
  Search,
  Filter,
  Check,
  ShieldAlert
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { Card, CardHeader, CardContent } from '../ui/Card'
import { Badge, RoleBadge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Modal } from '../ui/Modal'
import { Tabs } from '../ui/Tabs'
import { Department, AssetCategory, User, UserRole } from '../../types'

export const OrgSetupScreen: React.FC = () => {
  const {
    currentUser,
    switchRole,
    setCurrentRoute,
    departments,
    addDepartment,
    updateDepartment,
    toggleDepartmentStatus,
    categories,
    addCategory,
    updateCategory,
    users,
    elevationLogs,
    elevateEmployeeRole,
  } = useApp()

  const [activeTab, setActiveTab] = useState<'departments' | 'categories' | 'elevation'>('departments')

  // --- Department Modal State ---
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false)
  const [editingDept, setEditingDept] = useState<Department | null>(null)
  const [deptName, setDeptName] = useState('')
  const [deptCode, setDeptCode] = useState('')
  const [deptParentId, setDeptParentId] = useState<string>('')
  const [deptHeadId, setDeptHeadId] = useState('')
  const [deptBudgetCode, setDeptBudgetCode] = useState('CC-')

  // --- Category Modal State ---
  const [isCatModalOpen, setIsCatModalOpen] = useState(false)
  const [editingCat, setEditingCat] = useState<AssetCategory | null>(null)
  const [catName, setCatName] = useState('')
  const [catCode, setCatCode] = useState('')
  const [catDesc, setCatDesc] = useState('')
  const [catWarranty, setCatWarranty] = useState(24)
  const [catDepreciation, setCatDepreciation] = useState(4)
  const [catIsBookable, setCatIsBookable] = useState(false)
  const [catRequireSerial, setCatRequireSerial] = useState(true)
  const [catMaintInterval, setCatMaintInterval] = useState(90)

  // --- Elevation Modal State ---
  const [isElevateModalOpen, setIsElevateModalOpen] = useState(false)
  const [selectedUserForElevation, setSelectedUserForElevation] = useState<User | null>(null)
  const [targetRole, setTargetRole] = useState<UserRole>('department_head')
  const [elevationReason, setElevationReason] = useState('')
  const [elevationFilter, setElevationFilter] = useState('')
  const [elevationDeptFilter, setElevationDeptFilter] = useState('ALL')

  // RBAC GUARD: Only Admin has access to Screen 3
  if (currentUser.role !== 'admin') {
    return (
      <div className="space-y-6 max-w-xl mx-auto py-12">
        <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm text-center space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto ring-8 ring-rose-50">
            <Lock className="w-7 h-7" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-lg font-bold text-slate-900">Administrative Privilege Required</h2>
            <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
              Organization Setup & Role Elevation is restricted strictly to <strong>Admin</strong>.
              You are currently signed in as <RoleBadge role={currentUser.role} size="xs" />.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-left text-xs text-slate-600 space-y-1">
            <p className="font-semibold text-slate-800">Protected Capabilities:</p>
            <p>• Modify enterprise department topologies and assign Department Heads</p>
            <p>• Define custom asset categories and warranty lifecycles</p>
            <p>• Elevate Employees to Department Head or Asset Manager</p>
          </div>

          <div className="flex items-center justify-center gap-2 pt-2">
            <Button
              variant="primary"
              size="md"
              onClick={() => switchRole('admin')}
              leftIcon={<ShieldCheck className="w-4 h-4" />}
            >
              Impersonate Eleanor Vance (Admin)
            </Button>
            <Button
              variant="secondary"
              size="md"
              onClick={() => setCurrentRoute('dashboard')}
            >
              Return to Dashboard
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // --- Handlers for Department Tab ---
  const openNewDeptModal = () => {
    setEditingDept(null)
    setDeptName('')
    setDeptCode('')
    setDeptParentId('')
    setDeptHeadId(users[0]?.id || '')
    setDeptBudgetCode('CC-' + Math.floor(1000 + Math.random() * 9000))
    setIsDeptModalOpen(true)
  }

  const openEditDeptModal = (dept: Department) => {
    setEditingDept(dept)
    setDeptName(dept.name)
    setDeptCode(dept.code)
    setDeptParentId(dept.parentId || '')
    setDeptHeadId(dept.headId)
    setDeptBudgetCode(dept.budgetCode || 'CC-1000')
    setIsDeptModalOpen(true)
  }

  const handleSaveDept = (e: React.FormEvent) => {
    e.preventDefault()
    if (!deptName || !deptCode) return

    const headUser = users.find((u) => u.id === deptHeadId) || users[0]

    if (editingDept) {
      updateDepartment(editingDept.id, {
        name: deptName,
        code: deptCode.toUpperCase(),
        parentId: deptParentId || undefined,
        headId: headUser.id,
        headName: headUser.name,
        budgetCode: deptBudgetCode,
      })
    } else {
      addDepartment({
        name: deptName,
        code: deptCode.toUpperCase(),
        parentId: deptParentId || undefined,
        headId: headUser.id,
        headName: headUser.name,
        isActive: true,
        budgetCode: deptBudgetCode,
      })
    }
    setIsDeptModalOpen(false)
  }

  // --- Handlers for Category Tab ---
  const openNewCatModal = () => {
    setEditingCat(null)
    setCatName('')
    setCatCode('CAT-')
    setCatDesc('')
    setCatWarranty(36)
    setCatDepreciation(4)
    setCatIsBookable(false)
    setCatRequireSerial(true)
    setCatMaintInterval(90)
    setIsCatModalOpen(true)
  }

  const openEditCatModal = (cat: AssetCategory) => {
    setEditingCat(cat)
    setCatName(cat.name)
    setCatCode(cat.code)
    setCatDesc(cat.description)
    setCatWarranty(cat.defaultWarrantyMonths)
    setCatDepreciation(cat.depreciationLifespanYears)
    setCatIsBookable(cat.isBookable)
    setCatRequireSerial(cat.requiresSerialNumber)
    setCatMaintInterval(cat.maintenanceIntervalDays)
    setIsCatModalOpen(true)
  }

  const handleSaveCat = (e: React.FormEvent) => {
    e.preventDefault()
    if (!catName || !catCode) return

    if (editingCat) {
      updateCategory(editingCat.id, {
        name: catName,
        code: catCode.toUpperCase(),
        description: catDesc,
        defaultWarrantyMonths: Number(catWarranty),
        depreciationLifespanYears: Number(catDepreciation),
        isBookable: catIsBookable,
        requiresSerialNumber: catRequireSerial,
        maintenanceIntervalDays: Number(catMaintInterval),
      })
    } else {
      addCategory({
        name: catName,
        code: catCode.toUpperCase(),
        description: catDesc,
        defaultWarrantyMonths: Number(catWarranty),
        depreciationLifespanYears: Number(catDepreciation),
        isBookable: catIsBookable,
        requiresSerialNumber: catRequireSerial,
        maintenanceIntervalDays: Number(catMaintInterval),
      })
    }
    setIsCatModalOpen(false)
  }

  // --- Handlers for Elevation Tab ---
  const openElevationModal = (user: User) => {
    setSelectedUserForElevation(user)
    // Suggest next sensible role
    if (user.role === 'employee') {
      setTargetRole('department_head')
    } else if (user.role === 'department_head') {
      setTargetRole('asset_manager')
    } else {
      setTargetRole('employee')
    }
    setElevationReason('')
    setIsElevateModalOpen(true)
  }

  const handleConfirmElevation = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUserForElevation) return
    elevateEmployeeRole(selectedUserForElevation.id, targetRole, elevationReason)
    setIsElevateModalOpen(false)
  }

  const filteredUsers = users.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(elevationFilter.toLowerCase()) ||
      u.email.toLowerCase().includes(elevationFilter.toLowerCase()) ||
      u.badgeNumber.toLowerCase().includes(elevationFilter.toLowerCase())
    const matchDept = elevationDeptFilter === 'ALL' || u.departmentId === elevationDeptFilter
    return matchSearch && matchDept
  })

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[#0F172A] tracking-tight font-heading">Organization Setup</h1>
            <Badge variant="purple" size="xs">Admin Only</Badge>
          </div>
        </div>

        {/* Global Admin Badge & Action */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#0F2F57]/10 border border-[#0F2F57]/20 text-xs text-[#0F2F57]">
            <ShieldCheck className="w-4 h-4 text-[#0F2F57]" />
            <span>Admin Protocol: <strong>Eleanor Vance</strong></span>
          </div>
        </div>
      </div>

      {/* 3-Tab Navigator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-3">
        <Tabs
          size="md"
          variant="pill"
          tabs={[
            {
              id: 'departments',
              label: 'Tab A: Department Management',
              count: departments.length,
              icon: <FolderTree className="w-4 h-4 text-[#2563EB]" />,
            },
            {
              id: 'categories',
              label: 'Tab B: Category Management',
              count: categories.length,
              icon: <Tags className="w-4 h-4 text-[#2563EB]" />,
            },
            {
              id: 'elevation',
              label: 'Tab C: Employee Directory & Role Elevation',
              count: users.length,
              icon: <Users className="w-4 h-4 text-[#047857]" />,
            },
          ]}
          activeTab={activeTab}
          onChange={(t) => setActiveTab(t as any)}
        />

        {/* Dynamic Action Button based on active tab */}
        {activeTab === 'departments' && (
          <Button
            variant="primary"
            size="sm"
            onClick={openNewDeptModal}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add Department
          </Button>
        )}
        {activeTab === 'categories' && (
          <Button
            variant="primary"
            size="sm"
            onClick={openNewCatModal}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add Category
          </Button>
        )}
      </div>

      {/* TAB A: DEPARTMENT MANAGEMENT */}
      {activeTab === 'departments' && (
        <div className="space-y-4">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-white rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Departments</span>
              <span className="text-lg font-extrabold text-slate-900 mt-0.5 block">{departments.length}</span>
              <span className="text-[11px] text-emerald-600">
                {departments.filter((d) => d.isActive).length} active
              </span>
            </div>
            <div className="p-3 bg-white rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Members</span>
              <span className="text-lg font-extrabold text-slate-900 mt-0.5 block">
                {departments.reduce((acc, d) => acc + d.memberCount, 0)}
              </span>
              <span className="text-[11px] text-slate-500">Across organization</span>
            </div>
            <div className="p-3 bg-white rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Allocated Assets</span>
              <span className="text-lg font-extrabold text-slate-900 mt-0.5 block">
                {departments.reduce((acc, d) => acc + d.allocatedAssetCount, 0)}
              </span>
              <span className="text-[11px] text-indigo-600">Under department custody</span>
            </div>
            <div className="p-3 bg-white rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Hierarchy Levels</span>
              <span className="text-lg font-extrabold text-slate-900 mt-0.5 block">2 Tiers</span>
              <span className="text-[11px] text-slate-500">Executive &rarr; Divisions</span>
            </div>
          </div>

          {/* Departments Table */}
          <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-semibold text-slate-600">
                    <th className="py-3 px-4">Department & Code</th>
                    <th className="py-3 px-4">Hierarchy Position</th>
                    <th className="py-3 px-4">Assigned Department Head</th>
                    <th className="py-3 px-4 text-center">Members</th>
                    <th className="py-3 px-4 text-center">Assets</th>
                    <th className="py-3 px-4">Lifecycle Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {departments.map((dept) => {
                    const parent = departments.find((d) => d.id === dept.parentId)
                    const isSubDept = Boolean(dept.parentId)

                    return (
                      <tr key={dept.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-[11px] shrink-0">
                              {dept.code}
                            </div>
                            <div>
                              <span className="font-semibold text-slate-900 block">{dept.name}</span>
                              <span className="text-[10px] text-slate-400 font-mono">Budget: {dept.budgetCode}</span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          {isSubDept ? (
                            <span className="inline-flex items-center gap-1 text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded font-medium">
                              ↳ Under {parent?.name || 'Parent'}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded font-semibold">
                              ★ Top-Level Division
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-slate-800">{dept.headName}</span>
                            <RoleBadge role="department_head" size="xs" />
                          </div>
                        </td>

                        <td className="py-3 px-4 text-center font-semibold text-slate-700">
                          {dept.memberCount}
                        </td>

                        <td className="py-3 px-4 text-center font-semibold text-slate-700">
                          {dept.allocatedAssetCount}
                        </td>

                        <td className="py-3 px-4">
                          <button
                            onClick={() => toggleDepartmentStatus(dept.id)}
                            className="flex items-center gap-1.5 cursor-pointer text-left group"
                            title="Click to toggle department active status"
                          >
                            {dept.isActive ? (
                              <Badge variant="success" size="xs" dot>Active</Badge>
                            ) : (
                              <Badge variant="danger" size="xs" dot>Inactive</Badge>
                            )}
                            <span className="text-[10px] text-slate-400 group-hover:text-slate-600 underline">
                              Toggle
                            </span>
                          </button>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <Button
                            variant="ghost"
                            size="xs"
                            onClick={() => openEditDeptModal(dept)}
                            leftIcon={<Pencil className="w-3.5 h-3.5" />}
                          >
                            Edit
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB B: ASSET CATEGORY MANAGEMENT */}
      {activeTab === 'categories' && (
        <div className="space-y-4">
          <div className="p-3 bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl text-xs text-[#1D4ED8] flex items-center justify-between">
            <span>
              <strong>ERP Custom Fields:</strong> Categories specify custom operational flags (Default Warranty, Expected Lifespan, Shared Bookable Eligibility, and Routine Maintenance Intervals).
            </span>
            <Badge variant="purple" size="xs">Rule Enforcement</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat) => (
              <Card key={cat.id} className="relative hover:border-indigo-300 transition-colors flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2 pb-2 border-b border-slate-100">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                        {cat.code}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 mt-1">{cat.name}</h4>
                    </div>
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => openEditCatModal(cat)}
                      leftIcon={<Pencil className="w-3 h-3" />}
                    >
                      Edit
                    </Button>
                  </div>

                  <p className="text-xs text-slate-600 mb-3 line-clamp-2 leading-relaxed">
                    {cat.description}
                  </p>

                  {/* Custom Fields Specification Table */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-100 text-[11px]">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Default Warranty:</span>
                      <span className="font-semibold text-slate-800">{cat.defaultWarrantyMonths} Months</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Depreciation Lifespan:</span>
                      <span className="font-semibold text-slate-800">{cat.depreciationLifespanYears} Years</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Routine Maintenance:</span>
                      <span className="font-semibold text-slate-800">Every {cat.maintenanceIntervalDays} Days</span>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-slate-500">Shared Bookable Resource:</span>
                      {cat.isBookable ? (
                        <Badge variant="primary" size="xs" dot>Yes (Bookable)</Badge>
                      ) : (
                        <Badge variant="neutral" size="xs">Personal Assignment</Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Serial Tag Requirement:</span>
                      {cat.requiresSerialNumber ? (
                        <Badge variant="success" size="xs">Required</Badge>
                      ) : (
                        <Badge variant="neutral" size="xs">Optional / Bulk</Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Tracked Inventory Units:</span>
                  <span className="font-bold text-slate-800">{cat.assetCount} assets</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TAB C: EMPLOYEE DIRECTORY & ROLE ELEVATION */}
      {activeTab === 'elevation' && (
        <div className="space-y-6">
          {/* Security Alert Header */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-[#ECFDF5] via-[#EFF6FF] to-white border border-[#A7F3D0] text-xs text-[#065F46] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <ShieldAlert className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold block text-emerald-900 text-sm">
                  Exclusive Role Elevation Portal
                </strong>
                <span className="text-emerald-800 text-[11px]">
                  This is the exclusive location where Administrators promote Employees to <strong>Department Head</strong> or <strong>Asset Manager</strong>. All elevations require mandatory justification notes and create an immutable audit record.
                </span>
              </div>
            </div>
            <Badge variant="success" size="sm" dot>Authorized Superuser Session</Badge>
          </div>

          {/* Directory Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search employee by name, email, badge..."
                value={elevationFilter}
                onChange={(e) => setElevationFilter(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-slate-500 whitespace-nowrap">Filter Dept:</span>
              <select
                value={elevationDeptFilter}
                onChange={(e) => setElevationDeptFilter(e.target.value)}
                className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
              >
                <option value="ALL">All Departments ({departments.length})</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Employee Directory Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-semibold text-slate-600">
                    <th className="py-3 px-4">Employee</th>
                    <th className="py-3 px-4">Badge #</th>
                    <th className="py-3 px-4">Department & Title</th>
                    <th className="py-3 px-4">Current Role Tier</th>
                    <th className="py-3 px-4">Tenure / Onboarded</th>
                    <th className="py-3 px-4 text-right">Elevation Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((user) => {
                    const isSelf = user.id === currentUser.id
                    return (
                      <tr key={user.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={user.avatar}
                              alt={user.name}
                              className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
                            />
                            <div>
                              <span className="font-semibold text-slate-900 block">{user.name}</span>
                              <span className="text-[11px] text-slate-400">{user.email}</span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4 font-mono font-semibold text-slate-700">
                          {user.badgeNumber}
                        </td>

                        <td className="py-3 px-4">
                          <span className="text-slate-800 font-medium block">{user.department}</span>
                          <span className="text-[11px] text-slate-400">{user.title}</span>
                        </td>

                        <td className="py-3 px-4">
                          <RoleBadge role={user.role} size="sm" />
                        </td>

                        <td className="py-3 px-4 text-slate-500 text-[11px]">
                          {user.joinDate || '2023-01-01'}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <Button
                            variant={user.role === 'employee' ? 'primary' : 'subtle'}
                            size="xs"
                            onClick={() => openElevationModal(user)}
                            leftIcon={<ArrowUpRight className="w-3.5 h-3.5" />}
                          >
                            {user.role === 'employee' ? 'Promote' : 'Change Tier'}
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Immutable Elevation Audit Log Feed */}
          <Card>
            <CardHeader
              title="Role Elevation Audit Trail (Immutable Log)"
              badge={<Badge variant="neutral" size="xs">{elevationLogs.length} Records</Badge>}
            />
            <CardContent>
              <div className="space-y-3">
                {elevationLogs.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">No role elevations recorded yet.</p>
                ) : (
                  elevationLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-slate-900">{log.employeeName}</span>
                          <span className="text-slate-400">&bull;</span>
                          <span className="text-slate-500">Elevated from</span>
                          <RoleBadge role={log.previousRole} size="xs" />
                          <span className="text-slate-500">&rarr;</span>
                          <RoleBadge role={log.newRole} size="xs" />
                        </div>
                        <p className="text-[11px] text-slate-600 italic">
                          &quot;{log.reason}&quot;
                        </p>
                      </div>

                      <div className="text-right shrink-0 space-y-0.5">
                        <span className="text-[10px] font-mono text-slate-400 block">{log.timestamp}</span>
                        <span className="text-[10px] text-slate-500 block">By: {log.elevatedBy}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* MODAL 1: ADD / EDIT DEPARTMENT */}
      <Modal
        isOpen={isDeptModalOpen}
        onClose={() => setIsDeptModalOpen(false)}
        title={editingDept ? `Edit Department: ${editingDept.code}` : 'Create New Department'}
        description="Establish organizational hierarchy and designate a Department Head."
        maxWidth="lg"
      >
        <form onSubmit={handleSaveDept} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <Input
                label="Department Name"
                placeholder="e.g. Artificial Intelligence & Robotics"
                value={deptName}
                onChange={(e) => setDeptName(e.target.value)}
                required
              />
            </div>
            <div>
              <Input
                label="Dept Code"
                placeholder="e.g. AIR"
                value={deptCode}
                onChange={(e) => setDeptCode(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-700">Parent Department (Hierarchy)</label>
              <select
                value={deptParentId}
                onChange={(e) => setDeptParentId(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
              >
                <option value="">None (Top-Level Division)</option>
                {departments
                  .filter((d) => d.id !== editingDept?.id)
                  .map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.code})
                    </option>
                  ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-700">Assign Department Head</label>
              <select
                value={deptHeadId}
                onChange={(e) => setDeptHeadId(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Input
            label="Internal Cost Center / Budget Code"
            placeholder="CC-XXXX"
            value={deptBudgetCode}
            onChange={(e) => setDeptBudgetCode(e.target.value)}
            required
          />

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={() => setIsDeptModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              {editingDept ? 'Update Department' : 'Establish Department'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: ADD / EDIT ASSET CATEGORY */}
      <Modal
        isOpen={isCatModalOpen}
        onClose={() => setIsCatModalOpen(false)}
        title={editingCat ? `Edit Category: ${editingCat.code}` : 'Define Asset Category'}
        description="Configure ERP lifecycle rules, warranty, depreciation, and bookable toggles."
        maxWidth="lg"
      >
        <form onSubmit={handleSaveCat} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <Input
                label="Category Name"
                placeholder="e.g. Drone & Unmanned Aerial Systems"
                value={catName}
                onChange={(e) => setCatName(e.target.value)}
                required
              />
            </div>
            <div>
              <Input
                label="Category Code"
                placeholder="e.g. CAT-UAS"
                value={catCode}
                onChange={(e) => setCatCode(e.target.value)}
                required
              />
            </div>
          </div>

          <Input
            label="Description & Scope"
            placeholder="Specify equipment classification, target hardware, and scope"
            value={catDesc}
            onChange={(e) => setCatDesc(e.target.value)}
          />

          {/* ERP Custom Fields Grid */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Custom Lifecycle & Governance Parameters
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                label="Default Warranty (Months)"
                type="number"
                min="0"
                value={catWarranty}
                onChange={(e) => setCatWarranty(Number(e.target.value))}
                required
              />
              <Input
                label="Depreciation Life (Years)"
                type="number"
                min="1"
                value={catDepreciation}
                onChange={(e) => setCatDepreciation(Number(e.target.value))}
                required
              />
              <Input
                label="Maint. Interval (Days)"
                type="number"
                min="7"
                value={catMaintInterval}
                onChange={(e) => setCatMaintInterval(Number(e.target.value))}
                required
              />
            </div>

            <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 bg-white cursor-pointer hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={catIsBookable}
                  onChange={(e) => setCatIsBookable(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <div className="text-xs">
                  <span className="font-semibold text-slate-800 block">Shared Bookable Resource</span>
                  <span className="text-[10px] text-slate-500">Eligible for shared resource booking timeline</span>
                </div>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 bg-white cursor-pointer hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={catRequireSerial}
                  onChange={(e) => setCatRequireSerial(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <div className="text-xs">
                  <span className="font-semibold text-slate-800 block">Require Serial Tag</span>
                  <span className="text-[10px] text-slate-500">Enforces QR serialization</span>
                </div>
              </label>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={() => setIsCatModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              {editingCat ? 'Save Changes' : 'Register Category'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 3: EMPLOYEE ROLE ELEVATION DIALOG */}
      <Modal
        isOpen={isElevateModalOpen}
        onClose={() => setIsElevateModalOpen(false)}
        title="Admin Role Elevation & Promotion"
        description="Elevate staff privilege tier with verified audit trail justification."
        maxWidth="md"
      >
        {selectedUserForElevation && (
          <form onSubmit={handleConfirmElevation} className="space-y-4">
            {/* Target Employee Info */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
              <img
                src={selectedUserForElevation.avatar}
                alt={selectedUserForElevation.name}
                className="w-10 h-10 rounded-full object-cover border border-slate-200"
              />
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-bold text-slate-900">{selectedUserForElevation.name}</h4>
                <p className="text-[11px] text-slate-500">{selectedUserForElevation.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-slate-400 font-mono">
                    Badge: {selectedUserForElevation.badgeNumber}
                  </span>
                  <span className="text-slate-300">&bull;</span>
                  <RoleBadge role={selectedUserForElevation.role} size="xs" />
                </div>
              </div>
            </div>

            {/* Role Selection */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-800">
                Designate New Privilege Tier
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { role: 'employee', label: 'Employee', desc: 'Standard staff self-service' },
                  { role: 'department_head', label: 'Department Head', desc: 'Team transfers & asset approvals' },
                  { role: 'asset_manager', label: 'Asset Manager', desc: 'Full inventory & maintenance flow' },
                  { role: 'admin', label: 'Admin', desc: 'Global superuser authority' },
                ].map((tier) => {
                  const isSelected = targetRole === tier.role
                  return (
                    <button
                      key={tier.role}
                      type="button"
                      onClick={() => setTargetRole(tier.role as UserRole)}
                      className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-500/20'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="font-bold text-xs text-slate-900">{tier.label}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                      </div>
                      <p className="text-[10px] text-slate-500 leading-tight">{tier.desc}</p>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Mandatory Justification Note */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-800">
                Elevation Reason / Audit Justification <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                required
                placeholder="Explain the business rationale for elevating this user's privileges..."
                value={elevationReason}
                onChange={(e) => setElevationReason(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
              />
              <span className="text-[10px] text-slate-400">
                This explanation is permanently bound to the security audit log.
              </span>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <Button type="button" variant="secondary" size="sm" onClick={() => setIsElevateModalOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={!elevationReason.trim()}
              >
                Execute Role Elevation
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  )
}
