import React, { useState } from 'react'
import { X, CheckCheck, AlertTriangle, ArrowRight, Clock, ShieldAlert, CheckCircle2 } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Tabs } from '../ui/Tabs'
import { AppRoute } from '../../types'

export const NotificationDrawer: React.FC = () => {
  const {
    isNotificationDrawerOpen,
    setIsNotificationDrawerOpen,
    notifications,
    markAsRead,
    markAllAsRead,
    setCurrentRoute,
  } = useApp()

  const [activeTab, setActiveTab] = useState<'all' | 'alerts' | 'approvals'>('all')

  if (!isNotificationDrawerOpen) return null

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === 'alerts') return n.type === 'alert' || n.urgency === 'high'
    if (activeTab === 'approvals') return n.type === 'approval'
    return true
  })

  const handleActionClick = (targetRoute?: AppRoute, id?: string) => {
    if (id) markAsRead(id)
    if (targetRoute) {
      setCurrentRoute(targetRoute)
      setIsNotificationDrawerOpen(false)
    }
  }

  const getTypeIcon = (type: string, urgency?: string) => {
    if (urgency === 'high' || type === 'alert') {
      return <AlertTriangle className="w-4 h-4 text-rose-500" />
    }
    if (type === 'approval') {
      return <ShieldAlert className="w-4 h-4 text-amber-500" />
    }
    if (type === 'maintenance') {
      return <Clock className="w-4 h-4 text-[#2563EB]" />
    }
    return <CheckCircle2 className="w-4 h-4 text-emerald-500" />
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={() => setIsNotificationDrawerOpen(false)}
      />

      {/* Slide-over panel */}
      <div className="relative w-full max-w-md bg-white shadow-2xl border-l border-[#E2E8F0] h-full flex flex-col z-10 animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-4 border-b border-[#E2E8F0] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-[#0F172A] text-sm">Notifications & Operational Alerts</h3>
            {notifications.filter((n) => !n.read).length > 0 && (
              <Badge variant="danger" size="xs">
                {notifications.filter((n) => !n.read).length} new
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="xs"
              onClick={markAllAsRead}
              leftIcon={<CheckCheck className="w-3.5 h-3.5" />}
            >
              Mark all read
            </Button>
            <button
              onClick={() => setIsNotificationDrawerOpen(false)}
              className="p-1.5 text-[#64748B] hover:text-[#0F172A] rounded-lg hover:bg-[#F1F3F5] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="px-4 py-2 border-b border-[#E2E8F0] bg-[#F8F9FA]">
          <Tabs
            size="sm"
            tabs={[
              { id: 'all', label: 'All', count: notifications.length },
              { id: 'alerts', label: 'Overdue & Urgent', count: notifications.filter((n) => n.urgency === 'high').length },
              { id: 'approvals', label: 'Approvals', count: notifications.filter((n) => n.type === 'approval').length },
            ]}
            activeTab={activeTab}
            onChange={(tab) => setActiveTab(tab as any)}
          />
        </div>

        {/* Notifications Feed */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#E2E8F0]">
          {filteredNotifications.length === 0 ? (
            <div className="p-8 text-center text-[#64748B]">
              <p className="text-xs">No notifications in this view.</p>
            </div>
          ) : (
            filteredNotifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-4 transition-colors ${
                  notif.read ? 'bg-white hover:bg-[#F8F9FA]' : 'bg-[#EFF6FF]/60 hover:bg-[#EFF6FF]'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 shrink-0 p-1.5 rounded-lg bg-[#F1F3F5]">
                    {getTypeIcon(notif.type, notif.urgency)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <h4
                        className={`text-xs truncate ${
                          notif.read ? 'font-medium text-[#0F172A]' : 'font-bold text-[#0F172A]'
                        }`}
                      >
                        {notif.title}
                      </h4>
                      <span className="text-[10px] text-[#64748B] shrink-0 font-mono">{notif.timestamp}</span>
                    </div>
                    <p className="text-xs text-[#64748B] line-clamp-2 mb-2 leading-relaxed">
                      {notif.message}
                    </p>
                    <div className="flex items-center justify-between">
                      {notif.targetRoute && (
                        <button
                          onClick={() => handleActionClick(notif.targetRoute, notif.id)}
                          className="text-[11px] font-semibold text-[#2563EB] hover:text-[#1D4ED8] flex items-center gap-1 cursor-pointer"
                        >
                          View in {notif.targetRoute}
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                      {!notif.read && (
                        <button
                          onClick={() => markAsRead(notif.id)}
                          className="text-[10px] text-[#64748B] hover:text-[#0F172A] cursor-pointer ml-auto"
                        >
                          Mark read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-[#F8F9FA] border-t border-[#E2E8F0] text-[11px] text-[#64748B] text-center">
          Real-time alerts synched with AssetFlow State Engine
        </div>
      </div>
    </div>
  )
}
