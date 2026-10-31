import React, { createContext, useContext, useState, useEffect } from 'react'
import {
  User,
  UserRole,
  AppRoute,
  NotificationItem,
  BreadcrumbItem,
  Department,
  AssetCategory,
  RoleElevationLog,
  Asset,
  MaintenanceTicket,
  MaintenanceStatus,
  TransferRequest,
  ResourceBooking,
  BookingStatus,
  AssetState,
  AuditCycle,
  AuditItem,
  AuditStatus,
  ActivityLogItem,
  ToastMessage
} from '../types'
import { assetFlowApi } from '../api/assetFlowApi'

const STORAGE_PREFIX = 'assetflow_erp_v2_'

function loadStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue
  try {
    const item = localStorage.getItem(`${STORAGE_PREFIX}${key}`)
    if (item !== null) {
      return JSON.parse(item)
    }
  } catch (e) {
    console.error(`Failed to load ${key} from localStorage`, e)
  }
  return defaultValue
}

function saveStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(value))
  } catch (e) {
    console.error(`Failed to save ${key} to localStorage`, e)
  }
}

export const INITIAL_USERS: User[] = [
  {
    id: 'usr-admin-1',
    name: 'Eleanor Vance',
    email: 'eleanor.vance@assetflow.corp',
    role: 'admin',
    department: 'Operations & IT Governance',
    departmentId: 'dept-ops',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    title: 'Global Systems Administrator',
    badgeNumber: 'AF-ADM-001',
    joinDate: '2022-01-15',
    status: 'active',
  },
  {
    id: 'usr-mgr-1',
    name: 'Marcus Sterling',
    email: 'marcus.sterling@assetflow.corp',
    role: 'asset_manager',
    department: 'IT & Infrastructure Systems',
    departmentId: 'dept-it',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    title: 'Lead Asset & Facilities Custodian',
    badgeNumber: 'AF-MGR-104',
    joinDate: '2022-06-01',
    status: 'active',
  },
  {
    id: 'usr-dept-1',
    name: 'Sarah Jenkins',
    email: 'sarah.jenkins@assetflow.corp',
    role: 'department_head',
    department: 'Engineering & Core R&D',
    departmentId: 'dept-eng',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    title: 'VP of Engineering',
    badgeNumber: 'AF-DHD-208',
    joinDate: '2021-03-10',
    status: 'active',
  },
  {
    id: 'usr-emp-1',
    name: 'David Chen',
    email: 'david.chen@assetflow.corp',
    role: 'employee',
    department: 'Engineering & Core R&D',
    departmentId: 'dept-eng',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    title: 'Senior Software Engineer',
    badgeNumber: 'AF-EMP-492',
    joinDate: '2023-02-14',
    status: 'active',
  },
  {
    id: 'usr-emp-2',
    name: 'Elena Rostova',
    email: 'elena.rostova@assetflow.corp',
    role: 'employee',
    department: 'Facilities & Corporate Fleet',
    departmentId: 'dept-fac',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    title: 'Fleet Operations Coordinator',
    badgeNumber: 'AF-EMP-511',
    joinDate: '2023-05-18',
    status: 'active',
  },
  {
    id: 'usr-emp-3',
    name: 'Alex Rivera',
    email: 'alex.rivera@assetflow.corp',
    role: 'employee',
    department: 'Product & UX Design Studio',
    departmentId: 'dept-dsn',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    title: 'Staff Product Designer',
    badgeNumber: 'AF-EMP-603',
    joinDate: '2023-08-20',
    status: 'active',
  },
  {
    id: 'usr-emp-4',
    name: 'Priyah Patel',
    email: 'priyah.patel@assetflow.corp',
    role: 'employee',
    department: 'Engineering & Core R&D',
    departmentId: 'dept-eng',
    avatar: 'https://images.unsplash.com/photo-1534751516642-a171edd25218?w=150&auto=format&fit=crop&q=80',
    title: 'Firmware & Hardware Architect',
    badgeNumber: 'AF-EMP-729',
    joinDate: '2024-01-10',
    status: 'active',
  },
]

export const INITIAL_DEPARTMENTS: Department[] = [
  {
    id: 'dept-ops',
    name: 'Executive & Governance Operations',
    code: 'OPS',
    headId: 'usr-admin-1',
    headName: 'Eleanor Vance',
    isActive: true,
    memberCount: 8,
    allocatedAssetCount: 24,
    budgetCode: 'CC-9001',
  },
  {
    id: 'dept-it',
    name: 'IT & Infrastructure Systems',
    code: 'IT',
    parentId: 'dept-ops',
    headId: 'usr-mgr-1',
    headName: 'Marcus Sterling',
    isActive: true,
    memberCount: 14,
    allocatedAssetCount: 142,
    budgetCode: 'CC-4210',
  },
  {
    id: 'dept-eng',
    name: 'Engineering & Core R&D',
    code: 'ENG',
    headId: 'usr-dept-1',
    headName: 'Sarah Jenkins',
    isActive: true,
    memberCount: 45,
    allocatedAssetCount: 230,
    budgetCode: 'CC-1020',
  },
  {
    id: 'dept-dsn',
    name: 'Product & UX Design Studio',
    code: 'DSN',
    parentId: 'dept-eng',
    headId: 'usr-emp-3',
    headName: 'Alex Rivera',
    isActive: true,
    memberCount: 12,
    allocatedAssetCount: 38,
    budgetCode: 'CC-1055',
  },
  {
    id: 'dept-fac',
    name: 'Facilities & Corporate Fleet',
    code: 'FAC',
    parentId: 'dept-ops',
    headId: 'usr-emp-2',
    headName: 'Elena Rostova',
    isActive: true,
    memberCount: 9,
    allocatedAssetCount: 56,
    budgetCode: 'CC-7800',
  },
]

export const INITIAL_CATEGORIES: AssetCategory[] = [
  {
    id: 'cat-lap',
    name: 'Computing Hardware & Laptops',
    code: 'CAT-LAP',
    description: 'Developer workstations, laptops, ultrabooks, and mobile test devices.',
    defaultWarrantyMonths: 36,
    depreciationLifespanYears: 3,
    isBookable: false,
    requiresSerialNumber: true,
    maintenanceIntervalDays: 180,
    assetCount: 185,
  },
  {
    id: 'cat-srv',
    name: 'Enterprise Servers & Networking',
    code: 'CAT-SRV',
    description: 'Rackmount server units, core switches, routers, and datacenter hardware.',
    defaultWarrantyMonths: 60,
    depreciationLifespanYears: 5,
    isBookable: false,
    requiresSerialNumber: true,
    maintenanceIntervalDays: 90,
    assetCount: 42,
  },
  {
    id: 'cat-room',
    name: 'Executive & Conference Rooms',
    code: 'CAT-ROOM',
    description: 'Physical boardroom spaces, presentation rooms, and soundproof pods.',
    defaultWarrantyMonths: 12,
    depreciationLifespanYears: 10,
    isBookable: true,
    requiresSerialNumber: false,
    maintenanceIntervalDays: 30,
    assetCount: 14,
  },
  {
    id: 'cat-veh',
    name: 'Corporate Fleet & Transport Vehicles',
    code: 'CAT-VEH',
    description: 'Electric pool vehicles, maintenance vans, and transport shuttles.',
    defaultWarrantyMonths: 60,
    depreciationLifespanYears: 7,
    isBookable: true,
    requiresSerialNumber: true,
    maintenanceIntervalDays: 60,
    assetCount: 9,
  },
  {
    id: 'cat-lab',
    name: 'Specialized Hardware Lab Test Benches',
    code: 'CAT-LAB',
    description: 'Oscilloscopes, logic analyzers, RF spectrum rigs, and soldering stations.',
    defaultWarrantyMonths: 24,
    depreciationLifespanYears: 5,
    isBookable: true,
    requiresSerialNumber: true,
    maintenanceIntervalDays: 90,
    assetCount: 28,
  },
]

