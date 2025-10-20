import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../ui/table';
import { ArrowUpDown } from 'lucide-react';
import type { MovementTableProps } from './types';

export function MovementTable({ movements, getMovementIcon, getMovementBadge }: MovementTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <ArrowUpDown className="h-5 w-5" />
          <span>Recent Movements ({movements.length})</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Article</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Reference</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {movements.map((movement) => (
              <TableRow key={movement.id}>
                <TableCell>{movement.date}</TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    {getMovementIcon(movement.type)}
                    {getMovementBadge(movement.type, movement.subtype)}
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-mono text-sm">{movement.articleCode}</p>
                    <p className="text-xs text-muted-foreground">{movement.articleDescription}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <span
                    className={
                      movement.type === 'exit' || (movement.type === 'adjustment' && movement.quantity < 0)
                        ? 'text-red-600'
                        : 'text-green-600'
                    }
                  >
                    {movement.type === 'exit' || (movement.type === 'adjustment' && movement.quantity < 0)
                      ? '-'
                      : '+'}
                    {Math.abs(movement.quantity)} {movement.unit}
                  </span>
                </TableCell>
                <TableCell className="font-mono text-sm">{movement.reference}</TableCell>
                <TableCell>{movement.user}</TableCell>
                <TableCell className="max-w-xs truncate">{movement.project}</TableCell>
                <TableCell className="max-w-xs truncate">{movement.notes}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
