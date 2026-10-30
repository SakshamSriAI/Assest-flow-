import React from 'react'
import { AppProvider, useApp } from './context/AppContext'
import { AppLayout } from './components/layout/AppLayout'
import { DashboardScreen } from './components/screens/DashboardScreen'
import { OrgSetupScreen } from './components/screens/OrgSetupScreen'
import { AuthScreen } from './components/screens/AuthScreen'
import { AssetDirectoryScreen } from './components/screens/AssetDirectoryScreen'
import { AllocationsScreen } from './components/screens/AllocationsScreen'
import { BookingsScreen } from './components/screens/BookingsScreen'
import { MaintenanceScreen } from './components/screens/MaintenanceScreen'
import { AuditsScreen } from './components/screens/AuditsScreen'
import { ReportsScreen } from './components/screens/ReportsScreen'
import { ActivityScreen } from './components/screens/ActivityScreen'

const RouteRenderer: React.FC = () => {
  const { currentRoute } = useApp()

  switch (currentRoute) {
    case 'dashboard':
      return <DashboardScreen />
    case 'org-setup':
      return <OrgSetupScreen />
    case 'auth':
      return <AuthScreen />
    case 'assets':
      return <AssetDirectoryScreen />
    case 'allocations':
      return <AllocationsScreen />
    case 'bookings':
      return <BookingsScreen />
    case 'maintenance':
      return <MaintenanceScreen />
    case 'audits':
      return <AuditsScreen />
    case 'reports':
      return <ReportsScreen />
    case 'activity':
      return <ActivityScreen />
    default:
      return <DashboardScreen />
  }
}

export function App() {
  return (
    <AppProvider>
      <AppLayout>
        <RouteRenderer />
      </AppLayout>
    </AppProvider>
  )
}

export default App
