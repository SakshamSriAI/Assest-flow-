export type UserRole = 'admin' | 'asset_manager' | 'department_head' | 'employee'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  department: string
  departmentId?: string
  avatar: string
  title: string
  badgeNumber: string
  joinDate?: string
  status?: 'active' | 'suspended'
}

export interface Department {
  id: string
  name: string
  code: string
  parentId?: string
  headId: string
  headName: string
  isActive: boolean
  memberCount: number
  allocatedAssetCount: number
  budgetCode?: string
}

export interface AssetCategory {
  id: string
  name: string
  code: string
  description: string
  defaultWarrantyMonths: number
  depreciationLifespanYears: number
  isBookable: boolean
  requiresSerialNumber: boolean
  maintenanceIntervalDays: number
  assetCount: number
}

export interface RoleElevationLog {
  id: string
  employeeId: string
  employeeName: string
  previousRole: UserRole
  newRole: UserRole
  elevatedBy: string
  reason: string
  timestamp: string
}

export type AssetState = 
  | 'Available' 
  | 'Allocated' 
  | 'Reserved' 
  | 'Under Maintenance' 
  | 'Lost' 
  | 'Retired' 
  | 'Disposed'

export interface AllocationHistoryItem {
  id: string
  assetId: string
  holderId: string
  holderName: string
  departmentName: string
  allocatedDate: string
  returnedDate?: string
  expectedReturnDate?: string
  conditionOnReturn?: string
  notes?: string
}

export interface Asset {
  id: string
  tag: string
  name: string
  categoryId: string
  categoryName: string
  departmentId: string
  departmentName: string
  status: AssetState
  currentHolderId?: string
  currentHolderName?: string
  currentHolderAvatar?: string
  allocatedDate?: string
  expectedReturnDate?: string
  serialNumber?: string
  condition: 'New' | 'Good' | 'Fair' | 'Maintenance Required'
  isBookable: boolean
  costTracking: number
  location: string
  qrCode?: string
  commissionDate?: string
  warrantyExpiryDate?: string
  allocationHistory?: AllocationHistoryItem[]
}

export type MaintenanceStatus = 
  | 'Pending' 
  | 'Approved' 
  | 'Rejected' 
  | 'Assigned' 
  | 'In Progress' 
  | 'Resolved'

export interface MaintenanceTicket {
  id: string
  ticketNumber: string
  assetId: string
  assetTag: string
  assetName: string
  issueDescription: string
  priority: 'Low' | 'Medium' | 'High' | 'Critical'
  status: MaintenanceStatus
  reportedById: string
  reportedByName: string
  assignedTechnician?: string
  createdAt: string
  resolvedAt?: string
  resolutionNotes?: string
  photoUrl?: string
}

export type TransferStatus = 
  | 'Requested' 
  | 'Approved' 
  | 'Rejected' 
  | 'Re-allocated'

export interface TransferRequest {
  id: string
  assetId: string
  assetTag: string
  assetName: string
  fromUserId: string
  fromUserName: string
  toUserId: string
  toUserName: string
  departmentId: string
  departmentName: string
  status: TransferStatus
  requestDate: string
  reason: string
}

export type BookingStatus = 
  | 'Upcoming' 
  | 'Ongoing' 
  | 'Completed' 
  | 'Cancelled'

export interface ResourceBooking {
  id: string
  resourceId: string
  resourceName: string
  categoryName: string
  bookedByUserId: string
  bookedByUserName: string
  bookedByUserAvatar?: string
  date: string
  startTime: string
  endTime: string
  purpose: string
  status: BookingStatus
  location: string
}

export type AuditStatus = 
  | 'Pending'
  | 'Verified' 
  | 'Missing' 
  | 'Damaged'

export type AuditCycleStatus = 'Active' | 'Completed' | 'Locked'

export interface AuditItem {
  id: string
  cycleId: string
  assetId: string
  assetTag: string
  assetName: string
  categoryName: string
  departmentName: string
  location: string
  serialNumber?: string
  expectedHolderName?: string
  status: AuditStatus
  auditedAt?: string
  auditedByUserName?: string
  notes?: string
}

export interface AuditCycle {
  id: string
  cycleCode: string
  name: string
  departmentId?: string
  departmentName: string
  location: string
  leadAuditorId: string
  leadAuditorName: string
  leadAuditorAvatar?: string
  startDate: string
  dueDate: string
  status: AuditCycleStatus
  closedAt?: string
  discrepancyReportSummary?: string
  items: AuditItem[]
}

export type AppRoute = 
  | 'dashboard'
  | 'assets'
  | 'allocations'
  | 'bookings'
  | 'maintenance'
  | 'audits'
  | 'reports'
  | 'org-setup'
  | 'activity'
  | 'auth'

export interface BreadcrumbItem {
  label: string
  route?: AppRoute
  icon?: string
}

export interface NotificationItem {
  id: string
  title: string
  message: string
  timestamp: string
  type: 'alert' | 'approval' | 'maintenance' | 'info'
  read: boolean
  targetRoute?: AppRoute
  urgency?: 'high' | 'medium' | 'low'
}

export interface ActivityLogItem {
  id: string
  timestamp: string
  relativeTime: string
  category: 'allocation' | 'transfer' | 'maintenance' | 'audit' | 'booking' | 'security' | 'registration'
  action: string
  actorId: string
  actorName: string
  actorRole: UserRole
  actorAvatar?: string
  assetId?: string
  assetTag?: string
  assetName?: string
  previousState?: string
  newState?: string
  notes?: string
  ipAddress?: string
  immutableHash?: string
}

export interface NavSection {
  title: string
  items: NavItem[]
}

export interface NavItem {
  id: AppRoute
  label: string
  icon: string
  badge?: string
  badgeVariant?: 'neutral' | 'danger' | 'warning' | 'primary' | 'success'
  allowedRoles: UserRole[]
  description: string
}
