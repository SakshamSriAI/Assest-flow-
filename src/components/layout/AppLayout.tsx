import React from 'react'
import { Sidebar } from './Sidebar'
import { Navbar } from './Navbar'
import { NotificationDrawer } from './NotificationDrawer'
import { RoleSwitcherModal } from './RoleSwitcherModal'
import { CommandPalette } from './CommandPalette'
import { ToastContainer } from '../ui/ToastContainer'
import { RegisterAssetModal } from '../dashboard/RegisterAssetModal'
import { BookResourceModal } from '../dashboard/BookResourceModal'
import { RaiseMaintenanceModal } from '../dashboard/RaiseMaintenanceModal'
import { AssetDetailDrawer } from '../assets/AssetDetailDrawer'
import { useApp } from '../../context/AppContext'

interface AppLayoutProps {
  children: React.ReactNode
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const {
    isRoleSwitcherOpen,
    setIsRoleSwitcherOpen,
    toasts,
    removeToast,
    isRegisterAssetOpen,
    setIsRegisterAssetOpen,
    isBookResourceOpen,
    setIsBookResourceOpen,
    isRaiseMaintenanceOpen,
    setIsRaiseMaintenanceOpen,
    detailAsset,
    setDetailAsset,
  } = useApp()

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F8F9FA] text-[#0F172A] antialiased">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main View Area */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <Navbar />

        {/* Dynamic Route Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>

      {/* Global Overlays & Modals */}
      <NotificationDrawer />
      <RoleSwitcherModal
        isOpen={isRoleSwitcherOpen}
        onClose={() => setIsRoleSwitcherOpen(false)}
      />

      {/* Global Interactive Command Palette (Cmd+K / Ctrl+K) */}
      <CommandPalette />

      {/* Global Toast Notification Center */}
      <ToastContainer />

      {/* Global Action Modals */}
      <RegisterAssetModal
        isOpen={isRegisterAssetOpen}
        onClose={() => setIsRegisterAssetOpen(false)}
      />
      <BookResourceModal
        isOpen={isBookResourceOpen}
        onClose={() => setIsBookResourceOpen(false)}
      />
      <RaiseMaintenanceModal
        isOpen={isRaiseMaintenanceOpen}
        onClose={() => setIsRaiseMaintenanceOpen(false)}
      />

      {/* Global Asset Detail Drawer (invocable from search, command palette, and anywhere in the app) */}
      {detailAsset && (
        <AssetDetailDrawer
          asset={detailAsset}
          isOpen={!!detailAsset}
          onClose={() => setDetailAsset(null)}
        />
      )}
    </div>
  )
}
