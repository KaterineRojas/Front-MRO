/**
 * Type definitions for Reports module
 * Following Single Responsibility Principle - Types are defined separately
 */

export interface OverviewMetrics {
  totalValue: number;
  activeLoans: number;
  overdueLoans: number;
  pendingOrders: number;
  lowStockAlerts: number;
  totalArticles: number;
  consumableItems: number;
  nonConsumableItems: number;
}

export interface InventoryCategory {
  category: string;
  inStock: number;
  value: number;
  consumed: number;
}

export interface MovementData {
  month: string;
  entries: number;
  exits: number;
  consumption: number;
}

export interface CategoryDistribution {
  name: string;
  value: number;
  count: number;
  color: string;
}

export interface ConsumedArticle {
  code: string;
  description: string;
  totalConsumed: number;
  unit: string;
  value: number;
  frequency: 'Daily' | 'Weekly' | 'Monthly';
  currentStock: number;
  averageMonthly: number;
  departments: string[];
  topUser: string;
  lastUsed: string;
}

export interface ArticleLocation {
  code: string;
  description: string;
  currentUser: string;
  department: string;
  project: string;
  location: string;
  loanDate: string | null;
  expectedReturn: string | null;
  status: 'active' | 'available' | 'maintenance';
  email: string | null;
}

export interface EngineerUsage {
  name: string;
  department: string;
  totalValue: number;
  itemsUsed: number;
  activeLoans: number;
  completedProjects: number;
  topArticles: string[];
  lastActivity: string;
}

export interface ProjectAnalytic {
  name: string;
  department: string;
  manager: string;
  totalValue: number;
  itemsCount: number;
  status: 'active' | 'completed' | 'pending';
  startDate: string;
  endDate: string;
  progress: number;
  topArticles: string[];
}

export type TabType = 'overview' | 'consumption' | 'tracking' | 'engineers' | 'projects';

export interface ReportFilters {
  searchTerm: string;
  departmentFilter: string;
  statusFilter: string;
}
