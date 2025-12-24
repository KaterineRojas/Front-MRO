// src/components/features/inventory/tabs/Items/ItemRow.tsx
import React from 'react';
import { Button } from '../../../../ui/button';
import { Badge } from '../../../../ui/badge';
import { TableCell, TableRow } from '../../../../ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../../../../ui/alert-dialog';
import { Package, Edit, Trash2, ChevronDown, ChevronRight, TrendingDown, RotateCcw } from 'lucide-react';
import { ItemStockDistribution } from './ItemStockDistribution';
import { formatCategory, getStockStatus, isNewItem } from './itemsHelpers';
import type { ItemRowProps } from './types';

// Estilos CSS para animación de parpadeo del borde
const pulseRingStyle = `
  @keyframes pulse-ring {
    0%, 100% {
      box-shadow: 0 0 0 0px rgba(134, 239, 172, 0.4);
    }
    50% {
      box-shadow: 0 0 0 3px rgba(134, 239, 172, 0.6);
    }
  }
  .pulse-ring-animation {
    animation: pulse-ring 2s ease-in-out infinite;
  }

  @keyframes pulse-text {
    0%, 100% {
      color: white;
    }
    50% {
      color: black;
    }
  }
  .pulse-text-animation {
    animation: pulse-text 2s ease-in-out infinite;
  }
`;

export function ItemRow({
  article,
  isExpanded,
  imageErrors,
  categories,
  onToggleExpand,
  onEditItem,
  onDeleteItem,
  onImageError,
}: ItemRowProps) {
  const totalStock = article.totalPhysical;
  const stockStatus = getStockStatus(totalStock, article.minStock);

  const getTypeIcon = (consumable: boolean) => {
    if (consumable) {
      return <TrendingDown className="h-4 w-4 text-red-600" />;
    }
    return <RotateCcw className="h-4 w-4 text-blue-600" />;
  };

  const itemIsNew = isNewItem(article.createdAt);

  return (
    <React.Fragment>
      {/* Inyectar estilos CSS para la animación */}
      {itemIsNew && <style>{pulseRingStyle}</style>}
      <TableRow>
        <TableCell>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggleExpand(article.id)}
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </TableCell>
        <TableCell>
          {article.imageUrl && !imageErrors.has(article.id) ? (
            <img
              src={article.imageUrl}
              alt={article.name}
              className={`w-12 h-12 object-cover rounded ${
                itemIsNew ? 'ring-1 ring-green-300 pulse-ring-animation' : ''
              }`}
              onError={() => onImageError(article.id)}
            />
          ) : (
            <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
              <Package className="h-6 w-6 text-muted-foreground" />
            </div>
          )}
        </TableCell>
        <TableCell className="font-mono text-sm">
          <div className="flex flex-col gap-0.5">
            {itemIsNew && (
              <Badge className="bg-green-400 text-[11px] font-semibold px-1.5 py-0 hover:bg-green-400 w-fit leading-tight">
                <span className="pulse-text-animation">New</span>
              </Badge>
            )}
            <span>{article.sku}</span>
          </div>
        </TableCell>
        <TableCell className="max-w-xs">
          <div className="flex flex-col">
            <span className="font-medium">{article.name}</span>
            <span className="text-xs text-muted-foreground truncate" title={article.description}>
              {article.description}
            </span>
          </div>
        </TableCell>
        <TableCell>
          <Badge variant="outline">
            {formatCategory(article.category, categories)}
          </Badge>
        </TableCell>
        <TableCell>
          <div className="flex items-center space-x-2">
            {getTypeIcon(article.consumable)}
            <span className="text-sm capitalize">
              {article.consumable ? 'Consumable' : 'Non-Consumable'}
            </span>
          </div>
        </TableCell>
        <TableCell>
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span>{totalStock} {article.unit}</span>
              <Badge variant={stockStatus.variant}>{stockStatus.label}</Badge>
            </div>
            <div className="text-xs text-muted-foreground">
              Min: {article.minStock} {article.unit}
            </div>
          </div>
        </TableCell>
        <TableCell>
          <div className="flex items-center space-x-2">
            <span className="font-semibold">{article.quantityAvailable}</span>
            <span className="text-xs text-muted-foreground">{article.unit}</span>
          </div>
        </TableCell>
        <TableCell>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEditItem(article)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            {totalStock === 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Trash2 className="h-4 w-4" />
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
                    <AlertDialogAction onClick={() => onDeleteItem(article.id)}>
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </TableCell>
      </TableRow>

      {isExpanded && (
        <TableRow>
          <TableCell colSpan={10} className="bg-muted/30 p-0">
            <ItemStockDistribution article={article} />
          </TableCell>
        </TableRow>
      )}
    </React.Fragment>
  );
}