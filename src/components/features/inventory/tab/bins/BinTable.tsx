import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../ui/table';
import { Badge } from '../../../ui/badge';
import { Button } from '../../../ui/button';
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
import { Edit, Trash2 } from 'lucide-react';
import type { BinTableProps, Bin } from './types';

export function BinTable({ bins, onEdit, onDelete }: BinTableProps) {
  const getTypeBadge = (type: Bin['type']) => {
    switch (type) {
      case 'good-condition':
        return <Badge className="bg-green-600">Good Condition</Badge>;
      case 'on-revision':
        return <Badge className="bg-yellow-600">On Revision</Badge>;
      case 'scrap':
        return <Badge variant="destructive">Scrap</Badge>;
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>BIN Code</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bins.map((bin) => (
            <TableRow key={bin.id}>
              <TableCell className="font-mono">{bin.binCode}</TableCell>
              <TableCell>{getTypeBadge(bin.type)}</TableCell>
              <TableCell className="max-w-md truncate" title={bin.description}>
                {bin.description}
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" onClick={() => onEdit(bin)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Bin</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{bin.binCode}"? This action cannot be
                          undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => onDelete(bin.id)}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
