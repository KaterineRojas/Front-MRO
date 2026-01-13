import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../../ui/table';
import { ItemRow } from './ItemRow';
import type { ItemsTableProps } from './types';

export function ItemsTable({
  articles,
  expandedItems,
  imageErrors,
  categories,
  onToggleExpand,
  onEditItem,
  onDeleteItem,
  onImageError,
}: ItemsTableProps) {
  return (
    <div className="rounded-md border dark:border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12"></TableHead>
            <TableHead>Image</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead>Available</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {articles.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                No items found
              </TableCell>
            </TableRow>
          ) : (
            articles.map((article) => (
              <ItemRow
                key={article.id}
                article={article}
                isExpanded={expandedItems.has(article.id)}
                imageErrors={imageErrors}
                categories={categories}
                onToggleExpand={onToggleExpand}
                onEditItem={onEditItem}
                onDeleteItem={onDeleteItem}
                onImageError={onImageError}
              />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}