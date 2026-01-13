import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { 
  FileText, 
  Download, 
  TrendingUp, 
  TrendingDown, 
  Package, 
  UserCheck, 
  ShoppingCart, 
  AlertTriangle, 
  Building2, 
  Users2, 
  Folder,
  Search,
  Filter,
  Eye,
  MapPin,
  Calendar,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart as RechartsPieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line,
  Area,
  AreaChart
} from 'recharts';

// Color palette for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

// Mock data for analytics
const overviewData = {
  totalValue: 106260,
  activeLoans: 2,
  overdueLoans: 1,
  pendingOrders: 1,
  lowStockAlerts: 1,
  totalArticles: 1763,
  consumableItems: 1145,
  nonConsumableItems: 618
};

const inventoryData = [
  { category: 'Office Supplies', inStock: 1250, value: 2500, consumed: 450 },
  { category: 'Technology', inStock: 45, value: 67500, consumed: 25 },
  { category: 'Furniture', inStock: 78, value: 15600, consumed: 12 },
  { category: 'Tools', inStock: 234, value: 8760, consumed: 89 },
  { category: 'Electronics', inStock: 156, value: 12400, consumed: 34 }
];

const movementData = [
  { month: 'Sep', entries: 42, exits: 35, consumption: 28 },
  { month: 'Oct', entries: 45, exits: 38, consumption: 32 },
  { month: 'Nov', entries: 52, exits: 41, consumption: 38 },
  { month: 'Dec', entries: 38, exits: 44, consumption: 41 },
  { month: 'Jan', entries: 61, exits: 47, consumption: 45 }
];

const categoryDistribution = [
  { name: 'Consumables', value: 65, count: 1145, color: '#0088FE' },
  { name: 'Non-consumables', value: 30, count: 618, color: '#00C49F' },
  { name: 'Pending Purchase', value: 5, count: 88, color: '#FFBB28' }
];

