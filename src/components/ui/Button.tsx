import React from 'react'
import { cn } from '../../utils/classnames'
import { Loader2 } from 'lucide-react'

export type ButtonVariant = 
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'danger'
  | 'subtle'

export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-[#2563EB] text-white hover:bg-[#1D4ED8] active:bg-[#1E40AF] shadow-xs border border-[#2563EB] focus-visible:ring-[#2563EB]',
  secondary: 'bg-[#FFFFFF] text-[#0F172A] hover:bg-[#F1F3F5] active:bg-[#E2E8F0] border border-[#E2E8F0] shadow-2xs focus-visible:ring-[#64748B]',
  outline: 'bg-transparent text-[#0F172A] hover:bg-[#F1F3F5] border border-[#E2E8F0] focus-visible:ring-[#64748B]',
  ghost: 'bg-transparent text-[#64748B] hover:bg-[#F1F3F5] hover:text-[#0F172A] border border-transparent focus-visible:ring-[#64748B]',
  danger: 'bg-[#DC2626] text-white hover:bg-[#B91C1C] active:bg-[#991B1B] shadow-xs border border-[#DC2626] focus-visible:ring-rose-500',
  subtle: 'bg-[#EFF6FF] text-[#2563EB] hover:bg-[#DBEAFE] active:bg-[#BFDBFE] border border-[#BFDBFE] focus-visible:ring-[#2563EB]',
}

const sizeClasses: Record<ButtonSize, string> = {
  xs: 'h-7 px-2.5 text-xs gap-1.5 rounded-md font-medium',
  sm: 'h-8 px-3 text-xs gap-1.5 rounded-md font-medium',
  md: 'h-9 px-3.5 text-sm gap-2 rounded-lg font-medium',
  lg: 'h-10 px-4 text-sm gap-2 rounded-lg font-semibold',
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'secondary',
      size = 'sm',
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center whitespace-nowrap transition-all duration-150',
          'cursor-pointer disabled:cursor-not-allowed disabled:opacity-50',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1',
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin shrink-0" />
        ) : (
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}
        {children}
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    )
  }
)

Button.displayName = 'Button'
