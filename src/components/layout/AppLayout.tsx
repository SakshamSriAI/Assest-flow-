import React from 'react'
import { Sidebar } from './Sidebar'
import { Navbar } from './Navbar'
import { NotificationDrawer } from './NotificationDrawer'
import { RoleSwitcherModal } from './RoleSwitcherModal'
import { useApp } from '../../context/AppContext'

interface AppLayoutProps {
  children: React.ReactNode
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { isRoleSwitcherOpen, setIsRoleSwitcherOpen } = useApp()

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

      {/* Global Overlays */}
      <NotificationDrawer />
      <RoleSwitcherModal
        isOpen={isRoleSwitcherOpen}
        onClose={() => setIsRoleSwitcherOpen(false)}
      />
    </div>
  )
}
