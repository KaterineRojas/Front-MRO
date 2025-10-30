import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../ui/card';
import { Button } from '../../../..//ui/button';
import { Input } from '../../../../ui/input';
import { Badge } from '../../../../ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../../ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../../../ui/tooltip';
import {
  ArrowUpDown,
  Download,
  X,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Search,
  Loader2,
} from 'lucide-react';
import { TransactionBadge } from './TransactionBadge';
import {
  formatTransactionDate,
  formatQuantityChange,
  truncateText,
  exportToCSV,
  sortTransactionsByDate,
} from './transactionUtils';
import type {
  Transaction,
  TransactionsTableProps,
  TransactionFilters,
  PaginationState,
  TransactionType,
} from './transactionTypes';

const TRANSACTION_TYPES: TransactionType[] = [
  'Entry',
  'Exit',
  'Loan',
  'Return',
  'Relocation',
  'Adjustment',
  'Kit',
  'KitCreated',
];

const ITEMS_PER_PAGE_OPTIONS = [25, 50, 100];

export function TransactionsTable({
  transactions,
  loading = false,
  showItemColumn = true,
  title = 'Transactions',
  onItemClick,
  onBinClick,
}: TransactionsTableProps) {
  // Filters state
  const [filters, setFilters] = useState<TransactionFilters>({
    types: [],
    dateFrom: null,
    dateTo: null,
    searchQuery: '',
  });

  // Search input state (for debouncing)
  const [searchInput, setSearchInput] = useState('');

  // Pagination state
  const [pagination, setPagination] = useState<PaginationState>({
    currentPage: 1,
    itemsPerPage: 25,
    totalItems: 0,
  });

  // Sorting state
  const [sortAscending, setSortAscending] = useState(false);

  // Debounced search effect
  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      setFilters((prev) => ({ ...prev, searchQuery: searchInput }));
      setPagination((prev) => ({ ...prev, currentPage: 1 }));
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchInput]);

  // Filter and sort transactions
  const filteredTransactions = useMemo(() => {
    let result = [...transactions];

    // Sort by date
    result = sortTransactionsByDate(result, sortAscending);

    // Filter by type
    if (filters.types.length > 0) {
      result = result.filter((t) => filters.types.includes(t.transactionType));
    }

    // Filter by date range
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      result = result.filter((t) => new Date(t.createdAt) >= fromDate);
    }

    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      toDate.setHours(23, 59, 59, 999);
      result = result.filter((t) => new Date(t.createdAt) <= toDate);
    }

    // Filter by search query (item name or SKU)
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      result = result.filter(
        (t) => t.itemName.toLowerCase().includes(query) || t.itemSku.toLowerCase().includes(query)
      );
    }

    return result;
  }, [transactions, filters, sortAscending]);

  // Paginated transactions
  const paginatedTransactions = useMemo(() => {
    const startIndex = (pagination.currentPage - 1) * pagination.itemsPerPage;
    const endIndex = startIndex + pagination.itemsPerPage;
    return filteredTransactions.slice(startIndex, endIndex);
  }, [filteredTransactions, pagination.currentPage, pagination.itemsPerPage]);

  // Update total items when filtered transactions change
  React.useEffect(() => {
    setPagination((prev) => ({ ...prev, totalItems: filteredTransactions.length }));
  }, [filteredTransactions.length]);

  // Calculate pagination info
  const totalPages = Math.ceil(filteredTransactions.length / pagination.itemsPerPage);
  const startItem = (pagination.currentPage - 1) * pagination.itemsPerPage + 1;
  const endItem = Math.min(pagination.currentPage * pagination.itemsPerPage, filteredTransactions.length);

  // Handlers
  const handleTypeToggle = (type: TransactionType) => {
    setFilters((prev) => ({
      ...prev,
      types: prev.types.includes(type) ? prev.types.filter((t) => t !== type) : [...prev.types, type],
    }));
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  const handleClearFilters = () => {
    setFilters({
      types: [],
      dateFrom: null,
      dateTo: null,
      searchQuery: '',
    });
    setSearchInput('');
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  const handleExport = () => {
    exportToCSV(filteredTransactions, `transactions_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, currentPage: newPage }));
  };

  const handleItemsPerPageChange = (value: string) => {
    setPagination({
      currentPage: 1,
      itemsPerPage: parseInt(value, 10),
      totalItems: filteredTransactions.length,
    });
  };

  const hasActiveFilters =
    filters.types.length > 0 || filters.dateFrom || filters.dateTo || filters.searchQuery;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{title}</span>
          <Button variant="outline" size="sm" onClick={handleExport} disabled={loading || filteredTransactions.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters Section */}
        <div className="space-y-3">
          {/* Search and Date Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search by item name or SKU..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Date From */}
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
              <Input
                type="date"
                placeholder="From date"
                value={filters.dateFrom || ''}
                onChange={(e) => {
                  setFilters((prev) => ({ ...prev, dateFrom: e.target.value }));
                  setPagination((prev) => ({ ...prev, currentPage: 1 }));
                }}
                className="pl-10 [&::-webkit-calendar-picker-indicator]:hidden"
              />
            </div>

            {/* Date To */}
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
              <Input
                type="date"
                placeholder="To date"
                value={filters.dateTo || ''}
                onChange={(e) => {
                  setFilters((prev) => ({ ...prev, dateTo: e.target.value }));
                  setPagination((prev) => ({ ...prev, currentPage: 1 }));
                }}
                className="pl-10 [&::-webkit-calendar-picker-indicator]:hidden"
              />
            </div>
          </div>

          {/* Transaction Type Filters */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm text-muted-foreground font-medium">Filter by type:</span>
            {TRANSACTION_TYPES.map((type) => (
              <Badge
                key={type}
                variant={filters.types.includes(type) ? 'default' : 'outline'}
                className="cursor-pointer transition-colors"
                onClick={() => handleTypeToggle(type)}
              >
                {type}
              </Badge>
            ))}
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={handleClearFilters}>
                <X className="h-4 w-4 mr-1" />
                Clear all
              </Button>
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredTransactions.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            {hasActiveFilters ? 'No transactions match your filters' : 'No transactions found'}
          </div>
        )}

        {/* Desktop Table */}
        {!loading && filteredTransactions.length > 0 && (
          <>
            <div className="hidden md:block border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[150px]">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 hover:bg-transparent"
                        onClick={() => setSortAscending(!sortAscending)}
                      >
                        Date/Time
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead className="w-[130px]">Type</TableHead>
                    <TableHead className="w-[130px]">SubType</TableHead>
                    {showItemColumn && <TableHead className="w-[200px]">Item</TableHead>}
                    <TableHead className="w-[100px] text-center">Quantity</TableHead>
                    <TableHead className="w-[130px]">From</TableHead>
                    <TableHead className="w-[130px]">To</TableHead>
                    <TableHead className="w-[200px]">Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedTransactions.map((transaction) => {
                    const { line1, line2, fullDate } = formatTransactionDate(transaction.createdAt);
                    const { displayText, isPositive } = formatQuantityChange(transaction.quantityChange);

                    return (
                      <TableRow key={transaction.id}>
                        {/* Date/Time */}
                        <TableCell>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="text-sm cursor-help">
                                  <div className="font-medium">{line1}</div>
                                  <div className="text-muted-foreground">{line2}</div>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{fullDate}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </TableCell>

                        {/* Type */}
                        <TableCell>
                          <TransactionBadge type={transaction.transactionType} />
                        </TableCell>

                        {/* SubType */}
                        <TableCell>
                          <span className="text-sm">{transaction.subType}</span>
                        </TableCell>

                        {/* Item */}
                        {showItemColumn && (
                          <TableCell>
                            <button
                              onClick={() => onItemClick?.(transaction.itemSku)}
                              className="text-left hover:underline focus:outline-none focus:ring-2 focus:ring-primary rounded"
                            >
                              <div className="font-medium">{transaction.itemName}</div>
                              <div className="text-xs text-muted-foreground font-mono">{transaction.itemSku}</div>
                            </button>
                          </TableCell>
                        )}

                        {/* Quantity */}
                        <TableCell className="text-center">
                          <span
                            className={`font-bold ${
                              isPositive
                                ? 'text-green-600 dark:text-green-400'
                                : 'text-red-600 dark:text-red-400'
                            }`}
                          >
                            {displayText}
                          </span>
                        </TableCell>

                        {/* From */}
                        <TableCell>
                          {transaction.fromBin ? (
                            <Badge
                              variant="secondary"
                              className="cursor-pointer hover:bg-secondary/80"
                              onClick={() => onBinClick?.(transaction.fromBin!)}
                            >
                              {transaction.fromBin}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>

                        {/* To */}
                        <TableCell>
                          {transaction.toBin ? (
                            <Badge
                              variant="secondary"
                              className="cursor-pointer hover:bg-secondary/80"
                              onClick={() => onBinClick?.(transaction.toBin!)}
                            >
                              {transaction.toBin}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>

                        {/* Notes */}
                        <TableCell>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="text-sm cursor-help">
                                  {truncateText(transaction.notes, 40)}
                                </span>
                              </TooltipTrigger>
                              {transaction.notes && transaction.notes.length > 40 && (
                                <TooltipContent>
                                  <p className="max-w-xs">{transaction.notes}</p>
                                </TooltipContent>
                              )}
                            </Tooltip>
                          </TooltipProvider>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Pagination Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t">
              {/* Items per page + info */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Show:</span>
                  <Select
                    value={pagination.itemsPerPage.toString()}
                    onValueChange={handleItemsPerPageChange}
                  >
                    <SelectTrigger className="w-[80px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ITEMS_PER_PAGE_OPTIONS.map((option) => (
                        <SelectItem key={option} value={option.toString()}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <span className="text-sm text-muted-foreground">
                  Showing {startItem}-{endItem} of {filteredTransactions.length} transactions
                </span>
              </div>

              {/* Page navigation */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {pagination.currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
