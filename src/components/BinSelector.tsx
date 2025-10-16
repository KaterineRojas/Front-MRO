import React, { useState } from 'react';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectSeparator, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';

interface Bin {
  binCode: string;
  type: 'good-condition' | 'on-revision' | 'scrap';
  description: string;
}

interface BinSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  currentBin?: string;
  required?: boolean;
  disabled?: boolean;
}

const mockBins: Bin[] = [
  { binCode: 'BIN-OFF-001', type: 'good-condition', description: 'Storage for office paper and writing supplies' },
  { binCode: 'BIN-TECH-002', type: 'good-condition', description: 'IT equipment and electronics storage' },
  { binCode: 'BIN-USB-003', type: 'good-condition', description: 'Cables and accessories bin' },
  { binCode: 'BIN-TOOL-004', type: 'on-revision', description: 'Power tools and equipment storage' },
  { binCode: 'BIN-SAFE-005', type: 'good-condition', description: 'PPE and safety gear storage' },
  { binCode: 'BIN-STORAGE-001', type: 'good-condition', description: 'Main storage area' },
  { binCode: 'BIN-BACKUP-002', type: 'good-condition', description: 'Backup storage' },
  { binCode: 'BIN-SCRAP-001', type: 'scrap', description: 'Items for disposal' },
  { binCode: 'BIN-A-001', type: 'good-condition', description: 'Warehouse A Section 1' },
  { binCode: 'BIN-A-002', type: 'good-condition', description: 'Warehouse A Section 2' },
  { binCode: 'BIN-B-001', type: 'good-condition', description: 'Warehouse B Section 1' },
  { binCode: 'BIN-B-002', type: 'good-condition', description: 'Warehouse B Section 2' },
  { binCode: 'BIN-C-001', type: 'on-revision', description: 'Warehouse C Section 1' },
  { binCode: 'BIN-C-002', type: 'good-condition', description: 'Warehouse C Section 2' }
];

export function BinSelector({ value, onValueChange, placeholder = "Select bin", currentBin, required = false }: BinSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');

  // Group bins by type
  const goodConditionBins = mockBins.filter(b => b.type === 'good-condition' && b.binCode !== currentBin);
  const onRevisionBins = mockBins.filter(b => b.type === 'on-revision' && b.binCode !== currentBin);
  const scrapBins = mockBins.filter(b => b.type === 'scrap' && b.binCode !== currentBin);
  const currentBinData = currentBin ? mockBins.find(b => b.binCode === currentBin) : null;

  // Filter bins based on search term
  const filterBins = (bins: Bin[]) => {
    return bins.filter(bin => 
      bin.binCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bin.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const filteredGoodCondition = filterBins(goodConditionBins);
  const filteredOnRevision = filterBins(onRevisionBins);
  const filteredScrap = filterBins(scrapBins);

  const hasResults = filteredGoodCondition.length > 0 || filteredOnRevision.length > 0 || filteredScrap.length > 0 || (currentBinData && searchTerm === '');

  return (
    <Select value={value} onValueChange={onValueChange} required={required}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <div className="p-2 sticky top-0 bg-background z-10">
          <Input
            placeholder="Search bins..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            className="mb-2"
          />
        </div>
        
        {hasResults ? (
          <>
            {/* Current Bin Group */}
            {currentBinData && searchTerm === '' && (
              <>
                <SelectGroup>
                  <SelectLabel>Current Bin</SelectLabel>
                  <SelectItem value={currentBinData.binCode}>
                    {currentBinData.binCode} - {currentBinData.description}
                  </SelectItem>
                </SelectGroup>
                <SelectSeparator />
              </>
            )}

            {/* Good Condition Bins */}
            {filteredGoodCondition.length > 0 && (
              <SelectGroup>
                <SelectLabel>Good Condition Bins</SelectLabel>
                {filteredGoodCondition.map((bin) => (
                  <SelectItem key={bin.binCode} value={bin.binCode}>
                    {bin.binCode} - {bin.description}
                  </SelectItem>
                ))}
              </SelectGroup>
            )}

            {/* On Revision Bins */}
            {filteredOnRevision.length > 0 && (
              <>
                {filteredGoodCondition.length > 0 && <SelectSeparator />}
                <SelectGroup>
                  <SelectLabel>On Revision Bins</SelectLabel>
                  {filteredOnRevision.map((bin) => (
                    <SelectItem key={bin.binCode} value={bin.binCode}>
                      {bin.binCode} - {bin.description}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </>
            )}

            {/* Scrap Bins */}
            {filteredScrap.length > 0 && (
              <>
                {(filteredGoodCondition.length > 0 || filteredOnRevision.length > 0) && <SelectSeparator />}
                <SelectGroup>
                  <SelectLabel>Scrap Bins</SelectLabel>
                  {filteredScrap.map((bin) => (
                    <SelectItem key={bin.binCode} value={bin.binCode}>
                      {bin.binCode} - {bin.description}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </>
            )}
          </>
        ) : (
          <div className="p-2 text-sm text-muted-foreground text-center">
            No bins found
          </div>
        )}
      </SelectContent>
    </Select>
  );
}