export const INITIAL_ASSETS: Asset[] = [
  {
    id: 'ast-1',
    tag: 'AF-0001',
    name: 'MacBook Pro 16" M3 Max (36GB/1TB)',
    categoryId: 'cat-lap',
    categoryName: 'Computing Hardware & Laptops',
    departmentId: 'dept-eng',
    departmentName: 'Engineering & Core R&D',
    status: 'Allocated',
    currentHolderId: 'usr-emp-3',
    currentHolderName: 'Alex Rivera',
    currentHolderAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    allocatedDate: '2026-10-14',
    expectedReturnDate: '2026-10-28', // OVERDUE
    serialNumber: 'C02G90J0MD6T',
    condition: 'Good',
    isBookable: false,
    costTracking: 3499,
    location: 'HQ Floor 4 - Desk 412',
    qrCode: 'AF-0001-QR',
    commissionDate: '2024-03-10',
    warrantyExpiryDate: '2027-03-10',
    allocationHistory: [
      {
        id: 'ah-1',
        assetId: 'ast-1',
        holderId: 'usr-emp-1',
        holderName: 'David Chen',
        departmentName: 'Engineering & Core R&D',
        allocatedDate: '2024-03-15',
        returnedDate: '2025-06-30',
        expectedReturnDate: '2025-06-30',
        conditionOnReturn: 'Good',
        notes: 'Initial provisioning for firmware compilation tasks.',
      },
      {
        id: 'ah-2',
        assetId: 'ast-1',
        holderId: 'usr-emp-3',
        holderName: 'Alex Rivera',
        departmentName: 'Product & UX Design Studio',
        allocatedDate: '2026-10-14',
        expectedReturnDate: '2026-10-28',
        notes: 'High-res rendering sprint.',
      },
    ],
  },
  {
    id: 'ast-2',
    tag: 'AF-0002',
    name: 'Dell UltraSharp 32" 4K USB-C Hub Monitor',
    categoryId: 'cat-lap',
    categoryName: 'Computing Hardware & Laptops',
    departmentId: 'dept-eng',
    departmentName: 'Engineering & Core R&D',
    status: 'Allocated',
    currentHolderId: 'usr-emp-1',
    currentHolderName: 'David Chen',
    currentHolderAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    allocatedDate: '2026-10-18',
    expectedReturnDate: '2026-11-02', // UPCOMING in 3 days
    serialNumber: 'CN-0K752D-74261',
    condition: 'New',
    isBookable: false,
    costTracking: 899,
    location: 'HQ Floor 3 - Engineering Pod C',
    qrCode: 'AF-0002-QR',
    commissionDate: '2024-05-20',
    warrantyExpiryDate: '2027-05-20',
    allocationHistory: [
      {
        id: 'ah-3',
        assetId: 'ast-2',
        holderId: 'usr-dept-1',
        holderName: 'Sarah Jenkins',
        departmentName: 'Engineering & Core R&D',
        allocatedDate: '2024-06-01',
        returnedDate: '2025-10-10',
        conditionOnReturn: 'New',
        notes: 'Used in executive engineering annex.',
      },
      {
        id: 'ah-4',
        assetId: 'ast-2',
        holderId: 'usr-emp-1',
        holderName: 'David Chen',
        departmentName: 'Engineering & Core R&D',
        allocatedDate: '2026-10-18',
        expectedReturnDate: '2026-11-02',
        notes: 'Assigned for dual-screen development.',
      },
    ],
  },
  {
    id: 'ast-3',
    tag: 'AF-0003',
    name: 'Dell PowerEdge R750xs 2U Rack Server',
    categoryId: 'cat-srv',
    categoryName: 'Enterprise Servers & Networking',
    departmentId: 'dept-it',
    departmentName: 'IT & Infrastructure Systems',
    status: 'Under Maintenance',
    serialNumber: 'SVC-TAG-9921B',
    condition: 'Maintenance Required',
    isBookable: false,
    costTracking: 6450,
    location: 'Primary Datacenter - Rack B04',
    qrCode: 'AF-0003-QR',
    commissionDate: '2023-01-15',
    warrantyExpiryDate: '2028-01-15',
  },
  {
    id: 'ast-4',
    tag: 'AF-0004',
    name: 'Conference Room Horizon A (8 Seats, Dual 4K)',
    categoryId: 'cat-room',
    categoryName: 'Executive & Conference Rooms',
    departmentId: 'dept-ops',
    departmentName: 'Executive & Governance Operations',
    status: 'Available',
    condition: 'Good',
    isBookable: true,
    costTracking: 12000,
    location: 'HQ Building 1 - Level 2',
    qrCode: 'AF-0004-QR',
    commissionDate: '2022-09-01',
    warrantyExpiryDate: '2026-09-01',
  },
  {
    id: 'ast-5',
    tag: 'AF-0005',
    name: 'Executive Boardroom Orion (18 Seats, Zoom Rooms)',
    categoryId: 'cat-room',
    categoryName: 'Executive & Conference Rooms',
    departmentId: 'dept-ops',
    departmentName: 'Executive & Governance Operations',
    status: 'Reserved',
    condition: 'New',
    isBookable: true,
    costTracking: 25000,
    location: 'HQ Tower - Penthouse Floor',
    qrCode: 'AF-0005-QR',
    commissionDate: '2023-04-10',
    warrantyExpiryDate: '2027-04-10',
  },
  {
    id: 'ast-6',
    tag: 'AF-0006',
    name: 'Tesla Model Y Long Range (Corporate Fleet #02)',
    categoryId: 'cat-veh',
    categoryName: 'Corporate Fleet & Transport Vehicles',
    departmentId: 'dept-fac',
    departmentName: 'Facilities & Corporate Fleet',
    status: 'Allocated',
    currentHolderId: 'usr-emp-2',
    currentHolderName: 'Elena Rostova',
    currentHolderAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    allocatedDate: '2026-10-20',
    expectedReturnDate: '2026-10-27', // OVERDUE
    serialNumber: '5YJ3E1EB8NF109281',
    condition: 'Good',
    isBookable: true,
    costTracking: 48990,
    location: 'Basement Parking Bay B-12',
    qrCode: 'AF-0006-QR',
    commissionDate: '2023-08-01',
    warrantyExpiryDate: '2028-08-01',
  },
  {
    id: 'ast-7',
    tag: 'AF-0007',
    name: 'Keysight Infiniium 500MHz 4-Ch Oscilloscope',
    categoryId: 'cat-lab',
    categoryName: 'Specialized Hardware Lab Test Benches',
    departmentId: 'dept-eng',
    departmentName: 'Engineering & Core R&D',
    status: 'Available',
    condition: 'Good',
    isBookable: true,
    costTracking: 14500,
    location: 'R&D Hardware Bench #04',
    qrCode: 'AF-0007-QR',
    commissionDate: '2024-01-20',
    warrantyExpiryDate: '2026-01-20',
  },
  {
    id: 'ast-8',
    tag: 'AF-0008',
    name: 'Lenovo ThinkPad P1 Gen 6 (i9 / 64GB / RTX 4080)',
    categoryId: 'cat-lap',
    categoryName: 'Computing Hardware & Laptops',
    departmentId: 'dept-eng',
    departmentName: 'Engineering & Core R&D',
    status: 'Allocated',
    currentHolderId: 'usr-dept-1',
    currentHolderName: 'Sarah Jenkins',
    currentHolderAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    allocatedDate: '2026-10-15',
    expectedReturnDate: '2026-11-05', // UPCOMING in 6 days
    serialNumber: 'PF-2K90A1',
    condition: 'Good',
    isBookable: false,
    costTracking: 3850,
    location: 'HQ Floor 4 - Executive Suite',
    qrCode: 'AF-0008-QR',
    commissionDate: '2024-02-14',
    warrantyExpiryDate: '2027-02-14',
  },
  {
    id: 'ast-9',
    tag: 'AF-0009',
    name: 'Cisco Nexus 93180YC-FX3 48-Port 25G Switch',
    categoryId: 'cat-srv',
    categoryName: 'Enterprise Servers & Networking',
    departmentId: 'dept-it',
    departmentName: 'IT & Infrastructure Systems',
    status: 'Available',
    serialNumber: 'FOC241920LK',
    condition: 'New',
    isBookable: false,
    costTracking: 9200,
    location: 'Spares Inventory Room 102',
    qrCode: 'AF-0009-QR',
    commissionDate: '2023-11-10',
    warrantyExpiryDate: '2028-11-10',
  },
  {
    id: 'ast-10',
    tag: 'AF-0010',
    name: 'Sony FE 70-200mm f/2.8 GM OSS II Lens Kit',
    categoryId: 'cat-lap',
    categoryName: 'Computing Hardware & Laptops',
    departmentId: 'dept-dsn',
    departmentName: 'Product & UX Design Studio',
    status: 'Lost',
    condition: 'Fair',
    isBookable: false,
    costTracking: 2799,
    location: 'Unknown - Flagged during Physical Audit',
    qrCode: 'AF-0010-QR',
    commissionDate: '2023-06-18',
    warrantyExpiryDate: '2025-06-18',
  },
  {
    id: 'ast-11',
    tag: 'AF-0011',
    name: 'Soundproof Focus Pod Gamma (1-Person Video Booth)',
    categoryId: 'cat-room',
    categoryName: 'Executive & Conference Rooms',
    departmentId: 'dept-ops',
    departmentName: 'Executive & Governance Operations',
    status: 'Available',
    condition: 'New',
    isBookable: true,
    costTracking: 6500,
    location: 'HQ Building 2 - Level 1 (Atrium West)',
    qrCode: 'AF-0011-QR',
    commissionDate: '2024-03-01',
    warrantyExpiryDate: '2027-03-01',
  },
  {
    id: 'ast-12',
    tag: 'AF-0012',
    name: 'Ford E-Transit Electric Cargo Van #01',
    categoryId: 'cat-veh',
    categoryName: 'Corporate Fleet & Transport Vehicles',
    departmentId: 'dept-ops',
    departmentName: 'Executive & Governance Operations',
    status: 'Available',
    condition: 'Good',
    isBookable: true,
    costTracking: 52000,
    location: 'HQ Loading Dock Bay 03',
    qrCode: 'AF-0012-QR',
    commissionDate: '2023-11-15',
    warrantyExpiryDate: '2028-11-15',
  },
  {
    id: 'ast-13',
    tag: 'AF-0013',
    name: 'Rohde & Schwarz RF Vector Signal Generator (Bench #02)',
    categoryId: 'cat-lab',
    categoryName: 'Specialized Hardware Lab Test Benches',
    departmentId: 'dept-eng',
    departmentName: 'Engineering & Core R&D',
    status: 'Available',
    condition: 'New',
    isBookable: true,
    costTracking: 22800,
    location: 'R&D RF Screening Lab Bench #02',
    qrCode: 'AF-0013-QR',
    commissionDate: '2024-02-10',
    warrantyExpiryDate: '2027-02-10',
  },
]

export const INITIAL_TICKETS: MaintenanceTicket[] = [
  {
    id: 'mnt-1',
    ticketNumber: 'MNT-209',
    assetId: 'ast-3',
    assetTag: 'AF-0003',
    assetName: 'Dell PowerEdge R750xs 2U Rack Server',
    issueDescription: 'Secondary Redundant Power Supply (PSU 2) failing voltage threshold diagnostics.',
    priority: 'High',
    status: 'In Progress',
    reportedById: 'usr-mgr-1',
    reportedByName: 'Marcus Sterling',
    assignedTechnician: 'Apex Enterprise Field Engineering',
    createdAt: '2026-10-30 08:30 AM',
  },
  {
    id: 'mnt-2',
    ticketNumber: 'MNT-210',
    assetId: 'ast-1',
    assetTag: 'AF-0001',
    assetName: 'MacBook Pro 16" M3 Max',
    issueDescription: 'Trackpad haptic feedback inconsistent and top USB-C port loose connection.',
    priority: 'Medium',
    status: 'Pending',
    reportedById: 'usr-emp-1',
    reportedByName: 'David Chen',
    createdAt: '2026-10-30 11:15 AM',
  },
  {
    id: 'mnt-3',
    ticketNumber: 'MNT-211',
    assetId: 'ast-11',
    assetTag: 'AF-0011',
    assetName: 'Soundproof Focus Pod Gamma (1-Person Video Booth)',
    issueDescription: 'Acoustic glass door latch misaligned; magnetic sensor reporting open loop.',
    priority: 'Low',
    status: 'Pending',
    reportedById: 'usr-emp-3',
    reportedByName: 'Alex Rivera',
    createdAt: '2026-10-30 01:20 PM',
  },
  {
    id: 'mnt-4',
    ticketNumber: 'MNT-212',
    assetId: 'ast-7',
    assetTag: 'AF-0007',
    assetName: 'Keysight Infiniium 500MHz 4-Ch Oscilloscope',
    issueDescription: 'Channel 2 BNC input port impedance drift > 5% above 300MHz.',
    priority: 'High',
    status: 'Approved',
    reportedById: 'usr-emp-4',
    reportedByName: 'Priyah Patel',
    createdAt: '2026-10-29 03:40 PM',
  },
  {
    id: 'mnt-5',
    ticketNumber: 'MNT-213',
    assetId: 'ast-6',
    assetTag: 'AF-0006',
    assetName: 'Tesla Model Y Long Range (Corporate Fleet #02)',
    issueDescription: 'Scheduled 12V auxiliary lithium battery inspection and tire pressure TPMS calibration.',
    priority: 'Medium',
    status: 'Assigned',
    reportedById: 'usr-emp-2',
    reportedByName: 'Elena Rostova',
    assignedTechnician: 'Tesla Mobile Service Fleet Engineering',
    createdAt: '2026-10-28 09:00 AM',
  },
  {
    id: 'mnt-6',
    ticketNumber: 'MNT-214',
    assetId: 'ast-2',
    assetTag: 'AF-0002',
    assetName: 'Dell UltraSharp 32" 4K USB-C Hub Monitor',
    issueDescription: 'DisplayPort 1.4 video handshake intermittent at 60Hz 10-bit HDR.',
    priority: 'Low',
    status: 'Resolved',
    reportedById: 'usr-emp-1',
    reportedByName: 'David Chen',
    assignedTechnician: 'Internal Hardware Depot (Marcus S.)',
    createdAt: '2026-10-27 10:00 AM',
    resolvedAt: '2026-10-29 04:15 PM',
    resolutionNotes: 'Updated scaler firmware to v2.01 and replaced DP cable. 4-hour burn-in stress test passed.',
  },
]

