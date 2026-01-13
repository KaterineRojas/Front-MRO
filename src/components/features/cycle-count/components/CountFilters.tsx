import { Card, CardContent } from '../../../ui/card';
import { Input } from '../../../ui/input';
import { Label } from '../../../ui/label';

interface CountFiltersProps {
  searchTerm: string;
  selectedZone: string;
  countType: 'Annual' | 'Biannual' | 'Spot Check';
  auditor: string;
  zones: string[];
  onSearchChange: (value: string) => void;
}

export function CountFilters({
  searchTerm,
  selectedZone,
  countType,
  auditor,
  onSearchChange
}: CountFiltersProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-64">
            <Label htmlFor="search">Search</Label>
            <Input
              id="search"
              placeholder="Search by code or item name..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label>Zone</Label>
            <div className="w-48 mt-1 p-2 bg-muted rounded-md text-sm">
              {selectedZone === 'all' ? 'All Zones' : selectedZone}
            </div>
          </div>
          <div>
            <Label>Count Type</Label>
            <div className="w-48 mt-1 p-2 bg-muted rounded-md text-sm">
              {countType}
            </div>
          </div>
          <div>
            <Label>Auditor</Label>
            <div className="w-48 mt-1 p-2 bg-muted rounded-md text-sm">
              {auditor}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
