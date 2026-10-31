import React from 'react'
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react'
import { useApp } from '../../context/AppContext'

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp()

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success'
        const isWarning = toast.type === 'warning'
        const isError = toast.type === 'error'
        const isInfo = toast.type === 'info'

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 p-3.5 rounded-xl border shadow-lg text-xs font-medium transition-all animate-in slide-in-from-bottom-2 duration-200 ${
              isSuccess
                ? 'bg-white border-[#A7F3D0] text-[#065F46] ring-1 ring-[#10B981]/20'
                : isWarning
                ? 'bg-white border-[#FDE68A] text-[#92400E] ring-1 ring-[#F59E0B]/20'
                : isError
                ? 'bg-white border-[#FECACA] text-[#991B1B] ring-1 ring-[#EF4444]/20'
                : 'bg-white border-[#BFDBFE] text-[#1E40AF] ring-1 ring-[#2563EB]/20'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {isSuccess && <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />}
              {isWarning && <AlertTriangle className="w-4 h-4 text-[#F59E0B] shrink-0" />}
              {isError && <XCircle className="w-4 h-4 text-[#EF4444] shrink-0" />}
              {isInfo && <Info className="w-4 h-4 text-[#2563EB] shrink-0" />}
              <span className="truncate leading-snug text-[#0F172A]">{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 rounded-md text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F3F5] transition-colors cursor-pointer shrink-0"
              aria-label="Dismiss toast"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
