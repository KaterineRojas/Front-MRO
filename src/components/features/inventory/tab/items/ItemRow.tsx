import React from 'react';
import { Button } from '../../../ui/button';
import { Badge } from '../../../ui/badge';
import { TableCell, TableRow, TableBody, TableHead, TableHeader, Table } from '../../../ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../../../ui/alert-dialog';
import { ChevronDown, ChevronRight, Edit, Trash2, Package } from 'lucide-react';
import type { ItemRowProps } from './types';

export function ItemRow({
  article,
  categories,
  isExpanded,
  onToggleExpand,
  onEditArticle,
  onDeleteArticle,
  getStockStatus,
  getStatusBadge,
  getTypeIcon,
}: ItemRowProps) {
  const stockStatus = getStockStatus(article.currentStock, article.minStock);

  return (
    <React.Fragment>
      <TableRow>
        <TableCell>
          <Button variant="ghost" size="sm" onClick={() => onToggleExpand(article.id)}>
            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        </TableCell>
        <TableCell>
          <div className="flex items-center space-x-3">
            {article.imageUrl && (
              <img src={article.imageUrl} alt={article.name} className="w-10 h-10 object-cover rounded" />
            )}
            <div>
              <p className="font-medium">{article.name}</p>
              <p className="text-sm text-muted-foreground">{article.sku}</p>
            </div>
          </div>
        </TableCell>
        <TableCell className="max-w-xs">
          <p className="truncate" title={article.description}>
            {article.description || '-'}
          </p>
        </TableCell>
        <TableCell>{categories.find((c) => c.value === article.category)?.label}</TableCell>
        <TableCell>
          <div className="flex items-center space-x-2">
            {getTypeIcon(article.type)}
            <span className="capitalize">{article.type.replace('-', ' ')}</span>
          </div>
        </TableCell>
        <TableCell>
          <Badge variant={stockStatus.variant}>
            {article.currentStock} {article.unit}
          </Badge>
        </TableCell>
        <TableCell>
          <Badge variant="outline">
            {article.minStock} {article.unit}
          </Badge>
        </TableCell>
        <TableCell className="text-right">
          <div className="flex justify-end space-x-2">
            <Button variant="ghost" size="sm" onClick={() => onEditArticle(article)}>
              <Edit className="h-4 w-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Item</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete "{article.name}"? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onDeleteArticle(article.id)}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </TableCell>
      </TableRow>
      {isExpanded && (
        <TableRow>
          <TableCell colSpan={8} className="bg-muted/30 p-0">
            <div className="p-4">
              <h4 className="flex items-center mb-3">
                <Package className="h-4 w-4 mr-2" />
                Storage Locations
              </h4>
              <div className="rounded-md border bg-card">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>BIN Code</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Type</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-mono">{article.binCode}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {article.currentStock} {article.unit}
                        </Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(article.status)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
              <div className="flex gap-4 text-sm mt-3">
                <div>
                  <span className="text-muted-foreground">Created:</span>
                  <span className="ml-2">{article.createdAt}</span>
                </div>
              </div>
            </div>
          </TableCell>
        </TableRow>
      )}
    </React.Fragment>
  );
}
