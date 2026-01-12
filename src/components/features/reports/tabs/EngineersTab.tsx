/**
 * Engineers Tab Component
 * Following Single Responsibility Principle - Handles only engineer/user analytics
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../ui/card';
import { Badge } from '../../../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../ui/table';
import { Users2 } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { getEngineerUsageData } from '../data/mockData';

export const EngineersTab: React.FC = () => {
  const engineerUsageData = getEngineerUsageData();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Engineer/User Analytics</h3>
          <p className="text-sm text-muted-foreground">Analyze usage patterns by individual users</p>
        </div>
      </div>

      {/* Content Grid */}
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

        {/* Chart Sidebar */}
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
};
