/**
 * Mock data service for Reports
 * Following Single Responsibility Principle - Data management separated from UI
 */

import {
  OverviewMetrics,
  InventoryCategory,
  MovementData,
  CategoryDistribution,
  ConsumedArticle,
  ArticleLocation,
  EngineerUsage,
  ProjectAnalytic
} from '../types';

// Color palette for charts
export const CHART_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

/**
 * Overview data service
 */
export const getOverviewMetrics = (): OverviewMetrics => ({
  totalValue: 106260,
  activeLoans: 2,
  overdueLoans: 1,
  pendingOrders: 1,
  lowStockAlerts: 1,
  totalArticles: 1763,
  consumableItems: 1145,
  nonConsumableItems: 618
});

export const getInventoryData = (): InventoryCategory[] => [
  { category: 'Office Supplies', inStock: 1250, value: 2500, consumed: 450 },
  { category: 'Technology', inStock: 45, value: 67500, consumed: 25 },
  { category: 'Furniture', inStock: 78, value: 15600, consumed: 12 },
  { category: 'Tools', inStock: 234, value: 8760, consumed: 89 },
  { category: 'Electronics', inStock: 156, value: 12400, consumed: 34 }
];

export const getMovementData = (): MovementData[] => [
  { month: 'Sep', entries: 42, exits: 35, consumption: 28 },
  { month: 'Oct', entries: 45, exits: 38, consumption: 32 },
  { month: 'Nov', entries: 52, exits: 41, consumption: 38 },
  { month: 'Dec', entries: 38, exits: 44, consumption: 41 },
  { month: 'Jan', entries: 61, exits: 47, consumption: 45 }
];

export const getCategoryDistribution = (): CategoryDistribution[] => [
  { name: 'Consumables', value: 65, count: 1145, color: '#0088FE' },
  { name: 'Non-consumables', value: 30, count: 618, color: '#00C49F' },
  { name: 'Pending Purchase', value: 5, count: 88, color: '#FFBB28' }
];

/**
 * Consumption data service
 */
export const getTopConsumedArticles = (): ConsumedArticle[] => [
  { 
    code: 'OFF-001', 
    description: 'Office Paper A4 - 80gsm', 
    totalConsumed: 15000,
    unit: 'sheets',
    value: 300.00,
    frequency: 'Daily',
    currentStock: 2500,
    averageMonthly: 5000,
    departments: ['Administration', 'Sales', 'Marketing'],
    topUser: 'Sarah Johnson',
    lastUsed: '2025-01-22'
  },
  { 
    code: 'USB-003', 
    description: 'USB Cable Type-C 2m', 
    totalConsumed: 125,
    unit: 'units',
    value: 1123.75,
    frequency: 'Weekly',
    currentStock: 5,
    averageMonthly: 42,
    departments: ['IT', 'Engineering'],
    topUser: 'Mike Chen',
    lastUsed: '2025-01-21'
  },
  { 
    code: 'MAR-001', 
    description: 'Whiteboard Markers Set', 
    totalConsumed: 240,
    unit: 'sets',
    value: 480.00,
    frequency: 'Weekly',
    currentStock: 24,
    averageMonthly: 80,
    departments: ['Training', 'Marketing', 'Sales'],
    topUser: 'Jennifer Lee',
    lastUsed: '2025-01-20'
  },
  { 
    code: 'TECH-006', 
    description: 'Mouse Wireless Optical', 
    totalConsumed: 45,
    unit: 'units',
    value: 1125.00,
    frequency: 'Monthly',
    currentStock: 15,
    averageMonthly: 15,
    departments: ['IT', 'Administration'],
    topUser: 'Anna Rodriguez',
    lastUsed: '2025-01-19'
  }
];

/**
 * Location data service
 */
