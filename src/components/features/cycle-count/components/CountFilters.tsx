import { Card, CardContent } from '../../../ui/card';
import { Input } from '../../../ui/input';
import { Label } from '../../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../ui/select';

interface CountFiltersProps {
  searchTerm: string;
  selectedZone: string;
  countType: 'Annual' | 'Biannual' | 'Spot Check';
  auditor: string;
  zones: string[];
  onSearchChange: (value: string) => void;
  onZoneChange: (value: string) => void;
  onCountTypeChange: (value: 'Annual' | 'Biannual' | 'Spot Check') => void;
  onAuditorChange: (value: string) => void;
}

export function CountFilters({
  searchTerm,
  selectedZone,
  countType,
  auditor,
  zones,
  onSearchChange,
  onZoneChange,
  onCountTypeChange,
  onAuditorChange
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
            <Select value={selectedZone} onValueChange={onZoneChange}>
              <SelectTrigger className="w-48 mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {zones.map(zone => (
                  <SelectItem key={zone} value={zone}>
                    {zone === 'all' ? 'All Zones' : zone}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Count Type</Label>
            <Select value={countType} onValueChange={onCountTypeChange}>
              <SelectTrigger className="w-48 mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Annual">Annual</SelectItem>
                <SelectItem value="Biannual">Biannual</SelectItem>
                <SelectItem value="Spot Check">Spot Check</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Auditor</Label>
            <Input
              value={auditor}
              onChange={(e) => onAuditorChange(e.target.value)}
              placeholder="Enter auditor name"
              className="w-48 mt-1"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
