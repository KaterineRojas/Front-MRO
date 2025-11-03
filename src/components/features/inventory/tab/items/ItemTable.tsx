import React from 'react';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '../../../ui/table';
import { ItemRow } from './ItemRow';
import type { ItemTableProps } from './types';

export function ItemTable({
  articles,
  categories,
  expandedItems,
  onToggleExpand,
  onEditArticle,
  onDeleteArticle,
  getStockStatus,
  getStatusBadge,
  getTypeIcon,
}: ItemTableProps) {
  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]"></TableHead>
            <TableHead>Item</TableHead>
            <TableHead className="max-w-xs">Description</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead>Min Stock</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {articles.map((article) => (
            <ItemRow
              key={article.id}
              article={article}
              categories={categories}
              isExpanded={expandedItems.has(article.id)}
              onToggleExpand={onToggleExpand}
              onEditArticle={onEditArticle}
              onDeleteArticle={onDeleteArticle}
              getStockStatus={getStockStatus}
              getStatusBadge={getStatusBadge}
              getTypeIcon={getTypeIcon}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