export const INITIAL_AUDIT_CYCLES: AuditCycle[] = [
  {
    id: 'aud-1',
    cycleCode: 'AUD-2026-Q4-ENG',
    name: 'Q4 Physical Verification — Engineering & R&D Hardware',
    departmentId: 'dept-eng',
    departmentName: 'Engineering & Core R&D',
    location: 'HQ Building 1 - Lab Floor & Hardware Benches',
    leadAuditorId: 'usr-dept-1',
    leadAuditorName: 'Sarah Jenkins',
    leadAuditorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    startDate: '2026-10-25',
    dueDate: '2026-11-05',
    status: 'Active',
    items: [
      {
        id: 'aud-item-1',
        cycleId: 'aud-1',
        assetId: 'ast-7',
        assetTag: 'AF-0007',
        assetName: 'Keysight Infiniium 500MHz 4-Ch Oscilloscope',
        categoryName: 'Specialized Hardware Lab Test Benches',
        departmentName: 'Engineering & Core R&D',
        location: 'R&D Hardware Bench #04',
        serialNumber: 'MY5829104',
        expectedHolderName: 'Shared Lab Pool',
        status: 'Verified',
        auditedAt: '2026-10-28 02:15 PM',
        auditedByUserName: 'Sarah Jenkins',
        notes: 'Serial plate intact. Self-test diagnostic calibration verified.',
      },
      {
        id: 'aud-item-2',
        cycleId: 'aud-1',
        assetId: 'ast-8',
        assetTag: 'AF-0008',
        assetName: 'ThinkPad P16 Gen 2 Mobile Workstation',
        categoryName: 'Computing Hardware & Laptops',
        departmentName: 'Engineering & Core R&D',
        location: 'Engineering Desk Pod 4-C',
        serialNumber: 'PF-2K90A1',
        expectedHolderName: 'Sarah Jenkins',
        status: 'Verified',
        auditedAt: '2026-10-28 03:00 PM',
        auditedByUserName: 'Sarah Jenkins',
        notes: 'Device physically present at dock. Barcode scan matched.',
      },
      {
        id: 'aud-item-3',
        cycleId: 'aud-1',
        assetId: 'ast-13',
        assetTag: 'AF-0013',
        assetName: 'Rohde & Schwarz RF Vector Signal Generator (Bench #02)',
        categoryName: 'Specialized Hardware Lab Test Benches',
        departmentName: 'Engineering & Core R&D',
        location: 'R&D RF Screening Lab Bench #02',
        serialNumber: 'RS-SMBV100B-991',
        expectedHolderName: 'Priyah Patel',
        status: 'Verified',
        auditedAt: '2026-10-29 10:45 AM',
        auditedByUserName: 'Sarah Jenkins',
        notes: 'RF output power calibrated. Asset tag confirmed.',
      },
      {
        id: 'aud-item-4',
        cycleId: 'aud-1',
        assetId: 'ast-1',
        assetTag: 'AF-0001',
        assetName: 'MacBook Pro 16" M3 Max',
        categoryName: 'Computing Hardware & Laptops',
        departmentName: 'Engineering & Core R&D',
        location: 'Engineering Desk Pod 2-A',
        serialNumber: 'C02G90J0MD6T',
        expectedHolderName: 'David Chen',
        status: 'Damaged',
        auditedAt: '2026-10-29 04:30 PM',
        auditedByUserName: 'Sarah Jenkins',
        notes: 'Physical defect: Trackpad haptic click degraded, USB-C port loose. Maintenance ticket MNT-210 opened.',
      },
      {
        id: 'aud-item-5',
        cycleId: 'aud-1',
        assetId: 'ast-10',
        assetTag: 'AF-0010',
        assetName: 'Sony FE 70-200mm f/2.8 GM OSS II Lens Kit',
        categoryName: 'Computing Hardware & Laptops',
        departmentName: 'Product & UX Design Studio',
        location: 'Hardware Security Locker A-12',
        serialNumber: 'SN-70200-GM2',
        expectedHolderName: 'Shared Design Pool',
        status: 'Missing',
        auditedAt: '2026-10-30 09:10 AM',
        auditedByUserName: 'Sarah Jenkins',
        notes: 'Discrepancy: Locker compartment empty. No check-out log on file.',
      },
      {
        id: 'aud-item-6',
        cycleId: 'aud-1',
        assetId: 'ast-2',
        assetTag: 'AF-0002',
        assetName: 'Dell UltraSharp 32" 4K USB-C Hub Monitor',
        categoryName: 'Computing Hardware & Laptops',
        departmentName: 'Engineering & Core R&D',
        location: 'Engineering Desk Pod 2-A',
        serialNumber: 'CN-0K752D-74261',
        expectedHolderName: 'David Chen',
        status: 'Pending',
        notes: '',
      },
    ],
  },
  {
    id: 'aud-2',
    cycleCode: 'AUD-2026-Q3-IT',
    name: 'Q3 Enterprise Server & Infrastructure Reconciliation',
    departmentId: 'dept-it',
    departmentName: 'IT & Infrastructure Systems',
    location: 'Datacenter Server Room B-01',
    leadAuditorId: 'usr-mgr-1',
    leadAuditorName: 'Marcus Sterling',
    leadAuditorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    startDate: '2026-09-15',
    dueDate: '2026-09-30',
    status: 'Locked',
    closedAt: '2026-09-30 05:00 PM',
    discrepancyReportSummary: '100% of datacenter servers accounted for. 0 discrepancies.',
    items: [
      {
        id: 'aud-item-201',
        cycleId: 'aud-2',
        assetId: 'ast-3',
        assetTag: 'AF-0003',
        assetName: 'Dell PowerEdge R750xs 2U Rack Server',
        categoryName: 'Enterprise Servers & Networking',
        departmentName: 'IT & Infrastructure Systems',
        location: 'Datacenter Server Room B-01 (Rack 04)',
        serialNumber: 'SVC-TAG-9921B',
        expectedHolderName: 'Datacenter Ops',
        status: 'Verified',
        auditedAt: '2026-09-28 11:00 AM',
        auditedByUserName: 'Marcus Sterling',
        notes: 'Asset verified and rack position confirmed.',
      },
      {
        id: 'aud-item-202',
        cycleId: 'aud-2',
        assetId: 'ast-9',
        assetTag: 'AF-0009',
        assetName: 'Cisco Catalyst 9300 48-Port PoE+ Switch',
        categoryName: 'Enterprise Servers & Networking',
        departmentName: 'IT & Infrastructure Systems',
        location: 'Datacenter Server Room B-01 (Core Distribution Rack)',
        serialNumber: 'FOC241920LK',
        expectedHolderName: 'Network Engineering',
        status: 'Verified',
        auditedAt: '2026-09-28 11:30 AM',
        auditedByUserName: 'Marcus Sterling',
        notes: 'All 48 ports operational. Thermal tags intact.',
      },
    ],
  },
]

export const INITIAL_TRANSFERS: TransferRequest[] = [
  {
    id: 'trf-1',
    assetId: 'ast-2',
    assetTag: 'AF-0002',
    assetName: 'Dell UltraSharp 32" 4K USB-C Hub Monitor',
    fromUserId: 'usr-emp-1',
    fromUserName: 'David Chen',
    toUserId: 'usr-emp-3',
    toUserName: 'Alex Rivera',
    departmentId: 'dept-dsn',
    departmentName: 'Product & UX Design Studio',
    status: 'Requested',
    requestDate: '2026-10-30 10:20 AM',
    reason: 'Urgent color-critical calibration needed for mobile app design sprint.',
  },
]

export const INITIAL_BOOKINGS: ResourceBooking[] = [
  {
    id: 'bkg-1',
    resourceId: 'ast-4',
    resourceName: 'Conference Room Horizon A',
    categoryName: 'Executive & Conference Rooms',
    bookedByUserId: 'usr-dept-1',
    bookedByUserName: 'Sarah Jenkins',
    bookedByUserAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    date: '2026-10-30',
    startTime: '14:00',
    endTime: '16:00',
    purpose: 'Core Architecture & Sprint Retrospective',
    status: 'Ongoing',
    location: 'HQ Building 1 - Level 2',
  },
  {
    id: 'bkg-2',
    resourceId: 'ast-4',
    resourceName: 'Conference Room Horizon A',
    categoryName: 'Executive & Conference Rooms',
    bookedByUserId: 'usr-emp-1',
    bookedByUserName: 'David Chen',
    bookedByUserAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    date: '2026-10-30',
    startTime: '10:00',
    endTime: '11:30',
    purpose: 'Backend Sync & Code Review',
    status: 'Completed',
    location: 'HQ Building 1 - Level 2',
  },
  {
    id: 'bkg-3',
    resourceId: 'ast-5',
    resourceName: 'Executive Boardroom Orion',
    categoryName: 'Executive & Conference Rooms',
    bookedByUserId: 'usr-admin-1',
    bookedByUserName: 'Eleanor Vance',
    bookedByUserAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    date: '2026-10-30',
    startTime: '16:30',
    endTime: '18:00',
    purpose: 'Executive Operations Briefing',
    status: 'Upcoming',
    location: 'HQ Tower - Penthouse Floor',
  },
  {
    id: 'bkg-4',
    resourceId: 'ast-6',
    resourceName: 'Tesla Model Y Long Range (Corporate Fleet #02)',
    categoryName: 'Corporate Fleet & Transport Vehicles',
    bookedByUserId: 'usr-emp-2',
    bookedByUserName: 'Elena Rostova',
    bookedByUserAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    date: '2026-10-30',
    startTime: '12:00',
    endTime: '14:30',
    purpose: 'Hardware delivery to Equinix Co-location site',
    status: 'Ongoing',
    location: 'Basement Parking Bay B-12',
  },
  {
    id: 'bkg-5',
    resourceId: 'ast-7',
    resourceName: 'Keysight Infiniium 500MHz 4-Ch Oscilloscope',
    categoryName: 'Specialized Hardware Lab Test Benches',
    bookedByUserId: 'usr-emp-4',
    bookedByUserName: 'Priyah Patel',
    bookedByUserAvatar: 'https://images.unsplash.com/photo-1534751516642-a171edd25218?w=150&auto=format&fit=crop&q=80',
    date: '2026-10-30',
    startTime: '09:00',
    endTime: '11:00',
    purpose: 'SPI Bus Signal Integrity Analysis',
    status: 'Completed',
    location: 'R&D Hardware Bench #04',
  },
  {
    id: 'bkg-6',
    resourceId: 'ast-11',
    resourceName: 'Soundproof Focus Pod Gamma (1-Person Video Booth)',
    categoryName: 'Executive & Conference Rooms',
    bookedByUserId: 'usr-emp-3',
    bookedByUserName: 'Alex Rivera',
    bookedByUserAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    date: '2026-10-30',
    startTime: '13:00',
    endTime: '15:00',
    purpose: 'Remote User Research Interview with FinTech Client',
    status: 'Ongoing',
    location: 'HQ Building 2 - Level 1 (Atrium West)',
  },
  {
    id: 'bkg-7',
    resourceId: 'ast-11',
    resourceName: 'Soundproof Focus Pod Gamma (1-Person Video Booth)',
    categoryName: 'Executive & Conference Rooms',
    bookedByUserId: 'usr-mgr-1',
    bookedByUserName: 'Marcus Sterling',
    bookedByUserAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    date: '2026-10-30',
    startTime: '16:00',
    endTime: '17:30',
    purpose: 'Vendor Hardware Procurement Alignment',
    status: 'Upcoming',
    location: 'HQ Building 2 - Level 1 (Atrium West)',
  },
  {
    id: 'bkg-8',
    resourceId: 'ast-6',
    resourceName: 'Tesla Model Y Long Range (Corporate Fleet #02)',
    categoryName: 'Corporate Fleet & Transport Vehicles',
    bookedByUserId: 'usr-dept-1',
    bookedByUserName: 'Sarah Jenkins',
    bookedByUserAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    date: '2026-10-30',
    startTime: '15:30',
    endTime: '17:00',
    purpose: 'Transit to Offsite Data Infrastructure Meeting',
    status: 'Upcoming',
    location: 'Basement Parking Bay B-12',
  },
  {
    id: 'bkg-9',
    resourceId: 'ast-13',
    resourceName: 'Rohde & Schwarz RF Vector Signal Generator (Bench #02)',
    categoryName: 'Specialized Hardware Lab Test Benches',
    bookedByUserId: 'usr-emp-4',
    bookedByUserName: 'Priyah Patel',
    bookedByUserAvatar: 'https://images.unsplash.com/photo-1534751516642-a171edd25218?w=150&auto=format&fit=crop&q=80',
    date: '2026-10-30',
    startTime: '11:00',
    endTime: '13:30',
    purpose: '5.8GHz ISM Band Power Amplifier Characterization',
    status: 'Completed',
    location: 'R&D RF Screening Lab Bench #02',
  },
  {
    id: 'bkg-10',
    resourceId: 'ast-12',
    resourceName: 'Ford E-Transit Electric Cargo Van #01',
    categoryName: 'Corporate Fleet & Transport Vehicles',
    bookedByUserId: 'usr-emp-1',
    bookedByUserName: 'David Chen',
    bookedByUserAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    date: '2026-10-30',
    startTime: '09:30',
    endTime: '12:00',
    purpose: 'Server rack chassis transfer to auxiliary warehouse',
    status: 'Cancelled',
    location: 'HQ Loading Dock Bay 03',
  },
]

