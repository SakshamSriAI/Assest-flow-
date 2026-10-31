import { Asset, MaintenanceTicket, ResourceBooking } from '../types'

const API_BASE = '/api'

export const assetFlowApi = {
  async isOnline(): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(1500) })
      return res.ok
    } catch {
      return false
    }
  },

  async getAssets(): Promise<Asset[] | null> {
    try {
      const res = await fetch(`${API_BASE}/assets`)
      if (!res.ok) return null
      return await res.json()
    } catch {
      return null
    }
  },

  async createAsset(asset: Partial<Asset>): Promise<{ success: boolean; id?: string; tag?: string }> {
    try {
      const res = await fetch(`${API_BASE}/assets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(asset),
      })
      return await res.json()
    } catch (err) {
      return { success: false }
    }
  },

  async updateAsset(id: string, updates: Partial<Asset>): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/assets/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      return res.ok
    } catch {
      return false
    }
  },

  async deleteAsset(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/assets/${id}`, { method: 'DELETE' })
      return res.ok
    } catch {
      return false
    }
  },

  async checkInAsset(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/assets/${id}/check-in`, { method: 'POST' })
      return res.ok
    } catch {
      return false
    }
  },

  async getTickets(): Promise<MaintenanceTicket[] | null> {
    try {
      const res = await fetch(`${API_BASE}/tickets`)
      if (!res.ok) return null
      return await res.json()
    } catch {
      return null
    }
  },

  async createTicket(ticket: Partial<MaintenanceTicket>): Promise<{ success: boolean; ticketNumber?: string }> {
    try {
      const res = await fetch(`${API_BASE}/tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ticket),
      })
      return await res.json()
    } catch {
      return { success: false }
    }
  },

  async getBookings(): Promise<ResourceBooking[] | null> {
    try {
      const res = await fetch(`${API_BASE}/bookings`)
      if (!res.ok) return null
      return await res.json()
    } catch {
      return null
    }
  },

  async createBooking(booking: Partial<ResourceBooking>): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await fetch(`${API_BASE}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(booking),
      })
      return await res.json()
    } catch {
      return { success: false, error: 'Network error connecting to Flask backend' }
    }
  },

  async resetDatabase(): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/reset-db`, { method: 'POST' })
      return res.ok
    } catch {
      return false
    }
  },

  async clearDatabase(): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/clear-db`, { method: 'POST' })
      return res.ok
    } catch {
      return false
    }
  },
}
