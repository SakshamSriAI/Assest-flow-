import React from 'react'
import { cn } from '../../utils/classnames'

interface TabOption {
  id: string
  label: string
  count?: number | string
  icon?: React.ReactNode
  disabled?: boolean
}

interface TabsProps {
  tabs: TabOption[]
  activeTab: string
  onChange: (tabId: string) => void
  variant?: 'underline' | 'pill'
  size?: 'sm' | 'md'
  className?: string
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  variant = 'pill',
  size = 'sm',
  className,
}) => {
  if (variant === 'underline') {
    return (
      <div className={cn('border-b border-[#E2E8F0] flex gap-6', className)}>
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab
          return (
            <button
              key={tab.id}
              onClick={() => !tab.disabled && onChange(tab.id)}
              disabled={tab.disabled}
              className={cn(
                'flex items-center gap-2 pb-2.5 text-xs font-medium border-b-2 transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-40',
                isActive
                  ? 'border-[#2563EB] text-[#2563EB] font-semibold'
                  : 'border-transparent text-[#64748B] hover:text-[#0F172A] hover:border-[#E2E8F0]'
              )}
            >
              {tab.icon && <span className="w-3.5 h-3.5">{tab.icon}</span>}
              {tab.label}
              {tab.count !== undefined && (
                <span
                  className={cn(
                    'px-1.5 py-0.2 rounded-full text-[10px] font-semibold',
                    isActive ? 'bg-[#EFF6FF] text-[#2563EB]' : 'bg-[#F1F5F9] text-[#64748B]'
                  )}
                >
                  {tab.count}
                </span>
              )}
            </button>
          )
        })}
      </div>
    )
  }

  return (
    <div
      className={cn(
        'inline-flex p-1 bg-[#F1F3F5] rounded-lg border border-[#E2E8F0]',
        size === 'sm' ? 'gap-1' : 'gap-1.5',
        className
      )}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab
        return (
          <button
            key={tab.id}
            onClick={() => !tab.disabled && onChange(tab.id)}
            disabled={tab.disabled}
            className={cn(
              'flex items-center gap-1.5 rounded-md font-medium transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-40',
              size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-xs',
              isActive
                ? 'bg-white text-[#0F172A] shadow-xs font-semibold'
                : 'text-[#64748B] hover:text-[#0F172A] hover:bg-white/50'
            )}
          >
            {tab.icon && <span className="w-3.5 h-3.5">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={cn(
                  'px-1.5 py-0.2 rounded-full text-[10px]',
                  isActive ? 'bg-[#F1F5F9] text-[#0F172A] font-bold' : 'bg-[#E2E8F0] text-[#64748B]'
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
