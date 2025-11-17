import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { AlertTriangle, CheckCircle, Clock, Package } from 'lucide-react';
import { useAppSelector } from '../../store/hooks';
import { selectNotifications } from '../../store/selectors';

export function Dashboard() {
  const notifications = useAppSelector(selectNotifications);
  const stats = {
    activeBorrows: 5,
    pendingReturns: 2,
    pendingRequests: 3,
    totalItems: 12
  };

  return (
    <div className="space-y-6">
      <div>
        <h1>Dashboard - Overview</h1>
        <p className="text-muted-foreground">
          Summary of your activity and important notifications
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Active Borrows</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{stats.activeBorrows}</div>
            <p className="text-xs text-muted-foreground">
              Items in your possession
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Pending Returns</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{stats.pendingReturns}</div>
            <p className="text-xs text-muted-foreground">
              Due soon
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Pending Requests</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{stats.pendingRequests}</div>
            <p className="text-xs text-muted-foreground">
              Under review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total Items</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{stats.totalItems}</div>
            <p className="text-xs text-muted-foreground">
              In your inventory
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Notifications - Full Width */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {notifications.slice(0, 10).map((notification) => (
              <div
                key={notification.id}
                className={`p-3 rounded-lg ${
                  !notification.read ? 'bg-accent border border-border' : 'bg-muted'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {notification.type === 'success' && <CheckCircle className="h-4 w-4 text-green-600" />}
                    {notification.type === 'warning' && <AlertTriangle className="h-4 w-4 text-yellow-600" />}
                    {notification.type === 'info' && <Package className="h-4 w-4 text-blue-600" />}
                    {notification.type === 'error' && <AlertTriangle className="h-4 w-4 text-red-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">{notification.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(notification.timestamp).toLocaleDateString('en-US', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  {!notification.read && (
                    <Badge variant="secondary" className="text-xs">
                      New
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}