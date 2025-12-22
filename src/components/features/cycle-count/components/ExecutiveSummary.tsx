import { Card, CardContent, CardHeader, CardTitle } from '../../../ui/card';
import { TrendingUp } from 'lucide-react';

interface ExecutiveSummaryProps {
  accuracy: number;
  totalItems: number;
  discrepancies: number;
}

export function ExecutiveSummary({ accuracy, totalItems, discrepancies }: ExecutiveSummaryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <TrendingUp className="h-5 w-5" />
          <span>Executive Summary</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">Inventory Accuracy</p>
            <p className={`text-4xl ${accuracy >= 95 ? 'text-green-600' : 'text-orange-600'}`}>
              {accuracy}%
            </p>
          </div>
          <div className="text-center p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">Total Items Reviewed</p>
            <p className="text-4xl">{totalItems}</p>
          </div>
          <div className="text-center p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">Total Discrepancies</p>
            <p className="text-4xl text-red-600">{discrepancies}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
