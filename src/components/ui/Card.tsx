import React from 'react'
import { cn } from '../../utils/classnames'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  compact?: boolean
}

export const Card: React.FC<CardProps> = ({ className, compact = false, children, ...props }) => {
  return (
    <div
      className={cn(
        'bg-white rounded-xl border border-[#E2E8F0] shadow-xs transition-shadow',
        compact ? 'p-3.5' : 'p-5',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

interface CardHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: React.ReactNode
  subtitle?: React.ReactNode
  action?: React.ReactNode
  badge?: React.ReactNode
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  className,
  title,
  subtitle,
  action,
  badge,
  children,
  ...props
}) => {
  return (
    <div
      className={cn('flex items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0]', className)}
      {...props}
    >
      <div className="space-y-0.5 min-w-0">
        <div className="flex items-center gap-2">
          {title && <h3 className="font-semibold text-[#0F172A] text-sm tracking-tight truncate">{title}</h3>}
          {badge}
        </div>
        {subtitle && <p className="text-xs text-[#64748B] truncate">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0 flex items-center gap-2">{action}</div>}
      {children}
    </div>
  )
}

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => {
  return (
    <div className={cn('pt-4', className)} {...props}>
      {children}
    </div>
  )
}
