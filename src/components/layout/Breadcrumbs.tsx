import React from 'react'
import { ChevronRight, Home } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { AppRoute } from '../../types'

export const Breadcrumbs: React.FC = () => {
  const { breadcrumbs, setCurrentRoute } = useApp()

  return (
    <nav className="flex items-center space-x-1.5 text-xs text-[#64748B]" aria-label="Breadcrumb">
      <button
        onClick={() => setCurrentRoute('dashboard')}
        className="flex items-center text-[#64748B] hover:text-[#0F172A] transition-colors p-1 rounded-md hover:bg-[#F1F3F5] cursor-pointer"
        title="Go to Dashboard"
      >
        <Home className="w-3.5 h-3.5" />
      </button>

      {breadcrumbs.map((crumb, index) => {
        const isLast = index === breadcrumbs.length - 1
        return (
          <React.Fragment key={index}>
            <ChevronRight className="w-3.5 h-3.5 text-[#CBD5E1] shrink-0" />
            {crumb.route && !isLast ? (
              <button
                onClick={() => crumb.route && setCurrentRoute(crumb.route as AppRoute)}
                className="hover:text-[#2563EB] transition-colors cursor-pointer font-medium hover:underline"
              >
                {crumb.label}
              </button>
            ) : (
              <span className={isLast ? 'font-semibold text-[#0F172A]' : ''}>
                {crumb.label}
              </span>
            )}
          </React.Fragment>
        )
      })}
    </nav>
  )
}
