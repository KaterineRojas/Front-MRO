import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { AlertTriangle, Package, UserCheck, ShoppingCart, TrendingUp, TrendingDown } from 'lucide-react';

const mockStats = {
  totalArticles: 1247,
  lowStockItems: 23,
  activeLoans: 45,
  pendingOrders: 12,
  recentMovements: [
    { id: 1, type: 'entry', article: 'Office Paper A4', quantity: 500, date: '2025-01-20', user: 'Sarah Johnson' },
    { id: 2, type: 'loan', article: 'Laptop Dell Latitude', quantity: 1, date: '2025-01-20', user: 'Mike Chen' },
    { id: 3, type: 'consumption', article: 'Printer Toner HP', quantity: 2, date: '2025-01-19', user: 'Anna Rodriguez' },
    { id: 4, type: 'return', article: 'Projector Epson', quantity: 1, date: '2025-01-19', user: 'David Wilson' },
  ],
  lowStockAlerts: [
    { id: 1, article: 'USB Cables Type-C', currentStock: 5, minStock: 20, category: 'consumable' },
    { id: 2, article: 'Office Chairs', currentStock: 2, minStock: 5, category: 'non-consumable' },
    { id: 3, article: 'Whiteboard Markers', currentStock: 8, minStock: 25, category: 'consumable' },
  ]
};

export function Dashboard() {
  const getMovementIcon = (type: string) => {
    switch (type) {
      case 'entry': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'loan': return <UserCheck className="h-4 w-4 text-blue-600" />;
      case 'consumption': return <TrendingDown className="h-4 w-4 text-red-600" />;
      case 'return': return <TrendingUp className="h-4 w-4 text-green-600" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  const getMovementLabel = (type: string) => {
    switch (type) {
      case 'entry': return 'Stock Entry';
      case 'loan': return 'Loan';
      case 'consumption': return 'Consumption';
      case 'return': return 'Return';
      default: return type;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1>Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your inventory system
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total Articles</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{mockStats.totalArticles.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Items in inventory
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Low Stock Items</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-orange-600">{mockStats.lowStockItems}</div>
            <p className="text-xs text-muted-foreground">
              Need restocking
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Active Loans</CardTitle>
            <UserCheck className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-blue-600">{mockStats.activeLoans}</div>
            <p className="text-xs text-muted-foreground">
              Items on loan
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Pending Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-purple-600">{mockStats.pendingOrders}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting delivery
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Movements */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Movements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockStats.recentMovements.map((movement) => (
                <div key={movement.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getMovementIcon(movement.type)}
                    <div>
                      <p className="text-sm">{movement.article}</p>
                      <p className="text-xs text-muted-foreground">
                        {getMovementLabel(movement.type)} • {movement.user}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">Qty: {movement.quantity}</p>
                    <p className="text-xs text-muted-foreground">{movement.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <span>Low Stock Alerts</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockStats.lowStockAlerts.map((alert) => (
                <div key={alert.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm">{alert.article}</p>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">
                        {alert.category === 'consumable' ? 'Consumable' : 'Non-consumable'}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-orange-600">
                      {alert.currentStock} / {alert.minStock}
                    </p>
                    <p className="text-xs text-muted-foreground">Current / Min</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}