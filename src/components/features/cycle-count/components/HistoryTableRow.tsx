import { Button } from '../../../ui/button';
import { Badge } from '../../../ui/badge';
import { TableCell, TableRow } from '../../../ui/table';
import { CheckCircle, Clock, PlayCircle, FileText, Printer, Download } from 'lucide-react';
import { CycleCountRecord } from '../hooks/useCycleCountHistory';

interface HistoryTableRowProps {
  record: CycleCountRecord;
  onView: (record: CycleCountRecord) => void;
  onContinue?: (record: CycleCountRecord) => void;
  onPrint: (record: CycleCountRecord) => void;
  onDownload: (record: CycleCountRecord) => void;
}

export function HistoryTableRow({ 
  record, 
  onView, 
  onContinue, 
  onPrint, 
  onDownload 
}: HistoryTableRowProps) {
  const accuracy = record.status === 'completed'
    ? Math.round((1 - record.discrepancies / record.totalItems) * 100)
    : 0;
  
  return (
    <TableRow>
      <TableCell>{record.date}</TableCell>
      <TableCell>{record.countName || '-'}</TableCell>
      <TableCell>{record.zone === 'all' ? 'All Zones' : record.zone}</TableCell>
      <TableCell>
        {record.status === 'completed' ? (
          <Badge variant="default" className="bg-green-600">
            <CheckCircle className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        ) : (
          <Badge variant="outline" className="text-orange-600 border-orange-600">
            <Clock className="h-3 w-3 mr-1" />
            In Progress
          </Badge>
        )}
      </TableCell>
      <TableCell>{record.totalItems}</TableCell>
      <TableCell>{record.counted}</TableCell>
      <TableCell>
        {record.discrepancies > 0 ? (
          <Badge variant="destructive">{record.discrepancies}</Badge>
        ) : (
          <Badge variant="default" className="bg-green-600">0</Badge>
        )}
      </TableCell>
      <TableCell>
        {record.status === 'completed' ? (
          <span className={accuracy >= 95 ? 'text-green-600' : 'text-orange-600'}>
            {accuracy}%
          </span>
        ) : (
          <span className="text-muted-foreground">-</span>
        )}
      </TableCell>
      <TableCell>
        <div className="flex space-x-2">
          {record.status === 'in-progress' ? (
            <>
              <Button
                variant="default"
                size="sm"
                onClick={() => onContinue && onContinue(record)}
              >
                <PlayCircle className="h-4 w-4 mr-1" />
                Resume
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPrint(record)}
              >
                <Printer className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDownload(record)}
              >
                <Download className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onView(record)}
              >
                <FileText className="h-4 w-4 mr-1" />
                View
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPrint(record)}
              >
                <Printer className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDownload(record)}
              >
                <Download className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}
