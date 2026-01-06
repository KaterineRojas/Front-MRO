import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '../../../ui/sheet';
import { Button } from '../../../ui/button';
import { Input } from '../../../ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../ui/table';
import { AlertTriangle, CheckCircle, Loader2, X } from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';
import { CountedArticle } from '../types';

interface ResolveDiscrepanciesModalProps {
  isOpen: boolean;
  onClose: () => void;
  discrepancies: CountedArticle[];
  onConfirm: (recounts: Record<string, { newCount: number; reason: string }>) => Promise<void>;
  isSubmitting?: boolean;
}

export function ResolveDiscrepanciesModal({
  isOpen,
  onClose,
  discrepancies,
  onConfirm,
  isSubmitting = false
}: ResolveDiscrepanciesModalProps) {
  // Initialize recounts with existing physicalCount values
  const [recounts, setRecounts] = useState<Record<string, { newCount: number; reason: string }>>(() => {
    const initial: Record<string, { newCount: number; reason: string }> = {};
    discrepancies.forEach(article => {
      initial[article.code] = {
        newCount: article.physicalCount || 0,
        reason: ''
      };
    });
    return initial;
  });

  // Update recounts when discrepancies change
  useEffect(() => {
    const initial: Record<string, { newCount: number; reason: string }> = {};
    discrepancies.forEach(article => {
      initial[article.code] = {
        newCount: article.physicalCount || 0,
        reason: ''
      };
    });
    setRecounts(initial);
  }, [discrepancies]);

  const handleCountChange = (code: string, value: string) => {
    const newCount = value === '' ? 0 : parseInt(value, 10);
    if (!isNaN(newCount)) {
      setRecounts(prev => ({
        ...prev,
        [code]: { ...prev[code], newCount }
      }));
    }
  };

  const handleReasonChange = (code: string, reason: string) => {
    setRecounts(prev => ({
      ...prev,
      [code]: { ...prev[code], reason }
    }));
  };

  const handleConfirm = async () => {
    // Validate all discrepancies have final counts
    const missingCounts = discrepancies.filter(article => {
      const recount = recounts[article.code];
      return recount?.newCount === undefined || recount?.newCount === null;
    });

    if (missingCounts.length > 0) {
      alert(`Please provide final counts for all ${missingCounts.length} discrepancies before confirming.`);
      return;
    }

    console.log('🔍 [Modal] Confirming with recounts:', recounts);
    await onConfirm(recounts);
    setRecounts({}); // Reset after confirm
  };

  const handleCancel = () => {
    setRecounts({}); // Reset on cancel
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleCancel}>
      <SheetContent side="right" className="w-full sm:max-w-full p-0 flex flex-col">
        <SheetHeader className="px-6 py-4 border-b">
          <SheetTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <span>Resolve Discrepancies Before Completing</span>
            </div>
            <Button variant="ghost" size="icon" onClick={handleCancel} disabled={isSubmitting}>
              <X className="h-4 w-4" />
            </Button>
          </SheetTitle>
          <SheetDescription>
            The following {discrepancies.length} items have discrepancies between system quantity and physical count. 
            Please provide the final count value and reason for each item to resolve them before completing the cycle count.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-auto px-6 py-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Image</TableHead>
                <TableHead>Item</TableHead>
                <TableHead className="text-right">System Qty</TableHead>
                <TableHead className="text-right">Physical Count</TableHead>
                <TableHead className="text-right">Variance</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Final Count</TableHead>
                <TableHead>Reason</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {discrepancies.map((article) => (
                <TableRow key={article.code}>
                  <TableCell className="font-mono">{article.code}</TableCell>
                  <TableCell>
                    {article.imageUrl ? (
                      <img 
                        src={article.imageUrl} 
                        alt={article.description}
                        className="w-12 h-12 object-cover rounded"
                        onError={(e) => {
                          e.currentTarget.src = 'https://via.placeholder.com/48?text=No+Image';
                        }}
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-400">
                        No img
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{article.description}</p>
                      <p className="text-xs text-muted-foreground">{article.zone}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">{article.totalRegistered}</TableCell>
                  <TableCell className="text-right">{article.physicalCount}</TableCell>
                  <TableCell className="text-right">
                    <span className={article.physicalCount < article.totalRegistered ? 'text-red-600 font-semibold' : 'text-green-600 font-semibold'}>
                      {article.physicalCount - article.totalRegistered}
                    </span>
                  </TableCell>
                  <TableCell><StatusBadge status={article.status} /></TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      placeholder="Final count"
                      value={recounts[article.code]?.newCount ?? ''}
                      onChange={(e) => handleCountChange(article.code, e.target.value)}
                      disabled={isSubmitting}
                      className="w-28"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="text"
                      placeholder="Reason for adjustment"
                      value={recounts[article.code]?.reason ?? ''}
                      onChange={(e) => handleReasonChange(article.code, e.target.value)}
                      disabled={isSubmitting}
                      className="w-64"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <SheetFooter className="px-6 py-4 border-t bg-muted/50">
          <div className="flex items-center justify-between w-full">
            <p className="text-sm text-muted-foreground">
              {discrepancies.length} discrepancies to resolve
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCancel} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button onClick={handleConfirm} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Confirm & Complete Count
                  </>
                )}
              </Button>
            </div>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
