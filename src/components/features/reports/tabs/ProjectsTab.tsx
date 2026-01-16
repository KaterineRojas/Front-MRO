import React, { useMemo, useState, useEffect } from 'react'; // Añadido useState y useEffect
import { Card, CardContent, CardHeader, CardTitle } from '../../../ui/card';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  TrendingDown, 
  TrendingUp,
  History 
} from 'lucide-react';
import { getCycleCounts } from '../../cycle-count/services/cycleCountService';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Cell
} from 'recharts';

// Datos estáticos para el gráfico y resumen (puedes hacerlos dinámicos luego)
const currentCountDetails = [
  { itemSku: "SE-NC-001", itemName: "Safety Glasses", systemQuantity: 5, physicalCount: 0, variance: -5 },
  { itemSku: "EL-NC-001", itemName: "Digital Multimeter", systemQuantity: 92, physicalCount: 90, variance: -2 },
  { itemSku: "PT-NC-001", itemName: "Cordless Drill", systemQuantity: 565, physicalCount: 570, variance: 5 },
  { itemSku: "HT-NC-002", itemName: "Screwdriver Set", systemQuantity: 40, physicalCount: 40, variance: 0 },
];

const auditSummary = {
  totalEntries: 8,
  entriesWithVariance: 3,
  totalVariancePositive: 5,
  totalVarianceNegative: -7,
  percentageComplete: 100
};

export const ProjectsTab: React.FC = () => {
  // 1. Declaración de estados (ESTO FALTABA)
  const [auditHistory, setAuditHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [errorHistory, setErrorHistory] = useState<string | null>(null);

  // 2. Llamada al servicio real
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoadingHistory(true);
        const data = await getCycleCounts();
        // Asumiendo que data es un array, si viene en data.content ajusta esto:
        setAuditHistory(data || []); 
      } catch (err) {
        console.error("Error fetching history:", err);
        setErrorHistory("Failed to load audit history");
      } finally {
        setLoadingHistory(false);
      }
    };

    fetchHistory();
  }, []);

  const accuracyRate = useMemo(() => {
    const correct = auditSummary.totalEntries - auditSummary.entriesWithVariance;
    return ((correct / auditSummary.totalEntries) * 100).toFixed(1);
  }, []);

  return (
    <div className="space-y-8 p-4">
      {/* 1. TOP METRICS */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-4">
        <Card className="bg-white/90 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-sm rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-slate-700 dark:text-slate-200">Inventory Accuracy</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800 dark:text-white">{accuracyRate}%</div>
          </CardContent>
        </Card>
        <Card className="bg-white/90 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-sm rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-slate-700 dark:text-slate-200">Shrinkage</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{auditSummary.totalVarianceNegative}</div>
          </CardContent>
        </Card>
        <Card className="bg-white/90 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-sm rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-slate-700 dark:text-slate-200">Surplus</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">+{auditSummary.totalVariancePositive}</div>
          </CardContent>
        </Card>
        <Card className="bg-white/90 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-sm rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-slate-700 dark:text-slate-200">Global Progress</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800 dark:text-white">{auditSummary.percentageComplete}%</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* 2. HISTORIAL DE CONTEOS CON SCROLL */}
        <Card className="bg-white/90 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-sm rounded-xl md:col-span-1 flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 dark:border-slate-800 mb-2">
            <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-200">Audit History</CardTitle>
            <History className="h-4 w-4 text-slate-400" />
          </CardHeader>
          
          <CardContent className="flex-1 overflow-y-auto max-h-[450px] scrollbar-thin scrollbar-thumb-slate-700 space-y-3 pt-2">
            {loadingHistory && (
              <div className="text-center text-slate-400 py-8">Loading audit history...</div>
            )}
            {errorHistory && (
              <div className="text-center text-red-500 py-8 text-xs">{errorHistory}</div>
            )}
            {!loadingHistory && auditHistory.length === 0 && (
              <div className="text-center text-slate-400 py-8">No audit history found.</div>
            )}
            
            {auditHistory.map((count) => (
              <div 
                key={count.id} 
                className={`flex flex-col p-3 rounded-lg border transition-colors ${
                  count.statusName === 'InProgress' 
                  ? 'bg-orange-50/30 dark:bg-orange-500/5 border-orange-200/50 dark:border-orange-500/20' 
                  : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/50'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">
                      {count.date || 'No Date'}
                    </span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{count.countName}</span>
                  </div>
                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-medium ${
                    count.statusName === 'InProgress' 
                    ? 'bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400' 
                    : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                  }`}>
                    {count.statusName}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 mb-1">Zone: {count.zoneName || 'Global'}</div>
                <div className="flex items-center gap-2">
                   <div className="flex-1 bg-slate-200 dark:bg-slate-700 h-1 rounded-full">
                      <div className="bg-indigo-500 h-full" style={{ width: `${count.percentageComplete}%` }} />
                   </div>
                   <span className="text-[10px] text-slate-500 dark:text-slate-300">{count.percentageComplete}%</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* 3. ANÁLISIS DE VARIANZA */}
        <Card className="bg-white/90 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-sm rounded-xl md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-200">Variance Analysis by Item</CardTitle>
            </div>
            <AlertTriangle className="h-4 w-4 text-orange-400" />
          </CardHeader>
          <CardContent className="h-[380px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={currentCountDetails} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="itemSku" stroke="#64748b" fontSize={10} angle={-45} textAnchor="end" interval={0} />
                <YAxis stroke="#64748b" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '12px' }} />
                <Bar dataKey="variance" radius={[4, 4, 0, 0]}>
                  {currentCountDetails.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.variance < 0 ? '#ef4444' : entry.variance > 0 ? '#3b82f6' : '#10b981'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};