const topConsumedArticles = [
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

const articleLocationData = [
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

const engineerUsageData = [
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

const projectAnalytics = [
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

const departmentAnalytics = [
  {
    name: 'IT',
    totalValue: 45400.00,
    itemsUsed: 127,
    activeProjects: 3,
    employees: 12,
    efficiency: 92,
    topArticle: 'USB-003',
    monthlyBudget: 15000,
    utilizationRate: 85
  },
  {
    name: 'Marketing',
    totalValue: 18800.00,
    itemsUsed: 45,
    activeProjects: 2,
    employees: 8,
    efficiency: 88,
    topArticle: 'TECH-002',
    monthlyBudget: 8000,
    utilizationRate: 78
  },
  {
    name: 'Engineering',
    totalValue: 32600.00,
    itemsUsed: 89,
    activeProjects: 4,
    employees: 15,
    efficiency: 95,
    topArticle: 'TEST-001',
    monthlyBudget: 12000,
    utilizationRate: 91
  },
  {
    name: 'Training',
    totalValue: 12700.00,
    itemsUsed: 34,
    activeProjects: 2,
    employees: 6,
    efficiency: 82,
    topArticle: 'PROJ-002',
    monthlyBudget: 5000,
    utilizationRate: 68
  },
  {
    name: 'Sales',
    totalValue: 15900.00,
    itemsUsed: 62,
    activeProjects: 4,
    employees: 10,
    efficiency: 86,
    topArticle: 'PROJ-001',
    monthlyBudget: 7000,
    utilizationRate: 75
  }
];

export function Reports() {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const exportReport = (reportType: string) => {
    console.log(`Exporting ${reportType} report...`);
    alert(`${reportType} report exported successfully!`);
  };

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total Value</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">${overviewData.totalValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Current inventory value
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Active Loans</CardTitle>
            <UserCheck className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-blue-600">{overviewData.activeLoans}</div>
            <p className="text-xs text-muted-foreground">
              {overviewData.overdueLoans} overdue
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Pending Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-purple-600">{overviewData.pendingOrders}</div>
            <p className="text-xs text-muted-foreground">
              $900 value
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Low Stock Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-orange-600">{overviewData.lowStockAlerts}</div>
            <p className="text-xs text-muted-foreground">
              Needs attention
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Inventory by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={inventoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="inStock" fill="#8884d8" name="In Stock" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inventory Movements Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={movementData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="entries" stroke="#82ca9d" name="Entries" />
                <Line type="monotone" dataKey="exits" stroke="#ffc658" name="Exits" />
                <Line type="monotone" dataKey="consumption" stroke="#ff7300" name="Consumption" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Category Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={categoryDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
            <div className="space-y-3">
              {categoryDistribution.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="font-medium">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{item.count} items</div>
                    <div className="text-sm text-muted-foreground">{item.value}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderConsumptionAnalytics = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Most Consumed Articles</h3>
          <p className="text-sm text-muted-foreground">Analyze which articles are used most frequently</p>
        </div>
        <div className="flex space-x-2">
          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Depts</SelectItem>
              <SelectItem value="IT">IT</SelectItem>
              <SelectItem value="Marketing">Marketing</SelectItem>
              <SelectItem value="Engineering">Engineering</SelectItem>
              <SelectItem value="Training">Training</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Consumption Trends</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={movementData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="consumption" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Top Categories by Consumption</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={inventoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="consumed" fill="#ff7300" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detailed Consumption Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Article</TableHead>
                <TableHead>Total Consumed</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Frequency</TableHead>
                <TableHead>Current Stock</TableHead>
                <TableHead>Departments</TableHead>
                <TableHead>Top User</TableHead>
                <TableHead>Last Used</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topConsumedArticles.map((article, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <div>
                      <p className="font-mono text-sm">{article.code}</p>
                      <p className="text-xs text-muted-foreground">{article.description}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{article.totalConsumed.toLocaleString()}</span>
                    <span className="text-xs text-muted-foreground ml-1">{article.unit}</span>
                  </TableCell>
                  <TableCell>${article.value.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={article.frequency === 'Daily' ? 'destructive' : article.frequency === 'Weekly' ? 'default' : 'secondary'}>
                      {article.frequency}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className={article.currentStock < 10 ? 'text-red-600 font-medium' : ''}>
                      {article.currentStock} {article.unit}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {article.departments.slice(0, 2).map((dept, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {dept}
                        </Badge>
                      ))}
                      {article.departments.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{article.departments.length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{article.topUser}</TableCell>
                  <TableCell>{article.lastUsed}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  const renderLocationTracking = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Article Location Tracking</h3>
          <p className="text-sm text-muted-foreground">Track where each article is currently located and who has it</p>
        </div>
        <div className="flex space-x-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by article or user..." 
              className="pl-10 w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                <span>Article Locations</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Article</TableHead>
                    <TableHead>Current Holder</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Return Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {articleLocationData.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <div>
                          <p className="font-mono text-sm">{item.code}</p>
                          <p className="text-xs text-muted-foreground">{item.description}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{item.currentUser}</p>
                          {item.email && (
                            <p className="text-xs text-muted-foreground">{item.email}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{item.department}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">{item.location}</span>
                        </div>
                      </TableCell>
                      <TableCell>{item.project}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={item.status === 'active' ? 'default' : 'secondary'}
                          className={item.status === 'active' ? 'bg-blue-600' : ''}
                        >
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {item.expectedReturn ? (
                          <span className={new Date(item.expectedReturn) < new Date() ? 'text-red-600' : ''}>
                            {item.expectedReturn}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">N/A</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>Location Summary</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded">
                <div className="text-2xl font-semibold text-blue-600">2</div>
                <p className="text-sm text-blue-600">Items on Loan</p>
              </div>
              <div className="p-3 bg-green-50 dark:bg-green-950 rounded">
                <div className="text-2xl font-semibold text-green-600">1</div>
                <p className="text-sm text-green-600">Available in Warehouse</p>
              </div>
              <div className="p-3 bg-orange-50 dark:bg-orange-950 rounded">
                <div className="text-2xl font-semibold text-orange-600">0</div>
                <p className="text-sm text-orange-600">Under Maintenance</p>
              </div>
              <div className="p-3 bg-red-50 dark:bg-red-950 rounded">
                <div className="text-2xl font-semibold text-red-600">1</div>
                <p className="text-sm text-red-600">Overdue Returns</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  const renderEngineerAnalytics = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Engineer/User Analytics</h3>
          <p className="text-sm text-muted-foreground">Analyze usage patterns by individual users</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users2 className="h-5 w-5" />
                <span>User Usage Analytics</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Total Value Used</TableHead>
                    <TableHead>Items Used</TableHead>
                    <TableHead>Active Loans</TableHead>
                    <TableHead>Completed Projects</TableHead>
                    <TableHead>Most Used Articles</TableHead>
                    <TableHead>Last Activity</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {engineerUsageData.map((user, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <div className="font-medium">{user.name}</div>
                      </TableCell>
                      <TableCell>{user.department}</TableCell>
                      <TableCell>${user.totalValue.toLocaleString()}</TableCell>
                      <TableCell>{user.itemsUsed}</TableCell>
                      <TableCell>
                        <Badge variant={user.activeLoans > 0 ? 'default' : 'secondary'}>
                          {user.activeLoans}
                        </Badge>
                      </TableCell>
                      <TableCell>{user.completedProjects}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {user.topArticles.slice(0, 2).map((article, i) => (
                            <Badge key={i} variant="outline" className="text-xs font-mono">
                              {article}
                            </Badge>
                          ))}
                          {user.topArticles.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{user.topArticles.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{user.lastActivity}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Top Users by Value</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={engineerUsageData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} />
                  <Tooltip />
                  <Bar dataKey="totalValue" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  const renderProjectAnalytics = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Project Analytics</h3>
          <p className="text-sm text-muted-foreground">Track resource usage and efficiency by project</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Folder className="h-5 w-5" />
            <span>Project Resource Usage</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead>Manager</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Total Value</TableHead>
                <TableHead>Items Count</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Top Articles</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projectAnalytics.map((project, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <div className="font-medium">{project.name}</div>
                  </TableCell>
                  <TableCell>{project.manager}</TableCell>
                  <TableCell>{project.department}</TableCell>
                  <TableCell>${project.totalValue.toLocaleString()}</TableCell>
                  <TableCell>{project.itemsCount}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={project.status === 'active' ? 'default' : project.status === 'completed' ? 'secondary' : 'outline'}
                      className={project.status === 'completed' ? 'bg-green-600' : ''}
                    >
                      {project.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${project.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-sm">{project.progress}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{project.startDate}</div>
                      <div className="text-muted-foreground">to {project.endDate}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {project.topArticles.map((article, i) => (
                        <Badge key={i} variant="outline" className="text-xs font-mono">
                          {article}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Project Value Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={projectAnalytics}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name.split(' ')[0]} $${(value/1000).toFixed(1)}k`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="totalValue"
                >
                  {projectAnalytics.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Project Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {projectAnalytics.map((project, index) => (
                <div key={index} className="p-3 border rounded">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium">{project.name}</div>
                    <Badge 
                      variant={project.status === 'active' ? 'default' : 'secondary'}
                      className={project.status === 'completed' ? 'bg-green-600' : ''}
                    >
                      {project.status}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground mb-2">
                    {project.startDate} - {project.endDate}
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">{project.progress}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderDepartmentAnalytics = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Department Analytics</h3>
          <p className="text-sm text-muted-foreground">Analyze resource usage and efficiency by department</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {departmentAnalytics.slice(0, 4).map((dept, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">{dept.name}</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">${(dept.totalValue/1000).toFixed(1)}k</div>
              <p className="text-xs text-muted-foreground">
                {dept.itemsUsed} items • {dept.employees} employees
              </p>
              <div className="mt-2">
                <div className="text-xs text-muted-foreground">Efficiency</div>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-1">
                    <div 
                      className="bg-green-600 h-1 rounded-full" 
                      style={{ width: `${dept.efficiency}%` }}
                    ></div>
                  </div>
                  <span className="text-xs font-medium">{dept.efficiency}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Department Resource Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={departmentAnalytics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="totalValue" fill="#8884d8" name="Total Value" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Department Efficiency</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={departmentAnalytics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="efficiency" fill="#82ca9d" name="Efficiency %" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detailed Department Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Department</TableHead>
                <TableHead>Total Value</TableHead>
                <TableHead>Items Used</TableHead>
                <TableHead>Employees</TableHead>
                <TableHead>Active Projects</TableHead>
                <TableHead>Efficiency</TableHead>
                <TableHead>Utilization Rate</TableHead>
                <TableHead>Monthly Budget</TableHead>
                <TableHead>Top Article</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {departmentAnalytics.map((dept, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{dept.name}</TableCell>
                  <TableCell>${dept.totalValue.toLocaleString()}</TableCell>
                  <TableCell>{dept.itemsUsed}</TableCell>
                  <TableCell>{dept.employees}</TableCell>
                  <TableCell>{dept.activeProjects}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ width: `${dept.efficiency}%` }}
                        ></div>
                      </div>
                      <span className="text-sm">{dept.efficiency}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${dept.utilizationRate}%` }}
                        ></div>
                      </div>
                      <span className="text-sm">{dept.utilizationRate}%</span>
                    </div>
                  </TableCell>
                  <TableCell>${dept.monthlyBudget.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono text-xs">
                      {dept.topArticle}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Reports & Analytics</h1>
          <p className="text-muted-foreground">
            Comprehensive analytics and insights for inventory management
          </p>
        </div>
        
        <Button onClick={() => exportReport(activeTab)}>
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="consumption">Consumption</TabsTrigger>
          <TabsTrigger value="location">Location</TabsTrigger>
          <TabsTrigger value="engineers">Engineers</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="departments">Departments</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6 mt-6">
          {renderOverview()}
        </TabsContent>
        
        <TabsContent value="consumption" className="space-y-6 mt-6">
          {renderConsumptionAnalytics()}
        </TabsContent>
        
        <TabsContent value="location" className="space-y-6 mt-6">
          {renderLocationTracking()}
        </TabsContent>
        
        <TabsContent value="engineers" className="space-y-6 mt-6">
          {renderEngineerAnalytics()}
        </TabsContent>
        
        <TabsContent value="projects" className="space-y-6 mt-6">
          {renderProjectAnalytics()}
        </TabsContent>
        
        <TabsContent value="departments" className="space-y-6 mt-6">
          {renderDepartmentAnalytics()}
        </TabsContent>
      </Tabs>
    </div>
  );
}