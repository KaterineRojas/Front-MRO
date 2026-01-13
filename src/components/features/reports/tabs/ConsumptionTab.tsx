/**
 * Consumption Tab Component
 * Following Single Responsibility Principle - Handles only consumption analytics
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../ui/card';
import { Badge } from '../../../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../ui/table';
import { TrendingUp, BarChart3 } from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { getTopConsumedArticles, getInventoryData, getMovementData } from '../data/mockData';

export const ConsumptionTab: React.FC = () => {
  const [departmentFilter, setDepartmentFilter] = useState('all');
  
  const topConsumedArticles = getTopConsumedArticles();
  const inventoryData = getInventoryData();
  const movementData = getMovementData();

  return (
    <div className="space-y-6">
      {/* Header */}
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

      {/* Charts */}
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

      {/* Detailed Table */}
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
};