export const getArticleLocationData = (): ArticleLocation[] => [
  {
    code: 'TECH-002',
    description: 'Laptop Dell Latitude 5520',
    currentUser: 'Sarah Williams',
    department: 'Marketing',
    project: 'Product Launch Campaign',
    location: 'Marketing Floor - Desk 15',
    loanDate: '2025-01-15',
    expectedReturn: '2025-01-29',
    status: 'active',
    email: 'sarah.williams@company.com'
  },
  {
    code: 'PROJ-001',
    description: 'Portable Projector',
    currentUser: 'Training Room A',
    department: 'Training',
    project: 'Q1 Training Sessions',
    location: 'Training Center - Room A',
    loanDate: '2025-01-18',
    expectedReturn: '2025-02-01',
    status: 'active',
    email: 'facilities@company.com'
  },
  {
    code: 'TOOL-015',
    description: 'Power Drill Professional',
    currentUser: 'Warehouse',
    department: 'Maintenance',
    project: 'Available',
    location: 'Warehouse - Shelf B12',
    loanDate: null,
    expectedReturn: null,
    status: 'available',
    email: null
  }
];

/**
 * Engineer data service
 */
export const getEngineerUsageData = (): EngineerUsage[] => [
  {
    name: 'Sarah Williams',
    department: 'Marketing',
    totalValue: 8450.00,
    itemsUsed: 23,
    activeLoans: 1,
    completedProjects: 3,
    topArticles: ['TECH-002', 'PROJ-001', 'CAM-001'],
    lastActivity: '2025-01-22'
  },
  {
    name: 'Mike Chen',
    department: 'IT',
    totalValue: 12300.00,
    itemsUsed: 45,
    activeLoans: 0,
    completedProjects: 5,
    topArticles: ['USB-003', 'TECH-004', 'NETW-001'],
    lastActivity: '2025-01-21'
  },
  {
    name: 'Jennifer Lee',
    department: 'Training',
    totalValue: 5600.00,
    itemsUsed: 18,
    activeLoans: 2,
    completedProjects: 2,
    topArticles: ['MAR-001', 'PROJ-002', 'AUD-001'],
    lastActivity: '2025-01-20'
  },
  {
    name: 'Robert Chen',
    department: 'Engineering',
    totalValue: 15200.00,
    itemsUsed: 67,
    activeLoans: 3,
    completedProjects: 4,
    topArticles: ['TEST-001', 'TOOL-008', 'MEAS-003'],
    lastActivity: '2025-01-22'
  }
];

/**
 * Project data service
 */
export const getProjectAnalytics = (): ProjectAnalytic[] => [
  {
    name: 'Product Launch Campaign',
    department: 'Marketing',
    manager: 'Sarah Williams',
    totalValue: 8850.00,
    itemsCount: 15,
    status: 'active',
    startDate: '2025-01-15',
    endDate: '2025-02-15',
    progress: 65,
    topArticles: ['TECH-002', 'PROJ-001', 'CAM-001']
  },
  {
    name: 'IT Infrastructure Upgrade',
    department: 'IT',
    manager: 'Mike Chen',
    totalValue: 25400.00,
    itemsCount: 45,
    status: 'active',
    startDate: '2025-01-10',
    endDate: '2025-03-10',
    progress: 40,
    topArticles: ['USB-003', 'NETW-001', 'SERV-001']
  },
  {
    name: 'Q1 Training Program',
    department: 'Training',
    manager: 'Jennifer Lee',
    totalValue: 5600.00,
    itemsCount: 18,
    status: 'active',
    startDate: '2025-01-20',
    endDate: '2025-04-20',
    progress: 25,
    topArticles: ['PROJ-002', 'AUD-001', 'MAR-001']
  },
  {
    name: 'Product Testing Phase 2',
    department: 'Engineering',
    manager: 'Robert Chen',
    totalValue: 18200.00,
    itemsCount: 32,
    status: 'completed',
    startDate: '2024-12-01',
    endDate: '2025-01-15',
    progress: 100,
    topArticles: ['TEST-001', 'MEAS-003', 'TOOL-008']
  }
];