export const INITIAL_ELEVATION_LOGS: RoleElevationLog[] = [
  {
    id: 'elv-1',
    employeeId: 'usr-mgr-1',
    employeeName: 'Marcus Sterling',
    previousRole: 'employee',
    newRole: 'asset_manager',
    elevatedBy: 'Eleanor Vance (Admin)',
    reason: 'Appointed Lead Custodian for IT asset expansion and automated QR tagging.',
    timestamp: '2023-01-10 09:30 AM',
  },
  {
    id: 'elv-2',
    employeeId: 'usr-dept-1',
    employeeName: 'Sarah Jenkins',
    previousRole: 'employee',
    newRole: 'department_head',
    elevatedBy: 'Eleanor Vance (Admin)',
    reason: 'Promoted to VP of Engineering; full sign-off authority on hardware allocations.',
    timestamp: '2022-11-04 14:15 PM',
  },
]

export const INITIAL_ACTIVITY_LOGS: ActivityLogItem[] = [
  {
    id: 'act-1',
    timestamp: '2026-10-30 14:15',
    relativeTime: '15 mins ago',
    category: 'allocation',
    action: 'Asset Returned & Checked In',
    actorId: 'usr-mgr-1',
    actorName: 'Marcus Sterling',
    actorRole: 'asset_manager',
    actorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    assetId: 'ast-2',
    assetTag: 'AF-0002',
    assetName: 'Dell UltraSharp 32" 4K USB-C Hub Monitor',
    previousState: 'Allocated',
    newState: 'Available',
    notes: 'Unit returned in pristine condition with USB-C and power cables verified.',
    ipAddress: '192.168.1.104',
    immutableHash: 'sha256-8f92a101ce6b4e9f',
  },
  {
    id: 'act-2',
    timestamp: '2026-10-30 13:40',
    relativeTime: '50 mins ago',
    category: 'transfer',
    action: 'Transfer Request Authorized',
    actorId: 'usr-dept-1',
    actorName: 'Sarah Jenkins',
    actorRole: 'department_head',
    actorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    assetId: 'ast-2',
    assetTag: 'AF-0002',
    assetName: 'Dell UltraSharp 32" 4K USB-C Hub Monitor',
    previousState: 'Requested (Sarah Jenkins)',
    newState: 'Approved & Re-allocated (Alex Rivera)',
    notes: 'Approved peer-to-peer transfer for Product Design sprint support.',
    ipAddress: '192.168.1.182',
    immutableHash: 'sha256-4b819e917d2a84cb',
  },
  {
    id: 'act-3',
    timestamp: '2026-10-30 12:30',
    relativeTime: '2 hours ago',
    category: 'maintenance',
    action: 'Technician Dispatched & Asset Locked',
    actorId: 'usr-mgr-1',
    actorName: 'Marcus Sterling',
    actorRole: 'asset_manager',
    actorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    assetId: 'ast-3',
    assetTag: 'AF-0003',
    assetName: 'Dell PowerEdge R750xs 2U Rack Server',
    previousState: 'Available',
    newState: 'Under Maintenance',
    notes: 'Dispatched Apex Enterprise Field Engineering for secondary PSU replacement. Asset allocation locked.',
    ipAddress: '192.168.1.104',
    immutableHash: 'sha256-12c8a90184bdf721',
  },
  {
    id: 'act-4',
    timestamp: '2026-10-30 11:20',
    relativeTime: '3 hours ago',
    category: 'booking',
    action: 'Shared Resource Reserved',
    actorId: 'usr-dept-1',
    actorName: 'Sarah Jenkins',
    actorRole: 'department_head',
    actorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    assetId: 'ast-4',
    assetTag: 'AF-0004',
    assetName: 'Conference Room Horizon A',
    previousState: 'Available',
    newState: 'Ongoing Reservation',
    notes: 'Reserved 14:00 - 16:00 for Core Architecture & Sprint Retrospective.',
    ipAddress: '192.168.1.182',
    immutableHash: 'sha256-9a2c74810de8319f',
  },
  {
    id: 'act-5',
    timestamp: '2026-10-30 10:15',
    relativeTime: '4 hours ago',
    category: 'allocation',
    action: 'Double-Allocation Conflict Intercepted',
    actorId: 'usr-emp-1',
    actorName: 'David Chen',
    actorRole: 'employee',
    actorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    assetId: 'ast-8',
    assetTag: 'AF-0008',
    assetName: 'ThinkPad P16 Gen 2 Mobile Workstation',
    previousState: 'Allocated (Sarah Jenkins)',
    newState: 'Blocked by Policy (Triggered Transfer Request)',
    notes: 'Deterministic conflict engine intercepted double-allocation attempt. Initiated Transfer Request TRF-102.',
    ipAddress: '192.168.1.205',
    immutableHash: 'sha256-55e1a90c884fa091',
  },
  {
    id: 'act-6',
    timestamp: '2026-10-30 09:10',
    relativeTime: '5 hours ago',
    category: 'audit',
    action: 'Physical Discrepancy Flagged: Missing',
    actorId: 'usr-dept-1',
    actorName: 'Sarah Jenkins',
    actorRole: 'department_head',
    actorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    assetId: 'ast-10',
    assetTag: 'AF-0010',
    assetName: 'Sony FE 70-200mm f/2.8 GM OSS II Lens Kit',
    previousState: 'Verified in Custody',
    newState: 'Missing (Discrepancy Exception)',
    notes: 'Cabinet A-12 empty during physical verification. Flagged for auto-transition to Lost upon cycle close.',
    ipAddress: '192.168.1.182',
    immutableHash: 'sha256-78b19284cf10a902',
  },
  {
    id: 'act-7',
    timestamp: '2026-10-29 16:30',
    relativeTime: 'Yesterday',
    category: 'security',
    action: 'Employee Role Elevated to Asset Manager',
    actorId: 'usr-admin-1',
    actorName: 'Eleanor Vance',
    actorRole: 'admin',
    actorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    previousState: 'employee',
    newState: 'asset_manager',
    notes: 'Promoted Marcus Sterling to oversee enterprise infrastructure fleet and audit lifecycles.',
    ipAddress: '192.168.1.10',
    immutableHash: 'sha256-33d8a10101e928cf',
  },
  {
    id: 'act-8',
    timestamp: '2026-10-29 14:15',
    relativeTime: 'Yesterday',
    category: 'maintenance',
    action: 'Maintenance Ticket Resolved with Proof of Fix',
    actorId: 'usr-mgr-1',
    actorName: 'Marcus Sterling',
    actorRole: 'asset_manager',
    actorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    assetId: 'ast-2',
    assetTag: 'AF-0002',
    assetName: 'Dell UltraSharp 32" 4K USB-C Hub Monitor',
    previousState: 'Under Maintenance',
    newState: 'Available',
    notes: 'Updated scaler firmware to v2.01 and passed 4-hour burn-in stress test. Asset released to inventory.',
    ipAddress: '192.168.1.104',
    immutableHash: 'sha256-99cf8192a83109e2',
  },
  {
    id: 'act-9',
    timestamp: '2026-10-28 11:00',
    relativeTime: '2 days ago',
    category: 'registration',
    action: 'New Enterprise Asset Registered',
    actorId: 'usr-admin-1',
    actorName: 'Eleanor Vance',
    actorRole: 'admin',
    actorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    assetId: 'ast-13',
    assetTag: 'AF-0013',
    assetName: 'Rohde & Schwarz RF Vector Signal Generator (Bench #02)',
    previousState: 'Unregistered',
    newState: 'Available',
    notes: 'Auto-generated tag AF-0013. Commissioned in Specialized Hardware Lab Category with 3-year warranty.',
    ipAddress: '192.168.1.10',
    immutableHash: 'sha256-88a29104cb991201',
  },
  {
    id: 'act-10',
    timestamp: '2026-10-27 15:00',
    relativeTime: '3 days ago',
    category: 'audit',
    action: 'Audit Cycle Reconciled & Locked',
    actorId: 'usr-mgr-1',
    actorName: 'Marcus Sterling',
    actorRole: 'asset_manager',
    actorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    previousState: 'Active',
    newState: 'Locked',
    notes: 'Finalized AUD-2026-Q3-IT. 100% of datacenter server chassis verified with zero discrepancies.',
    ipAddress: '192.168.1.104',
    immutableHash: 'sha256-44bc910283cf9921',
  },
]

export const ROUTE_CONFIG: Record<AppRoute, { label: string; roles: UserRole[]; path: string }> = {
  dashboard: { label: 'Operational Dashboard', roles: ['admin', 'asset_manager', 'department_head', 'employee'], path: '/dashboard' },
  assets: { label: 'Asset Directory', roles: ['admin', 'asset_manager', 'department_head', 'employee'], path: '/assets' },
  allocations: { label: 'Allocations & Transfers', roles: ['admin', 'asset_manager', 'department_head', 'employee'], path: '/allocations' },
  bookings: { label: 'Resource Booking', roles: ['admin', 'asset_manager', 'department_head', 'employee'], path: '/bookings' },
  maintenance: { label: 'Maintenance Hub', roles: ['admin', 'asset_manager', 'department_head', 'employee'], path: '/maintenance' },
  audits: { label: 'Physical Audits', roles: ['admin', 'asset_manager', 'department_head'], path: '/audits' },
  reports: { label: 'Reports & Analytics', roles: ['admin', 'asset_manager', 'department_head'], path: '/reports' },
  'org-setup': { label: 'Organization Setup', roles: ['admin'], path: '/org-setup' },
  activity: { label: 'Activity Audit Trail', roles: ['admin', 'asset_manager', 'department_head', 'employee'], path: '/activity' },
  auth: { label: 'Authentication', roles: ['admin', 'asset_manager', 'department_head', 'employee'], path: '/auth' },
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Overdue Asset Alert',
    message: 'AF-LAP-0412 (MacBook Pro M3) by Alex Rivera is 2 days past return date.',
    timestamp: '12m ago',
    type: 'alert',
    read: false,
    urgency: 'high',
    targetRoute: 'allocations',
  },
  {
    id: 'notif-2',
    title: 'Transfer Approval Required',
    message: 'Sarah Jenkins requested transfer of 4K Reference Monitor to Design Studio.',
    timestamp: '45m ago',
    type: 'approval',
    read: false,
    urgency: 'medium',
    targetRoute: 'allocations',
  },
  {
    id: 'notif-3',
    title: 'Maintenance Status Update',
    message: 'Ticket #MNT-891: Server Room AC unit status updated to "Technician Assigned".',
    timestamp: '2h ago',
    type: 'maintenance',
    read: false,
    urgency: 'low',
    targetRoute: 'maintenance',
  },
  {
    id: 'notif-4',
    title: 'Upcoming Scheduled Audit',
    message: 'Quarterly Physical Audit cycle begins in 3 days for Department: Engineering.',
    timestamp: '5h ago',
    type: 'info',
    read: true,
    urgency: 'low',
    targetRoute: 'audits',
  },
]

