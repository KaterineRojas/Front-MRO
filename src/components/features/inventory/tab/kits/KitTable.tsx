import React from 'react';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '../../../ui/table';
import { KitRow } from './KitRow';
import type { KitTableProps } from './types';

export function KitTable({
  kits,
  articles,
  categories,
  expandedKits,
  onToggleExpand,
  onEditKit,
  onDeleteKit,
}: KitTableProps) {
  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]"></TableHead>
            <TableHead>Kit</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Items</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
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
              onDeleteKit={onDeleteKit}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
