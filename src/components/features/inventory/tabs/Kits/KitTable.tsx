import React from 'react';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '../../../../ui/table';
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
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]"></TableHead>
            <TableHead>Kit</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="text-center">Items</TableHead>
            <TableHead className="text-center">Stock</TableHead>
            <TableHead className="text-center">Available</TableHead>
            <TableHead className="text-center">Actions</TableHead> 
          </TableRow>
        </TableHeader>
        <TableBody>
          {kits.map((kit) => (
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
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
