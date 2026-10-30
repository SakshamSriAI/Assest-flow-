import React from 'react'
import { cn } from '../../utils/classnames'
import { AssetState, MaintenanceStatus, BookingStatus, AuditStatus, UserRole } from '../../types'

export type BadgeVariant = 
  | 'default'
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral'
  | 'purple'

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
  size?: 'xs' | 'sm' | 'md'
  dot?: boolean
  children: React.ReactNode
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-[#F1F5F9] text-[#475569] border-[#E2E8F0]',
  primary: 'bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]',
  success: 'bg-[#ECFDF5] text-[#047857] border-[#A7F3D0]',
  warning: 'bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]',
  danger: 'bg-[#FEF2F2] text-[#B91C1C] border-[#FECACA]',
  info: 'bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]',
  neutral: 'bg-[#F1F5F9] text-[#475569] border-[#E2E8F0]',
  purple: 'bg-[#0F2F57]/10 text-[#0F2F57] border-[#0F2F57]/20',
}

const dotColors: Record<BadgeVariant, string> = {
  default: 'bg-[#64748B]',
  primary: 'bg-[#2563EB]',
  success: 'bg-[#10B981]',
  warning: 'bg-[#F59E0B]',
  danger: 'bg-[#EF4444]',
  info: 'bg-[#3B82F6]',
  neutral: 'bg-[#64748B]',
  purple: 'bg-[#0F2F57]',
}

const sizeStyles = {
  xs: 'px-1.5 py-0.5 text-[10px] font-medium leading-none tracking-tight',
  sm: 'px-2 py-0.5 text-xs font-medium leading-tight',
  md: 'px-2.5 py-1 text-xs font-semibold leading-normal',
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  size = 'sm',
  dot = false,
  className,
  children,
  ...props
}) => {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border font-medium transition-colors',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {dot && <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', dotColors[variant])} />}
      {children}
    </span>
  )
}

/** Convenience badge for Asset State */
export const AssetStateBadge: React.FC<{ status: AssetState; size?: 'xs' | 'sm' | 'md' }> = ({ status, size = 'sm' }) => {
  const map: Record<AssetState, { variant: BadgeVariant; dot: boolean }> = {
    'Available': { variant: 'success', dot: true },
    'Allocated': { variant: 'primary', dot: true },
    'Reserved': { variant: 'info', dot: true },
    'Under Maintenance': { variant: 'warning', dot: true },
    'Lost': { variant: 'danger', dot: true },
    'Retired': { variant: 'neutral', dot: false },
    'Disposed': { variant: 'default', dot: false },
  }
  const conf = map[status] || { variant: 'default', dot: false }
  return (
    <Badge variant={conf.variant} size={size} dot={conf.dot}>
      {status}
    </Badge>
  )
}

/** Convenience badge for User Role */
export const RoleBadge: React.FC<{ role: UserRole; size?: 'xs' | 'sm' | 'md' }> = ({ role, size = 'sm' }) => {
  const map: Record<UserRole, { label: string; variant: BadgeVariant }> = {
    admin: { label: 'Admin', variant: 'purple' },
    asset_manager: { label: 'Asset Manager', variant: 'primary' },
    department_head: { label: 'Dept Head', variant: 'info' },
    employee: { label: 'Employee', variant: 'neutral' },
  }
  const conf = map[role] || { label: role, variant: 'default' }
  return (
    <Badge variant={conf.variant} size={size} dot={true}>
      {conf.label}
    </Badge>
  )
}

/** Convenience badge for Maintenance Status */
export const MaintenanceBadge: React.FC<{ status: MaintenanceStatus; size?: 'xs' | 'sm' | 'md' }> = ({ status, size = 'sm' }) => {
  const map: Record<MaintenanceStatus, BadgeVariant> = {
    'Pending': 'warning',
    'Approved': 'info',
    'Rejected': 'danger',
    'Assigned': 'purple',
    'In Progress': 'primary',
    'Resolved': 'success',
  }
  return (
    <Badge variant={map[status] || 'default'} size={size} dot>
      {status}
    </Badge>
  )
}

/** Convenience badge for Booking Status */
export const BookingBadge: React.FC<{ status: BookingStatus; size?: 'xs' | 'sm' | 'md' }> = ({ status, size = 'sm' }) => {
  const map: Record<BookingStatus, BadgeVariant> = {
    'Upcoming': 'info',
    'Ongoing': 'primary',
    'Completed': 'success',
    'Cancelled': 'danger',
  }
  return (
    <Badge variant={map[status] || 'default'} size={size} dot>
      {status}
    </Badge>
  )
}

/** Convenience badge for Audit Status */
export const AuditBadge: React.FC<{ status: AuditStatus; size?: 'xs' | 'sm' | 'md' }> = ({ status, size = 'sm' }) => {
  const map: Record<AuditStatus, BadgeVariant> = {
    'Pending': 'neutral',
    'Verified': 'success',
    'Missing': 'danger',
    'Damaged': 'warning',
  }
  return (
    <Badge variant={map[status] || 'default'} size={size} dot>
      {status}
    </Badge>
  )
}
