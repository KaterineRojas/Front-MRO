import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from './ui/dialog';
import { Plus, Users, Edit, Trash2, Search, UserCheck, Shield, ShoppingCart, Eye } from 'lucide-react';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'administrator' | 'user' | 'purchasing' | 'auditor';
  department: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
}

const mockUsers: User[] = [
  {
    id: 1,
    name: 'Sarah Johnson',
    email: 'sarah.johnson@company.com',
    role: 'administrator',
    department: 'IT',
    isActive: true,
    lastLogin: '2025-01-22T09:30:00Z',
    createdAt: '2024-06-15T00:00:00Z'
  },
  {
    id: 2,
    name: 'Mike Chen',
    email: 'mike.chen@company.com',
    role: 'user',
    department: 'Marketing',
    isActive: true,
    lastLogin: '2025-01-21T14:15:00Z',
    createdAt: '2024-08-22T00:00:00Z'
  },
  {
    id: 3,
    name: 'Anna Rodriguez',
    email: 'anna.rodriguez@company.com',
    role: 'purchasing',
    department: 'Administration',
    isActive: true,
    lastLogin: '2025-01-22T08:45:00Z',
    createdAt: '2024-07-10T00:00:00Z'
  },
  {
    id: 4,
    name: 'David Wilson',
    email: 'david.wilson@company.com',
    role: 'auditor',
    department: 'Finance',
    isActive: true,
    lastLogin: '2025-01-20T16:20:00Z',
    createdAt: '2024-09-05T00:00:00Z'
  },
  {
    id: 5,
    name: 'James Thompson',
    email: 'james.thompson@company.com',
    role: 'user',
    department: 'Sales',
    isActive: false,
    lastLogin: '2024-12-15T10:30:00Z',
    createdAt: '2024-05-18T00:00:00Z'
  }
];

const rolePermissions = {
  administrator: [
    'Create and manage articles',
    'Record all inventory movements',
    'Manage loans and returns',
    'Approve purchase orders',
    'View all reports',
    'Manage users and permissions',
    'Audit inventory'
  ],
  user: [
    'Request consumable items',
    'Request loans for non-consumables',
    'Return borrowed items',
    'View own loan history',
    'Submit purchase requests'
  ],
  purchasing: [
    'View and manage purchase orders',
    'Receive purchase requests',
    'Record inventory receipts',
    'Manage supplier information',
    'View purchase reports'
  ],
  auditor: [
    'View all inventory data',
    'Perform inventory audits',
    'Validate inventory adjustments',
    'Generate audit reports',
    'View movement history'
  ]
};

export function UserManagement() {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'user' as User['role'],
    department: '',
    isActive: true
  });

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingUser) {
      setUsers(users.map(user => 
        user.id === editingUser.id 
          ? { ...user, ...formData }
          : user
      ));
    } else {
      const newUser: User = {
        id: Math.max(...users.map(u => u.id), 0) + 1,
        ...formData,
        createdAt: new Date().toISOString()
      };
      setUsers([...users, newUser]);
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      role: 'user',
      department: '',
      isActive: true
    });
    setEditingUser(null);
    setDialogOpen(false);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      isActive: user.isActive
    });
    setDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    setUsers(users.filter(user => user.id !== id));
  };

  const toggleUserStatus = (id: number) => {
    setUsers(users.map(user => 
      user.id === id 
        ? { ...user, isActive: !user.isActive }
        : user
    ));
  };

  const getRoleBadge = (role: User['role']) => {
    switch (role) {
      case 'administrator':
        return <Badge variant="destructive" className="gap-1"><Shield className="h-3 w-3" />Administrator</Badge>;
      case 'purchasing':
        return <Badge variant="default" className="gap-1"><ShoppingCart className="h-3 w-3" />Purchasing</Badge>;
      case 'auditor':
        return <Badge variant="secondary" className="gap-1"><Eye className="h-3 w-3" />Auditor</Badge>;
      case 'user':
        return <Badge variant="outline" className="gap-1"><UserCheck className="h-3 w-3" />User</Badge>;
    }
  };

  const getRoleIcon = (role: User['role']) => {
    switch (role) {
      case 'administrator':
        return <Shield className="h-4 w-4 text-red-600" />;
      case 'purchasing':
        return <ShoppingCart className="h-4 w-4 text-blue-600" />;
      case 'auditor':
        return <Eye className="h-4 w-4 text-purple-600" />;
      case 'user':
        return <UserCheck className="h-4 w-4 text-green-600" />;
    }
  };

  const formatLastLogin = (lastLogin?: string) => {
    if (!lastLogin) return 'Never';
    const date = new Date(lastLogin);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>User Management</h1>
          <p className="text-muted-foreground">
            Manage user accounts and permissions
          </p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingUser ? 'Edit User' : 'Add New User'}
              </DialogTitle>
              <DialogDescription>
                {editingUser ? 'Update user information and permissions' : 'Create a new user account with role and permissions'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Enter full name"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="user@company.com"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select value={formData.role} onValueChange={(value: User['role']) => setFormData({...formData, role: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="purchasing">Purchasing</SelectItem>
                      <SelectItem value="auditor">Auditor</SelectItem>
                      <SelectItem value="administrator">Administrator</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="department">Department</Label>
                  <Select value={formData.department} onValueChange={(value) => setFormData({...formData, department: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Administration">Administration</SelectItem>
                      <SelectItem value="IT">IT</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                      <SelectItem value="Sales">Sales</SelectItem>
                      <SelectItem value="HR">HR</SelectItem>
                      <SelectItem value="Finance">Finance</SelectItem>
                      <SelectItem value="Operations">Operations</SelectItem>
                      <SelectItem value="Training">Training</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                  className="w-4 h-4"
                />
                <Label htmlFor="isActive">Active User</Label>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingUser ? 'Update' : 'Create'} User
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="administrator">Administrator</SelectItem>
                <SelectItem value="purchasing">Purchasing</SelectItem>
                <SelectItem value="auditor">Auditor</SelectItem>
                <SelectItem value="user">User</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Users ({filteredUsers.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p>{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getRoleIcon(user.role)}
                      {getRoleBadge(user.role)}
                    </div>
                  </TableCell>
                  <TableCell>{user.department}</TableCell>
                  <TableCell>
                    <Badge variant={user.isActive ? 'outline' : 'secondary'} 
                           className={user.isActive ? 'text-green-600 border-green-600' : ''}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{formatLastLogin(user.lastLogin)}</TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(user)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleUserStatus(user.id)}
                      >
                        {user.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(user.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Role Permissions */}
      <Card>
        <CardHeader>
          <CardTitle>Role Permissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            {Object.entries(rolePermissions).map(([role, permissions]) => (
              <div key={role} className="space-y-3">
                <div className="flex items-center space-x-2">
                  {getRoleIcon(role as User['role'])}
                  <h4 className="capitalize">{role}</h4>
                </div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {permissions.map((permission, index) => (
                    <li key={index} className="flex items-center space-x-2">
                      <span className="w-1 h-1 bg-muted-foreground rounded-full"></span>
                      <span>{permission}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}