import React from 'react';
import { KitRow } from './KitRow';
import type { KitTableProps } from './types';

export function KitTable({
  kits,
  articles,
  categories,
  expandedKits,
  onToggleExpand,
  onEditKit,
  onUseAsTemplate,
  onDeleteKit,
  onRefreshKits,
}: KitTableProps) {
  
  return (
    <div className="w-full overflow-auto rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm">
      
      <table className="w-full text-sm text-left">
        
        <thead className="bg-gray-50 dark:bg-[#0A0A0A] text-gray-500 dark:text-gray-400">
          <tr className="border-b border-gray-200 dark:border-gray-800">
            
            <th className="h-10 px-4 text-left align-middle font-medium w-[50px]">
            </th>
            
            <th className="h-10 px-4 text-left align-middle font-medium">
              SKU
            </th>
            
            <th className="h-10 px-4 text-left align-middle font-medium">
              Kit
            </th>
            
            <th className="h-10 px-4 text-left align-middle font-medium">
              Description
            </th>
            
            <th className="h-10 px-4 align-middle font-medium text-center">
              Items
            </th>
            
            <th className="h-10 px-4 align-middle font-medium text-center">
              Stock
            </th>
            
            <th className="h-10 px-4 align-middle font-medium text-center">
              Available
            </th>
            
            <th className="h-10 px-4 align-middle font-medium text-center">
              Actions
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-[#0A0A0A]">
          {kits.length === 0 ? (
            // Estado vacío opcional por si no hay kits
            <tr>
              <td colSpan={8} className="p-8 text-center text-gray-500 dark:text-gray-400">
                No kits found matching your filters.
              </td>
            </tr>
          ) : (
            kits.map((kit) => (
              <KitRow
                key={kit.id}
                kit={kit}
                articles={articles}
                categories={categories}
                isExpanded={expandedKits.has(kit.id)}
                onToggleExpand={onToggleExpand}
                onEditKit={onEditKit}
                onUseAsTemplate={onUseAsTemplate}
                onDeleteKit={onDeleteKit}
                onRefreshKits={onRefreshKits}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}