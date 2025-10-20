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
import type { KitRowProps } from './types';

export function KitRow({
  kit,
  articles,
  categories,
  isExpanded,
  onToggleExpand,
  onEditKit,
  onDeleteKit,
}: KitRowProps) {
  return (
    <React.Fragment>
      <TableRow>
        <TableCell>
          <Button variant="ghost" size="sm" onClick={() => onToggleExpand(kit.id)}>
            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        </TableCell>
        <TableCell>
          <div className="flex items-center space-x-3">
            {kit.imageUrl && (
              <img src={kit.imageUrl} alt={kit.name} className="w-10 h-10 object-cover rounded" />
            )}
            <div>
              <p className="font-medium">{kit.name}</p>
              <p className="text-sm text-muted-foreground">{kit.binCode}</p>
            </div>
          </div>
        </TableCell>
        <TableCell>{categories.find((c) => c.value === kit.category)?.label}</TableCell>
        <TableCell>
          <Badge variant="outline">{kit.items.length} items</Badge>
        </TableCell>
        <TableCell>
          <Badge className="bg-green-600">
            {kit.status === 'good-condition' ? 'Good Condition' : kit.status}
          </Badge>
        </TableCell>
        <TableCell className="text-right">
          <div className="flex justify-end space-x-2">
            <Button variant="ghost" size="sm" onClick={() => onEditKit(kit)}>
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
                  <AlertDialogTitle>Delete Kit</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete "{kit.name}"? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onDeleteKit(kit.id)}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </TableCell>
      </TableRow>
      {isExpanded && (
        <TableRow>
          <TableCell colSpan={6} className="bg-muted/30 p-0">
            <div className="p-4">
              {kit.description && (
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground mb-1">Description</p>
                  <p>{kit.description}</p>
                </div>
              )}
              <h4 className="flex items-center mb-3">
                <Package className="h-4 w-4 mr-2" />
                Items in this kit
              </h4>
              <div className="rounded-md border bg-card">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-20">Image</TableHead>
                      <TableHead>BIN Code</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Quantity</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {kit.items.map((item, index) => {
                      const article = articles.find((a) => a.binCode === item.articleBinCode);
                      return (
                        <TableRow key={index}>
                          <TableCell>
                            {article?.imageUrl ? (
                              <img
                                src={article.imageUrl}
                                alt={item.articleName}
                                className="w-12 h-12 object-cover rounded"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                                <Package className="h-6 w-6 text-muted-foreground" />
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="font-mono">{item.articleBinCode}</TableCell>
                          <TableCell>{item.articleName}</TableCell>
                          <TableCell>
                            <Badge variant="outline">x{item.quantity}</Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
              <div className="flex gap-4 text-sm mt-3">
                <div>
                  <span className="text-muted-foreground">Created:</span>
                  <span className="ml-2">{kit.createdAt}</span>
                </div>
              </div>
            </div>
          </TableCell>
        </TableRow>
      )}
    </React.Fragment>
  );
}