interface AppContextType {
  currentUser: User
  setCurrentUser: (user: User) => void
  users: User[]
  switchRole: (role: UserRole) => void
  currentRoute: AppRoute
  setCurrentRoute: (route: AppRoute) => void
  breadcrumbs: BreadcrumbItem[]
  setBreadcrumbs: (crumbs: BreadcrumbItem[]) => void
  sidebarCollapsed: boolean
  setSidebarCollapsed: (collapsed: boolean | ((prev: boolean) => boolean)) => void
  notifications: NotificationItem[]
  unreadCount: number
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  isNotificationDrawerOpen: boolean
  setIsNotificationDrawerOpen: (isOpen: boolean) => void
  isRoleSwitcherOpen: boolean
  setIsRoleSwitcherOpen: (isOpen: boolean) => void
  canAccessRoute: (route: AppRoute) => boolean
  // Org Setup methods
  departments: Department[]
  addDepartment: (dept: Omit<Department, 'id' | 'memberCount' | 'allocatedAssetCount'>) => void
  updateDepartment: (id: string, updates: Partial<Department>) => void
  toggleDepartmentStatus: (id: string) => void
  categories: AssetCategory[]
  addCategory: (cat: Omit<AssetCategory, 'id' | 'assetCount'>) => void
  updateCategory: (id: string, updates: Partial<AssetCategory>) => void
  elevationLogs: RoleElevationLog[]
  elevateEmployeeRole: (userId: string, newRole: UserRole, reason: string) => void
  // Auth methods
  loginUser: (email: string) => boolean
  signupUser: (name: string, email: string, departmentId: string) => User
  // Operational methods
  assets: Asset[]
  registerAsset: (data: Omit<Asset, 'id' | 'tag'>) => Asset
  updateAssetStatus: (assetId: string, newStatus: AssetState, notes?: string) => void
  checkInAsset: (assetId: string, notes?: string) => void
  allocateAsset: (
    assetId: string,
    toUserId: string,
    expectedReturnDate: string,
    notes?: string
  ) => { success: boolean; conflict?: boolean; currentHolder?: User; error?: string }
  tickets: MaintenanceTicket[]
  createMaintenanceTicket: (data: Omit<MaintenanceTicket, 'id' | 'ticketNumber' | 'createdAt'>) => MaintenanceTicket
  updateTicketStatus: (
    ticketId: string,
    newStatus: MaintenanceStatus,
    options?: { technician?: string; notes?: string }
  ) => void
  transfers: TransferRequest[]
  requestTransfer: (assetId: string, toUserId: string, reason: string) => TransferRequest
  approveTransfer: (transferId: string) => void
  rejectTransfer: (transferId: string, reason?: string) => void
  bookings: ResourceBooking[]
  bookResource: (data: Omit<ResourceBooking, 'id'>) => { success: boolean; error?: string }
  cancelBooking: (bookingId: string) => void
  rescheduleBooking: (
    bookingId: string,
    newDate: string,
    newStartTime: string,
    newEndTime: string
  ) => { success: boolean; error?: string }
  updateBookingStatus: (bookingId: string, newStatus: BookingStatus) => void
  // Audit module methods
  auditCycles: AuditCycle[]
  createAuditCycle: (
    data: Omit<AuditCycle, 'id' | 'cycleCode' | 'status' | 'items'>
  ) => AuditCycle
  updateAuditItemStatus: (
    cycleId: string,
    itemId: string,
    status: AuditStatus,
    notes?: string
  ) => void
  lockAndCloseAuditCycle: (
    cycleId: string
  ) => { success: boolean; missingCount: number }
  // Activity audit trail methods
  activityLogs: ActivityLogItem[]
  addActivityLog: (log: Omit<ActivityLogItem, 'id' | 'timestamp' | 'relativeTime' | 'immutableHash'>) => void
  // Asset management CRUD & DB Reset
  updateAsset: (id: string, updates: Partial<Asset>) => void
  deleteAsset: (id: string) => void
  resetDatabase: () => void
  clearDatabase: () => void
  // Toast notifications
  toasts: ToastMessage[]
  addToast: (message: string, type?: 'success' | 'info' | 'warning' | 'error', durationMs?: number) => void
  removeToast: (id: string) => void
  // Global Modals & Command Palette
  isCommandPaletteOpen: boolean
  setIsCommandPaletteOpen: (open: boolean) => void
  isRegisterAssetOpen: boolean
  setIsRegisterAssetOpen: (open: boolean) => void
  isBookResourceOpen: boolean
  setIsBookResourceOpen: (open: boolean) => void
  isRaiseMaintenanceOpen: boolean
  setIsRaiseMaintenanceOpen: (open: boolean) => void
  detailAsset: Asset | null
  setDetailAsset: (asset: Asset | null) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => loadStorage('users', INITIAL_USERS))
  const [currentUser, setCurrentUser] = useState<User>(() => loadStorage('currentUser', INITIAL_USERS[0]))
  const [departments, setDepartments] = useState<Department[]>(() => loadStorage('departments', INITIAL_DEPARTMENTS))
  const [categories, setCategories] = useState<AssetCategory[]>(() => loadStorage('categories', INITIAL_CATEGORIES))
  const [elevationLogs, setElevationLogs] = useState<RoleElevationLog[]>(() => loadStorage('elevationLogs', INITIAL_ELEVATION_LOGS))
  const [assets, setAssets] = useState<Asset[]>(() => loadStorage('assets', INITIAL_ASSETS))
  const [tickets, setTickets] = useState<MaintenanceTicket[]>(() => loadStorage('tickets', INITIAL_TICKETS))
  const [transfers, setTransfers] = useState<TransferRequest[]>(() => loadStorage('transfers', INITIAL_TRANSFERS))
  const [bookings, setBookings] = useState<ResourceBooking[]>(() => loadStorage('bookings', INITIAL_BOOKINGS))
  const [auditCycles, setAuditCycles] = useState<AuditCycle[]>(() => loadStorage('auditCycles', INITIAL_AUDIT_CYCLES))
  const [activityLogs, setActivityLogs] = useState<ActivityLogItem[]>(() => loadStorage('activityLogs', INITIAL_ACTIVITY_LOGS))
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => loadStorage('notifications', INITIAL_NOTIFICATIONS))

  const [toasts, setToasts] = useState<ToastMessage[]>([])
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false)
  const [isRegisterAssetOpen, setIsRegisterAssetOpen] = useState(false)
  const [isBookResourceOpen, setIsBookResourceOpen] = useState(false)
  const [isRaiseMaintenanceOpen, setIsRaiseMaintenanceOpen] = useState(false)
  const [detailAsset, setDetailAsset] = useState<Asset | null>(null)

  // LocalStorage state synchronizer
  useEffect(() => { saveStorage('users', users) }, [users])
  useEffect(() => { saveStorage('currentUser', currentUser) }, [currentUser])
  useEffect(() => { saveStorage('departments', departments) }, [departments])
  useEffect(() => { saveStorage('categories', categories) }, [categories])
  useEffect(() => { saveStorage('elevationLogs', elevationLogs) }, [elevationLogs])
  useEffect(() => { saveStorage('assets', assets) }, [assets])
  useEffect(() => { saveStorage('tickets', tickets) }, [tickets])
  useEffect(() => { saveStorage('transfers', transfers) }, [transfers])
  useEffect(() => { saveStorage('bookings', bookings) }, [bookings])
  useEffect(() => { saveStorage('auditCycles', auditCycles) }, [auditCycles])
  useEffect(() => { saveStorage('activityLogs', activityLogs) }, [activityLogs])
  useEffect(() => { saveStorage('notifications', notifications) }, [notifications])

  // --- Python Flask Backend Initial Synchronizer ---
  useEffect(() => {
    assetFlowApi.isOnline().then((online) => {
      if (online) {
        assetFlowApi.getAssets().then((remoteAssets) => {
          if (remoteAssets && remoteAssets.length > 0) {
            setAssets(remoteAssets)
          }
        })
        assetFlowApi.getTickets().then((remoteTickets) => {
          if (remoteTickets && remoteTickets.length > 0) {
            setTickets(remoteTickets)
          }
        })
        assetFlowApi.getBookings().then((remoteBookings) => {
          if (remoteBookings && remoteBookings.length > 0) {
            setBookings(remoteBookings)
          }
        })
        addToast('Connected to Python Flask SQLite backend (http://localhost:5001)', 'success', 3500)
      }
    })
  }, [])
  const [currentRoute, setCurrentRouteState] = useState<AppRoute>('dashboard')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState(false)
  const [isRoleSwitcherOpen, setIsRoleSwitcherOpen] = useState(false)
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([
    { label: 'AssetFlow' },
    { label: 'Operational Dashboard', route: 'dashboard' },
  ])

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#/', '').replace('#', '') as AppRoute
      if (hash && ROUTE_CONFIG[hash]) {
        setCurrentRouteState(hash)
      }
    }
    window.addEventListener('hashchange', handleHashChange)
    handleHashChange()
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  const setCurrentRoute = (route: AppRoute) => {
    setCurrentRouteState(route)
    window.location.hash = `#/${route}`
  }

  const switchRole = (role: UserRole) => {
    const targetUser = users.find((u) => u.role === role) || users[0]
    setCurrentUser(targetUser)

    const allowed = ROUTE_CONFIG[currentRoute]?.roles.includes(role)
    if (!allowed) {
      setCurrentRoute('dashboard')
    }
  }

  const canAccessRoute = (route: AppRoute): boolean => {
    const config = ROUTE_CONFIG[route]
    if (!config) return false
    return config.roles.includes(currentUser.role)
  }

  useEffect(() => {
    const config = ROUTE_CONFIG[currentRoute]
    setBreadcrumbs([
      { label: 'AssetFlow', route: 'dashboard' },
      { label: config ? config.label : 'Screen' },
    ])
  }, [currentRoute])

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  // --- Toast Notification Engine ---
  const addToast = (
    message: string,
    type: 'success' | 'info' | 'warning' | 'error' = 'success',
    durationMs: number = 3500
  ) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      removeToast(id)
    }, durationMs)
  }

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  // --- Reset Database to Demo State ---
  const resetDatabase = () => {
    if (typeof window !== 'undefined') {
      try {
        const keysToRemove = Object.keys(localStorage).filter((k) => k.startsWith(STORAGE_PREFIX))
        keysToRemove.forEach((k) => localStorage.removeItem(k))
      } catch (e) {
        console.error(e)
      }
    }
    setUsers(INITIAL_USERS)
    setCurrentUser(INITIAL_USERS[0])
    setDepartments(INITIAL_DEPARTMENTS)
    setCategories(INITIAL_CATEGORIES)
    setElevationLogs(INITIAL_ELEVATION_LOGS)
    setAssets(INITIAL_ASSETS)
    setTickets(INITIAL_TICKETS)
    setTransfers(INITIAL_TRANSFERS)
    setBookings(INITIAL_BOOKINGS)
    setAuditCycles(INITIAL_AUDIT_CYCLES)
    setActivityLogs(INITIAL_ACTIVITY_LOGS)
    setNotifications(INITIAL_NOTIFICATIONS)
    assetFlowApi.resetDatabase()
    addToast('Database reset to clean demo state', 'info')
  }

  const clearDatabase = async () => {
    await assetFlowApi.clearDatabase()
    setAssets([])
    setTickets([])
    setBookings([])
    setTransfers([])
    addToast('All demo records cleared — Clean zero-state database', 'info', 4000)
  }

  // --- Asset Management CRUD ---
  const updateAsset = (id: string, updates: Partial<Asset>) => {
    setAssets((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updates } : a))
    )
    assetFlowApi.updateAsset(id, updates)
    const target = assets.find((a) => a.id === id)
    addActivityLog({
      category: 'registration',
      action: 'Asset Details Updated',
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      actorAvatar: currentUser.avatar,
      assetId: id,
      assetTag: target?.tag,
      assetName: updates.name || target?.name,
      notes: `Asset attributes updated (${Object.keys(updates).join(', ')})`,
    })
    addToast(`Asset ${target?.tag || id} updated successfully`, 'success')
  }

  const deleteAsset = (id: string) => {
    const target = assets.find((a) => a.id === id)
    setAssets((prev) => prev.filter((a) => a.id !== id))
    assetFlowApi.deleteAsset(id)
    addActivityLog({
      category: 'registration',
      action: 'Asset Decommissioned / Deleted',
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      actorAvatar: currentUser.avatar,
      assetId: id,
      assetTag: target?.tag,
      assetName: target?.name,
      notes: 'Asset removed from active inventory',
    })
    addToast(`Asset ${target?.tag || id} removed from inventory`, 'warning')
  }

  // --- Chronological Activity Audit Trail Engine ---
  const addActivityLog = (
    log: Omit<ActivityLogItem, 'id' | 'timestamp' | 'relativeTime' | 'immutableHash'>
  ) => {
    const newLog: ActivityLogItem = {
      ...log,
      id: `act-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      relativeTime: 'Just now',
      immutableHash: `sha256-${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}`,
    }

    setActivityLogs((prev) => [newLog, ...prev])
  }

  // --- Org Setup Handlers ---
  const addDepartment = (dept: Omit<Department, 'id' | 'memberCount' | 'allocatedAssetCount'>) => {
    const newDept: Department = {
      ...dept,
      id: `dept-${Date.now().toString().slice(-4)}`,
      memberCount: 1,
      allocatedAssetCount: 0,
    }
    setDepartments((prev) => [...prev, newDept])
  }

  const updateDepartment = (id: string, updates: Partial<Department>) => {
    setDepartments((prev) =>
      prev.map((d) => (d.id === id ? { ...d, ...updates } : d))
    )
  }

  const toggleDepartmentStatus = (id: string) => {
    setDepartments((prev) =>
      prev.map((d) => (d.id === id ? { ...d, isActive: !d.isActive } : d))
    )
  }

  const addCategory = (cat: Omit<AssetCategory, 'id' | 'assetCount'>) => {
    const newCat: AssetCategory = {
      ...cat,
      id: `cat-${Date.now().toString().slice(-4)}`,
      assetCount: 0,
    }
    setCategories((prev) => [...prev, newCat])
  }

  const updateCategory = (id: string, updates: Partial<AssetCategory>) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    )
  }

  const elevateEmployeeRole = (userId: string, newRole: UserRole, reason: string) => {
    const targetUser = users.find((u) => u.id === userId)
    if (!targetUser) return

    const previousRole = targetUser.role

    const updatedUsers = users.map((u) => {
      if (u.id === userId) {
        return { ...u, role: newRole }
      }
      return u
    })
    setUsers(updatedUsers)

    if (currentUser.id === userId) {
      setCurrentUser({ ...currentUser, role: newRole })
    }

    const newLog: RoleElevationLog = {
      id: `elv-${Date.now()}`,
      employeeId: userId,
      employeeName: targetUser.name,
      previousRole,
      newRole,
      elevatedBy: `${currentUser.name} (${currentUser.role})`,
      reason: reason || 'Administrative elevation approved under executive protocol.',
      timestamp: new Date().toLocaleString([], {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }),
    }
    setElevationLogs((prev) => [newLog, ...prev])

    addActivityLog({
      category: 'security',
      action: 'Role Elevation Authorized',
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      actorAvatar: currentUser.avatar,
      previousState: previousRole,
      newState: newRole,
      notes: `${targetUser.name} elevated from ${previousRole} to ${newRole}. Reason: ${reason || 'Executive protocol'}`,
    })

    addToast(`Role elevation authorized: ${targetUser.name} is now ${newRole}`, 'success')

    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: 'Security: Role Elevation Applied',
      message: `${targetUser.name} elevated from ${previousRole} to ${newRole}. Reason: ${reason}`,
      timestamp: 'Just now',
      type: 'approval',
      read: false,
      urgency: 'medium',
      targetRoute: 'org-setup',
    }
    setNotifications((prev) => [newNotif, ...prev])
  }

  // --- Auth Handlers ---
  const loginUser = (email: string): boolean => {
    const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase())
    if (found) {
      setCurrentUser(found)
      setCurrentRoute('dashboard')
      return true
    }
    return false
  }

  const signupUser = (name: string, email: string, departmentId: string): User => {
    const dept = departments.find((d) => d.id === departmentId) || departments[0]
    const badgeNum = `AF-EMP-${Math.floor(100 + Math.random() * 900)}`
    
    const newUser: User = {
      id: `usr-${Date.now()}`,
      name,
      email,
      role: 'employee',
      department: dept.name,
      departmentId: dept.id,
      avatar: `https://images.unsplash.com/photo-1535713875002?w=150&auto=format&fit=crop&q=80`,
      title: 'Associate Staff Member',
      badgeNumber: badgeNum,
      joinDate: new Date().toISOString().split('T')[0],
      status: 'active',
    }

    setUsers((prev) => [...prev, newUser])
    setCurrentUser(newUser)
    setCurrentRoute('dashboard')
    return newUser
  }

  // --- Operational Methods ---
  const registerAsset = (data: Omit<Asset, 'id' | 'tag'>): Asset => {
    const nextNum = assets.length + 1
    const tag = `AF-${nextNum.toString().padStart(4, '0')}`
    const newAsset: Asset = {
      ...data,
      id: `ast-${Date.now()}`,
      tag,
      qrCode: `${tag}-QR`,
      commissionDate: new Date().toISOString().split('T')[0],
      allocationHistory: [],
    }

    setAssets((prev) => [newAsset, ...prev])
    assetFlowApi.createAsset(newAsset)

    setCategories((prev) =>
      prev.map((c) => (c.id === data.categoryId ? { ...c, assetCount: c.assetCount + 1 } : c))
    )
    setDepartments((prev) =>
      prev.map((d) => (d.id === data.departmentId ? { ...d, allocatedAssetCount: d.allocatedAssetCount + 1 } : d))
    )

    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: 'New Asset Registered',
        message: `${newAsset.name} registered under tag ${newAsset.tag} (${newAsset.status}).`,
        timestamp: 'Just now',
        type: 'info',
        read: false,
        urgency: 'low',
        targetRoute: 'assets',
      },
      ...prev,
    ])

    addActivityLog({
      category: 'registration',
      action: 'Asset Registered & Tagged',
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      actorAvatar: currentUser.avatar,
      assetId: newAsset.id,
      assetTag: newAsset.tag,
      assetName: newAsset.name,
      newState: newAsset.status,
      notes: `Commissioned under category ${newAsset.categoryName} (${newAsset.location})`,
    })

    addToast(`Asset ${newAsset.tag} registered successfully!`, 'success')

    return newAsset
  }

  const updateAssetStatus = (assetId: string, newStatus: AssetState, notes?: string) => {
    const targetAsset = assets.find((a) => a.id === assetId)
    setAssets((prev) =>
      prev.map((a) => (a.id === assetId ? { ...a, status: newStatus } : a))
    )

    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: 'Asset Status Updated',
        message: `Asset status transitioned to ${newStatus}.${notes ? ` Note: ${notes}` : ''}`,
        timestamp: 'Just now',
        type: 'info',
        read: false,
        urgency: 'low',
        targetRoute: 'assets',
      },
      ...prev,
    ])

    addActivityLog({
      category: 'allocation',
      action: 'Asset Status Updated',
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      actorAvatar: currentUser.avatar,
      assetId: assetId,
      assetTag: targetAsset?.tag,
      assetName: targetAsset?.name,
      previousState: targetAsset?.status,
      newState: newStatus,
      notes: notes || `State transitioned to ${newStatus}`,
    })
  }

  const checkInAsset = (assetId: string, notes?: string) => {
    const targetAsset = assets.find((a) => a.id === assetId)
    setAssets((prev) =>
      prev.map((a) => {
        if (a.id === assetId) {
          const completedHistory = a.currentHolderName
            ? [
                ...(a.allocationHistory || []),
                {
                  id: `ah-${Date.now()}`,
                  assetId: a.id,
                  holderId: a.currentHolderId || 'unknown',
                  holderName: a.currentHolderName,
                  departmentName: a.departmentName,
                  allocatedDate: a.allocatedDate || '2026-10-01',
                  returnedDate: new Date().toISOString().split('T')[0],
                  expectedReturnDate: a.expectedReturnDate,
                  conditionOnReturn: notes || 'Good',
                  notes: notes || 'Returned to inventory vault',
                },
              ]
            : a.allocationHistory || []

          return {
            ...a,
            status: 'Available',
            currentHolderId: undefined,
            currentHolderName: undefined,
            currentHolderAvatar: undefined,
            expectedReturnDate: undefined,
            allocatedDate: undefined,
            condition: notes ? 'Good' : a.condition,
            allocationHistory: completedHistory,
          }
        }
        return a
      })
    )

    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: 'Asset Checked In (Return Completed)',
        message: `Asset returned and automatically reverted to Available state.${notes ? ` Note: ${notes}` : ''}`,
        timestamp: 'Just now',
        type: 'info',
        read: false,
        urgency: 'low',
        targetRoute: 'assets',
      },
      ...prev,
    ])

    addActivityLog({
      category: 'allocation',
      action: 'Asset Checked In to Vault',
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      actorAvatar: currentUser.avatar,
      assetId: assetId,
      assetTag: targetAsset?.tag,
      assetName: targetAsset?.name,
      previousState: 'Allocated',
      newState: 'Available',
      notes: notes || 'Returned to central equipment vault in Good condition',
    })

    addToast(`Asset ${targetAsset?.tag || assetId} checked into vault (Available)`, 'success')
  }

  // --- Phase 5: Direct Allocation with Conflict Blocker ---
  const allocateAsset = (
    assetId: string,
    toUserId: string,
    expectedReturnDate: string,
    notes?: string
  ): { success: boolean; conflict?: boolean; currentHolder?: User; error?: string } => {
    const targetAsset = assets.find((a) => a.id === assetId)
    if (!targetAsset) return { success: false, error: 'Asset not found.' }

    if (targetAsset.status === 'Allocated') {
      const currentHolder = users.find((u) => u.id === targetAsset.currentHolderId)
      return {
        success: false,
        conflict: true,
        currentHolder,
        error: `Conflict! ${targetAsset.tag} is already allocated to ${targetAsset.currentHolderName || 'another employee'}. Direct double-allocation is prohibited.`,
      }
    }

    if (targetAsset.status === 'Under Maintenance' || targetAsset.status === 'Lost' || targetAsset.status === 'Retired' || targetAsset.status === 'Disposed') {
      return {
        success: false,
        error: `Cannot allocate asset in '${targetAsset.status}' condition. Asset must be in Available state.`,
      }
    }

    const recipient = users.find((u) => u.id === toUserId)
    if (!recipient) return { success: false, error: 'Recipient user not found.' }

    const todayStr = new Date().toISOString().split('T')[0]

    setAssets((prev) =>
      prev.map((a) => {
        if (a.id === assetId) {
          const newHistory = [
            ...(a.allocationHistory || []),
            {
              id: `ah-${Date.now()}`,
              assetId: a.id,
              holderId: recipient.id,
              holderName: recipient.name,
              departmentName: recipient.department,
              allocatedDate: todayStr,
              expectedReturnDate,
              notes: notes || 'Direct allocation authorized',
            },
          ]

          return {
            ...a,
            status: 'Allocated',
            currentHolderId: recipient.id,
            currentHolderName: recipient.name,
            currentHolderAvatar: recipient.avatar,
            allocatedDate: todayStr,
            expectedReturnDate,
            departmentId: recipient.departmentId || a.departmentId,
            departmentName: recipient.department,
            allocationHistory: newHistory,
          }
        }
        return a
      })
    )

    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: 'Asset Allocated',
        message: `${targetAsset.tag} allocated to ${recipient.name} (Return: ${expectedReturnDate}).`,
        timestamp: 'Just now',
        type: 'info',
        read: false,
        urgency: 'low',
        targetRoute: 'allocations',
      },
      ...prev,
    ])

    addActivityLog({
      category: 'allocation',
      action: 'Asset Allocated to Employee',
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      actorAvatar: currentUser.avatar,
      assetId: targetAsset.id,
      assetTag: targetAsset.tag,
      assetName: targetAsset.name,
      previousState: 'Available',
      newState: 'Allocated',
      notes: `Assigned to ${recipient.name} (${recipient.department}) until ${expectedReturnDate}`,
    })

    addToast(`Asset ${targetAsset.tag} allocated to ${recipient.name}`, 'success')

    return { success: true }
  }

  // --- Phase 5: Transfer Requests & Approval Queue ---
  const requestTransfer = (
    assetId: string,
    toUserId: string,
    reason: string
  ): TransferRequest => {
    const targetAsset = assets.find((a) => a.id === assetId)
    const recipient = users.find((u) => u.id === toUserId) || users[0]
    const fromHolder = users.find((u) => u.id === targetAsset?.currentHolderId) || users[0]

    const newTransfer: TransferRequest = {
      id: `trf-${Date.now()}`,
      assetId,
      assetTag: targetAsset?.tag || 'AF-0000',
      assetName: targetAsset?.name || 'Hardware Unit',
      fromUserId: fromHolder.id,
      fromUserName: fromHolder.name,
      toUserId: recipient.id,
      toUserName: recipient.name,
      departmentId: recipient.departmentId || 'dept-eng',
      departmentName: recipient.department,
      status: 'Requested',
      requestDate: new Date().toLocaleString([], {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }),
      reason: reason || 'Transfer requested via peer-to-peer workflow.',
    }

    setTransfers((prev) => [newTransfer, ...prev])

    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: 'Transfer Request Submitted',
        message: `${newTransfer.assetTag}: ${fromHolder.name} &rarr; ${recipient.name}. Awaiting Dept Head approval.`,
        timestamp: 'Just now',
        type: 'approval',
        read: false,
        urgency: 'medium',
        targetRoute: 'allocations',
      },
      ...prev,
    ])

    addActivityLog({
      category: 'transfer',
      action: 'Peer-to-Peer Transfer Requested',
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      actorAvatar: currentUser.avatar,
      assetId: newTransfer.assetId,
      assetTag: newTransfer.assetTag,
      assetName: newTransfer.assetName,
      previousState: 'Allocated',
      newState: 'Transfer Requested',
      notes: `From ${fromHolder.name} to ${recipient.name}. Reason: ${reason}`,
    })

    return newTransfer
  }

  const approveTransfer = (transferId: string) => {
    const trf = transfers.find((t) => t.id === transferId)
    if (!trf) return

    setTransfers((prev) =>
      prev.map((t) => (t.id === transferId ? { ...t, status: 'Re-allocated' } : t))
    )

    const recipient = users.find((u) => u.id === trf.toUserId)
    const todayStr = new Date().toISOString().split('T')[0]

    setAssets((prev) =>
      prev.map((a) => {
        if (a.id === trf.assetId) {
          const updatedHistory = (a.allocationHistory || []).map((h) => {
            if (!h.returnedDate) {
              return {
                ...h,
                returnedDate: todayStr,
                conditionOnReturn: 'Good',
                notes: `Transferred to ${trf.toUserName}`,
              }
            }
            return h
          })

          updatedHistory.push({
            id: `ah-${Date.now()}`,
            assetId: a.id,
            holderId: trf.toUserId,
            holderName: trf.toUserName,
            departmentName: trf.departmentName,
            allocatedDate: todayStr,
            expectedReturnDate: a.expectedReturnDate || '2026-11-15',
            notes: `Transfer approved from ${trf.fromUserName}`,
          })

          return {
            ...a,
            status: 'Allocated',
            currentHolderId: trf.toUserId,
            currentHolderName: trf.toUserName,
            currentHolderAvatar: recipient?.avatar || a.currentHolderAvatar,
            departmentId: trf.departmentId,
            departmentName: trf.departmentName,
            allocatedDate: todayStr,
            allocationHistory: updatedHistory,
          }
        }
        return a
      })
    )

    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: 'Transfer Request Approved',
        message: `${trf.assetTag} successfully re-allocated to ${trf.toUserName} (${trf.departmentName}).`,
        timestamp: 'Just now',
        type: 'approval',
        read: false,
        urgency: 'low',
        targetRoute: 'allocations',
      },
      ...prev,
    ])

    addActivityLog({
      category: 'transfer',
      action: 'Asset Transfer Approved',
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      actorAvatar: currentUser.avatar,
      assetId: trf.assetId,
      assetTag: trf.assetTag,
      assetName: trf.assetName,
      previousState: `Held by ${trf.fromUserName}`,
      newState: `Re-allocated to ${trf.toUserName}`,
      notes: `Transfer approved by ${currentUser.name} for ${trf.departmentName}`,
    })

    addToast(`Transfer approved: ${trf.assetTag} assigned to ${trf.toUserName}`, 'success')
  }

  const rejectTransfer = (transferId: string, reason?: string) => {
    const trf = transfers.find((t) => t.id === transferId)
    if (!trf) return

    setTransfers((prev) =>
      prev.map((t) => (t.id === transferId ? { ...t, status: 'Rejected' } : t))
    )

    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: 'Transfer Request Declined',
        message: `Transfer for ${trf.assetTag} was declined by ${currentUser.name}.${reason ? ` Reason: ${reason}` : ''}`,
        timestamp: 'Just now',
        type: 'info',
        read: false,
        urgency: 'low',
        targetRoute: 'allocations',
      },
      ...prev,
    ])

    addActivityLog({
      category: 'transfer',
      action: 'Asset Transfer Rejected',
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      actorAvatar: currentUser.avatar,
      assetId: trf.assetId,
      assetTag: trf.assetTag,
      assetName: trf.assetName,
      notes: `Transfer declined by ${currentUser.name}.${reason ? ` Reason: ${reason}` : ''}`,
    })

    addToast(`Transfer request declined for ${trf.assetTag}`, 'warning')
  }

  const createMaintenanceTicket = (
    data: Omit<MaintenanceTicket, 'id' | 'ticketNumber' | 'createdAt'>
  ): MaintenanceTicket => {
    const ticketNumber = `MNT-${Math.floor(200 + Math.random() * 800)}`
    const newTicket: MaintenanceTicket = {
      ...data,
      id: `mnt-${Date.now()}`,
      ticketNumber,
      createdAt: new Date().toLocaleString([], {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }),
    }

    setTickets((prev) => [newTicket, ...prev])

    if (data.status === 'In Progress' || data.priority === 'Critical') {
      setAssets((prev) =>
        prev.map((a) => (a.id === data.assetId ? { ...a, status: 'Under Maintenance' } : a))
      )
    }

    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: `Maintenance Ticket ${ticketNumber} Raised`,
        message: `${data.assetTag} (${data.priority} priority): ${data.issueDescription}`,
        timestamp: 'Just now',
        type: 'maintenance',
        read: false,
        urgency: data.priority === 'Critical' ? 'high' : 'medium',
        targetRoute: 'maintenance',
      },
      ...prev,
    ])

    addActivityLog({
      category: 'maintenance',
      action: 'Maintenance Ticket Created',
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      actorAvatar: currentUser.avatar,
      assetId: data.assetId,
      assetTag: data.assetTag,
      assetName: data.assetName,
      previousState: 'Active',
      newState: 'Under Maintenance',
      notes: `Ticket ${newTicket.ticketNumber} (${data.priority}): ${data.issueDescription}`,
    })

    addToast(`Ticket ${newTicket.ticketNumber} raised for ${data.assetTag} (${data.priority} priority)`, 'info')

    return newTicket
  }

  const updateTicketStatus = (
    ticketId: string,
    newStatus: MaintenanceStatus,
    options?: { technician?: string; notes?: string }
  ) => {
    const currentTicket = tickets.find((t) => t.id === ticketId)
    if (!currentTicket) return

    setTickets((prev) =>
      prev.map((t) => {
        if (t.id === ticketId) {
          return {
            ...t,
            status: newStatus,
            ...(options?.technician ? { assignedTechnician: options.technician } : {}),
            ...(options?.notes ? { resolutionNotes: options.notes } : {}),
            ...(newStatus === 'Resolved'
              ? {
                  resolvedAt: new Date().toLocaleString([], {
                    year: 'numeric',
                    month: 'short',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  }),
                }
              : {}),
          }
        }
        return t
      })
    )

    // Coupled Asset State transitions:
    if (newStatus === 'In Progress' || newStatus === 'Assigned') {
      setAssets((prev) =>
        prev.map((a) =>
          a.id === currentTicket.assetId
            ? { ...a, status: 'Under Maintenance', condition: 'Maintenance Required' }
            : a
        )
      )
    } else if (newStatus === 'Resolved') {
      setAssets((prev) =>
        prev.map((a) =>
          a.id === currentTicket.assetId
            ? { ...a, status: 'Available', condition: 'Good' }
            : a
        )
      )
    } else if (newStatus === 'Rejected') {
      setAssets((prev) =>
        prev.map((a) =>
          a.id === currentTicket.assetId && a.status === 'Under Maintenance'
            ? { ...a, status: 'Available' }
            : a
        )
      )
    }

    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: `Maintenance Ticket ${currentTicket.ticketNumber} Updated`,
        message: `Status moved to "${newStatus}" for asset ${currentTicket.assetTag}.`,
        timestamp: 'Just now',
        type: 'maintenance',
        read: false,
        urgency: newStatus === 'Resolved' ? 'low' : 'medium',
        targetRoute: 'maintenance',
      },
      ...prev,
    ])

    addActivityLog({
      category: 'maintenance',
      action: `Ticket Status: ${newStatus}`,
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      actorAvatar: currentUser.avatar,
      assetId: currentTicket.assetId,
      assetTag: currentTicket.assetTag,
      assetName: currentTicket.assetName,
      previousState: currentTicket.status,
      newState: newStatus,
      notes: `Ticket ${currentTicket.ticketNumber} updated to ${newStatus}.${options?.notes ? ` Note: ${options.notes}` : ''}`,
    })

    addToast(`Ticket #${currentTicket.ticketNumber} updated to "${newStatus}"`, 'info')
  }

  // --- Phase 7: Asset Audit Cycles Engine ---
  const createAuditCycle = (
    data: Omit<AuditCycle, 'id' | 'cycleCode' | 'status' | 'items'>
  ): AuditCycle => {
    const code = `AUD-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`

    // Scope assets matching department
    const matchingAssets = assets.filter((a) => {
      if (data.departmentId && data.departmentId !== 'all' && a.departmentId !== data.departmentId) {
        return false
      }
      return true
    })

    const items: AuditItem[] = matchingAssets.map((a, idx) => ({
      id: `aud-item-${Date.now()}-${idx}`,
      cycleId: `aud-${Date.now()}`,
      assetId: a.id,
      assetTag: a.tag,
      assetName: a.name,
      categoryName: a.categoryName,
      departmentName: a.departmentName,
      location: a.location,
      serialNumber: a.serialNumber,
      expectedHolderName: a.currentHolderName || 'Shared Dept Pool',
      status: 'Pending',
    }))

    const newCycle: AuditCycle = {
      ...data,
      id: `aud-${Date.now()}`,
      cycleCode: code,
      status: 'Active',
      items,
    }

    setAuditCycles((prev) => [newCycle, ...prev])

    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: `Audit Cycle ${code} Initiated`,
        message: `Targeting ${matchingAssets.length} assets across ${data.departmentName}. Lead: ${data.leadAuditorName}.`,
        timestamp: 'Just now',
        type: 'info',
        read: false,
        urgency: 'medium',
        targetRoute: 'audits',
      },
      ...prev,
    ])

    addActivityLog({
      category: 'audit',
      action: 'Physical Audit Cycle Initiated',
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      actorAvatar: currentUser.avatar,
      newState: 'Active',
      notes: `Audit cycle ${code} started for ${data.departmentName} (${matchingAssets.length} scoped assets). Lead: ${data.leadAuditorName}`,
    })

    return newCycle
  }

  const updateAuditItemStatus = (
    cycleId: string,
    itemId: string,
    status: AuditStatus,
    notes?: string
  ) => {
    setAuditCycles((prev) =>
      prev.map((c) => {
        if (c.id !== cycleId) return c
        const updatedItems = c.items.map((item) => {
          if (item.id === itemId) {
            return {
              ...item,
              status,
              notes: notes !== undefined ? notes : item.notes,
              auditedAt: new Date().toLocaleString([], {
                year: 'numeric',
                month: 'short',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
              }),
              auditedByUserName: currentUser.name,
            }
          }
          return item
        })
        return {
          ...c,
          items: updatedItems,
        }
      })
    )
  }

  const lockAndCloseAuditCycle = (
    cycleId: string
  ): { success: boolean; missingCount: number } => {
    const targetCycle = auditCycles.find((c) => c.id === cycleId)
    if (!targetCycle) return { success: false, missingCount: 0 }

    const missingItems = targetCycle.items.filter((item) => item.status === 'Missing')
    const damagedItems = targetCycle.items.filter((item) => item.status === 'Damaged')

    // Coupled asset state transition: Missing assets automatically marked 'Lost'
    const missingAssetIds = new Set(missingItems.map((i) => i.assetId))
    const damagedAssetIds = new Set(damagedItems.map((i) => i.assetId))

    if (missingAssetIds.size > 0 || damagedAssetIds.size > 0) {
      setAssets((prev) =>
        prev.map((a) => {
          if (missingAssetIds.has(a.id)) {
            return {
              ...a,
              status: 'Lost',
              location: 'Unknown - Flagged Missing in Physical Audit Cycle',
            }
          }
          if (damagedAssetIds.has(a.id)) {
            return {
              ...a,
              condition: 'Maintenance Required',
            }
          }
          return a
        })
      )
    }

    setAuditCycles((prev) =>
      prev.map((c) => {
        if (c.id === cycleId) {
          return {
            ...c,
            status: 'Locked',
            closedAt: new Date().toLocaleString([], {
              year: 'numeric',
              month: 'short',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
            }),
            discrepancyReportSummary: `Cycle finalized: ${missingItems.length} assets shifted to "Lost", ${damagedItems.length} marked Damaged.`,
          }
        }
        return c
      })
    )

    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: `Audit Cycle ${targetCycle.cycleCode} Locked`,
        message: `Cycle finalized. ${missingItems.length} missing assets automatically updated to "Lost" state.`,
        timestamp: 'Just now',
        type: 'alert',
        read: false,
        urgency: 'high',
        targetRoute: 'audits',
      },
      ...prev,
    ])

    addActivityLog({
      category: 'audit',
      action: 'Audit Cycle Locked & Finalized',
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      actorAvatar: currentUser.avatar,
      previousState: 'Active',
      newState: 'Locked',
      notes: `Audit cycle ${targetCycle.cycleCode} finalized with ${missingItems.length} missing and ${damagedItems.length} damaged assets.`,
    })

    addToast(`Audit cycle ${targetCycle.cycleCode} finalized and locked`, 'success')

    return { success: true, missingCount: missingItems.length }
  }

  // --- Phase 6: Resource Bookings & Overlap Prevention Engine ---
  const bookResource = (
    data: Omit<ResourceBooking, 'id'>
  ): { success: boolean; error?: string } => {
    const conflictingBooking = bookings.find((b) => {
      if (b.resourceId !== data.resourceId || b.date !== data.date || b.status === 'Cancelled') {
        return false
      }
      return data.startTime < b.endTime && data.endTime > b.startTime
    })

    if (conflictingBooking) {
      addToast(
        `Overlap detected: ${data.resourceName} is already reserved by ${conflictingBooking.bookedByUserName}`,
        'error',
        5000
      )
      return {
        success: false,
        error: `Schedule collision detected! Resource is already reserved by ${conflictingBooking.bookedByUserName} (${conflictingBooking.startTime} - ${conflictingBooking.endTime}) on ${data.date}. Overlap blocked.`,
      }
    }

    const newBooking: ResourceBooking = {
      ...data,
      id: `bkg-${Date.now()}`,
    }

    setBookings((prev) => [newBooking, ...prev])

    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: 'Resource Booking Confirmed',
        message: `${data.resourceName} reserved for ${data.date} (${data.startTime} - ${data.endTime}).`,
        timestamp: 'Just now',
        type: 'info',
        read: false,
        urgency: 'low',
        targetRoute: 'bookings',
      },
      ...prev,
    ])

    addActivityLog({
      category: 'booking',
      action: 'Resource Reserved',
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      actorAvatar: currentUser.avatar,
      assetName: data.resourceName,
      newState: 'Upcoming',
      notes: `Reserved ${data.resourceName} for ${data.date} (${data.startTime} - ${data.endTime}). Purpose: ${data.purpose}`,
    })

    addToast(`Resource ${data.resourceName} reserved for ${data.date}!`, 'success')

    return { success: true }
  }

  const cancelBooking = (bookingId: string) => {
    const bkg = bookings.find((b) => b.id === bookingId)
    if (!bkg) return

    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: 'Cancelled' } : b))
    )

    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: 'Booking Cancelled',
        message: `Reservation for ${bkg.resourceName} on ${bkg.date} was cancelled. Slot is now free.`,
        timestamp: 'Just now',
        type: 'info',
        read: false,
        urgency: 'low',
        targetRoute: 'bookings',
      },
      ...prev,
    ])

    addActivityLog({
      category: 'booking',
      action: 'Resource Reservation Cancelled',
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      actorAvatar: currentUser.avatar,
      assetName: bkg.resourceName,
      previousState: bkg.status,
      newState: 'Cancelled',
      notes: `Reservation for ${bkg.resourceName} on ${bkg.date} was cancelled.`,
    })

    addToast(`Reservation cancelled for ${bkg.resourceName}`, 'info')
  }

  const rescheduleBooking = (
    bookingId: string,
    newDate: string,
    newStartTime: string,
    newEndTime: string
  ): { success: boolean; error?: string } => {
    const currentBooking = bookings.find((b) => b.id === bookingId)
    if (!currentBooking) return { success: false, error: 'Booking not found.' }

    // Check collision excluding the booking itself
    const conflictingBooking = bookings.find((b) => {
      if (b.id === bookingId || b.resourceId !== currentBooking.resourceId || b.date !== newDate || b.status === 'Cancelled') {
        return false
      }
      return newStartTime < b.endTime && newEndTime > b.startTime
    })

    if (conflictingBooking) {
      addToast(`Collision detected: Slot reserved by ${conflictingBooking.bookedByUserName}`, 'error', 5000)
      return {
        success: false,
        error: `Reschedule blocked by temporal collision! Reserved by ${conflictingBooking.bookedByUserName} (${conflictingBooking.startTime} - ${conflictingBooking.endTime}) on ${newDate}.`,
      }
    }

    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId
          ? {
              ...b,
              date: newDate,
              startTime: newStartTime,
              endTime: newEndTime,
              status: 'Upcoming',
            }
          : b
      )
    )

    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: 'Booking Rescheduled',
        message: `${currentBooking.resourceName} rescheduled to ${newDate} (${newStartTime} - ${newEndTime}).`,
        timestamp: 'Just now',
        type: 'info',
        read: false,
        urgency: 'low',
        targetRoute: 'bookings',
      },
      ...prev,
    ])

    addActivityLog({
      category: 'booking',
      action: 'Resource Reservation Rescheduled',
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      actorAvatar: currentUser.avatar,
      assetName: currentBooking.resourceName,
      newState: 'Upcoming',
      notes: `Rescheduled ${currentBooking.resourceName} to ${newDate} (${newStartTime} - ${newEndTime}).`,
    })

    addToast(`Reservation rescheduled to ${newDate} (${newStartTime} - ${newEndTime})`, 'success')

    return { success: true }
  }

  const updateBookingStatus = (bookingId: string, newStatus: BookingStatus) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b))
    )
  }

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        users,
        switchRole,
        currentRoute,
        setCurrentRoute,
        breadcrumbs,
        setBreadcrumbs,
        sidebarCollapsed,
        setSidebarCollapsed,
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        isNotificationDrawerOpen,
        setIsNotificationDrawerOpen,
        isRoleSwitcherOpen,
        setIsRoleSwitcherOpen,
        canAccessRoute,
        departments,
        addDepartment,
        updateDepartment,
        toggleDepartmentStatus,
        categories,
        addCategory,
        updateCategory,
        elevationLogs,
        elevateEmployeeRole,
        loginUser,
        signupUser,
        assets,
        registerAsset,
        updateAssetStatus,
        checkInAsset,
        allocateAsset,
        tickets,
        createMaintenanceTicket,
        updateTicketStatus,
        transfers,
        requestTransfer,
        approveTransfer,
        rejectTransfer,
        bookings,
        bookResource,
        cancelBooking,
        rescheduleBooking,
        updateBookingStatus,
        auditCycles,
        createAuditCycle,
        updateAuditItemStatus,
        lockAndCloseAuditCycle,
        activityLogs,
        addActivityLog,
        updateAsset,
        deleteAsset,
        resetDatabase,
        clearDatabase,
        toasts,
        addToast,
        removeToast,
        isCommandPaletteOpen,
        setIsCommandPaletteOpen,
        isRegisterAssetOpen,
        setIsRegisterAssetOpen,
        isBookResourceOpen,
        setIsBookResourceOpen,
        isRaiseMaintenanceOpen,
        setIsRaiseMaintenanceOpen,
        detailAsset,
        setDetailAsset,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}
