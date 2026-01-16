import React, { useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../../../../store';
import { fetchArticles } from '../../../../store';
import { selectArticles, selectInventoryLoading } from '../../../../store/selectors';
import { Card, CardContent, CardHeader, CardTitle } from '../../../ui/card';
import { Package, ClipboardCheck, ShieldAlert, Layers, AlertOctagon } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';

const COLORS = {
  available: '#10b981',
  onLoan: '#3b82f6',    
  reserved: '#f59e0b',  
  blocked: '#ef4444'    
};

export const OverviewTab: React.FC = () => {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectArticles);
  const loading = useAppSelector(selectInventoryLoading);

  useEffect(() => {
    dispatch(fetchArticles());
  }, [dispatch]);

  const processedData = useMemo(() => {
    const data = items.reduce((acc, item) => {
      const zgcTotal = item.bins
        .filter((b: any) => b.binCode.includes("-ZGC-"))
        .reduce((sum: number, b: any) => sum + b.quantity, 0);

      const blockedQuantity = item.bins
        .filter((b: any) => !b.binCode.includes("-ZGC-"))
        .reduce((sum: number, b: any) => sum + b.quantity, 0);

      const totalItemUnits = zgcTotal + blockedQuantity + item.quantityOnLoan;

      acc.globalInWarehouse += (zgcTotal + blockedQuantity);
      acc.globalOnLoan += item.quantityOnLoan;
      acc.globalAvailable += item.quantityAvailable;
      acc.globalReserved += item.quantityReserved;
      acc.globalBlocked += blockedQuantity;
      acc.assetPool += (zgcTotal + item.quantityOnLoan);

      acc.totalUniqueItems++;
      if (blockedQuantity > 0) acc.uniqueBlockedItems++;
      if (item.totalPhysical > 0 && item.quantityAvailable <= item.minStock) acc.lowStockCount++;

      if (!acc.categories[item.category]) {
        acc.categories[item.category] = {
          category: item.category, 
          available: 0, onLoan: 0, reserved: 0, blocked: 0,
          uniqueItemCount: 0,
          totalUnits: 0
        };
      }
      acc.categories[item.category].available += item.quantityAvailable;
      acc.categories[item.category].onLoan += item.quantityOnLoan;
      acc.categories[item.category].reserved += item.quantityReserved;
      acc.categories[item.category].blocked += blockedQuantity;
      acc.categories[item.category].uniqueItemCount += 1;
      acc.categories[item.category].totalUnits += totalItemUnits;

      return acc;
    }, {
      globalInWarehouse: 0, globalOnLoan: 0, globalAvailable: 0,
      globalReserved: 0, globalBlocked: 0, assetPool: 0, lowStockCount: 0,
      totalUniqueItems: 0, uniqueBlockedItems: 0,
      categories: {} as Record<string, any>
    });

    const allCategories = Object.values(data.categories).sort((a, b) => b.totalUnits - a.totalUnits);
    const top5Categories = allCategories.slice(0, 5);

    return { ...data, allCategories, top5Categories };
  }, [items]);

  const totalEnterpriseAssets = processedData.globalInWarehouse + processedData.globalOnLoan;
  const utilizationRate = processedData.assetPool > 0
    ? ((processedData.globalOnLoan / processedData.assetPool) * 100).toFixed(1)
    : "0";

  const healthData = [
    { name: 'Available', value: processedData.globalAvailable },
    { name: 'On Loan', value: processedData.globalOnLoan },
    { name: 'Reserved', value: processedData.globalReserved },
    { name: 'Blocked', value: processedData.globalBlocked },
  ];

  if (loading) return <div className="p-8 text-center text-slate-400 font-medium">Loading Inventory Data...</div>;

  // Alto fijo por categoría (ajustable)
  const barHeight = 40;
  const dynamicHeight = Math.max(200, processedData.allCategories.length * barHeight);

  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-3 lg:grid-cols-5">
        <Card className="bg-white/90 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-sm rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-slate-700 dark:text-slate-200">Enterprise Assets</CardTitle>
            <Layers className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-slate-800 dark:text-white">{totalEnterpriseAssets} Units</div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">{processedData.totalUniqueItems} Unique Items</p>
          </CardContent>
        </Card>

        <Card className="bg-white/90 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-sm rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-slate-700 dark:text-slate-200">Warehouse Stock</CardTitle>
            <Package className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-slate-800 dark:text-white">{processedData.globalInWarehouse} Units</div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">In Bins</p>
          </CardContent>
        </Card>

        <Card className="bg-white/90 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-sm rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-slate-700 dark:text-slate-200">Blocked Stock</CardTitle>
            <ShieldAlert className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-red-500">{processedData.globalBlocked} Units</div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">{processedData.uniqueBlockedItems} Items Affected</p>
          </CardContent>
        </Card>

        <Card className="bg-white/90 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-sm rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-slate-700 dark:text-slate-200">Critical Stock</CardTitle>
            <AlertOctagon className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-orange-500">{processedData.lowStockCount} Items</div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">Below Min Stock</p>
          </CardContent>
        </Card>

        <Card className="bg-white/90 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-sm rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-slate-700 dark:text-slate-200">Utilization Rate</CardTitle>
            <ClipboardCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-slate-800 dark:text-white">{utilizationRate}%</div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">Efficiency</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Pie Chart */}
        <Card className="bg-white/90 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-sm rounded-xl relative">
          <CardHeader><CardTitle className="text-slate-700 dark:text-slate-200">Asset Distribution</CardTitle></CardHeader>
          <CardContent className="h-[300px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={healthData} innerRadius={70} outerRadius={90} paddingAngle={5} dataKey="value">
                  {healthData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={Object.values(COLORS)[index]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#f1f5f9', color: '#334155', border: 'none', borderRadius: '8px' }} />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-8">
              <span className="text-2xl font-bold text-slate-800 dark:text-white">{totalEnterpriseAssets}</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Units</span>
            </div>
          </CardContent>
        </Card>

        {/* TOP 5: BARRAS VERTICALES */}
        <Card className="bg-white/90 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-sm rounded-xl">
          <CardHeader><CardTitle className="text-slate-700 dark:text-slate-200">Top 5 Categories (Volume)</CardTitle></CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={processedData.top5Categories}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="category" stroke="#64748b" fontSize={10} tick={{ fill: '#64748b' }} />
                <YAxis stroke="#64748b" fontSize={10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#f1f5f9', color: '#334155', border: 'none', borderRadius: '8px' }}
                  labelFormatter={(l, p) => `${l} (${p[0]?.payload?.uniqueItemCount} Items)`}
                />
                <Bar dataKey="available" stackId="a" fill={COLORS.available} name="Available" />
                <Bar dataKey="onLoan" stackId="a" fill={COLORS.onLoan} name="On Loan" />
                <Bar dataKey="reserved" stackId="a" fill={COLORS.reserved} name="Reserved" />
                <Bar dataKey="blocked" stackId="a" fill={COLORS.blocked} name="Blocked" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* GLOBAL: BARRAS HORIZONTALES (Full Width) */}
        <Card className="bg-white/90 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-sm rounded-xl md:col-span-2">
          <CardHeader><CardTitle className="text-slate-700 dark:text-slate-200">Full Inventory Status by Category</CardTitle></CardHeader>
          <CardContent style={{ height: dynamicHeight }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={processedData.allCategories} layout="vertical" margin={{ left: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                <XAxis type="number" stroke="#64748b" fontSize={10} />
                <YAxis dataKey="category" type="category" stroke="#64748b" fontSize={10} width={120} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#f1f5f9', color: '#334155', border: 'none', borderRadius: '8px' }}
                  labelFormatter={(l, p) => `${l} (${p[0]?.payload?.uniqueItemCount} Items)`}
                  formatter={(value) => [`${value} Units`]}
                />
                <Legend />
                <Bar dataKey="available" stackId="a" fill={COLORS.available} name="Available" />
                <Bar dataKey="onLoan" stackId="a" fill={COLORS.onLoan} name="On Loan" />
                <Bar dataKey="reserved" stackId="a" fill={COLORS.reserved} name="Reserved" />
                <Bar dataKey="blocked" stackId="a" fill={COLORS.blocked} name="Blocked" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};