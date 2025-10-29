import React, { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue
} from '../../../ui/select';
import { Input } from '../../../ui/input';
import { getAvailableBins, type Bin } from '../services/binsService';
import { Loader2 } from 'lucide-react';

interface BinSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  currentBin?: string;
  required?: boolean;
  binPurpose?: number;
  disabled?: boolean;
}

export function BinSelector({
  value,
  onValueChange,
  placeholder = "Select bin",
  currentBin,
  required = false,
  binPurpose,
  disabled = false
}: BinSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [bins, setBins] = useState<Bin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load bins from API on mount or when binPurpose changes
  useEffect(() => {
    async function loadBins() {
      try {
        setLoading(true);
        setError(null);
        const availableBins = await getAvailableBins(binPurpose);
        setBins(availableBins);
      } catch (err) {
        console.error('Error loading bins:', err);
        setError(err instanceof Error ? err.message : 'Failed to load bins');
      } finally {
        setLoading(false);
      }
    }

    loadBins();
  }, [binPurpose]);

  // Group bins by type
  const goodConditionBins = bins.filter(b => b.type === 'good-condition' && b.binCode !== currentBin);
  const onRevisionBins = bins.filter(b => b.type === 'on-revision' && b.binCode !== currentBin);
  const scrapBins = bins.filter(b => b.type === 'scrap' && b.binCode !== currentBin);
  const currentBinData = currentBin ? bins.find(b => b.binCode === currentBin) : null;

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
    <Select value={value} onValueChange={onValueChange} required={required} disabled={loading || disabled}>
      <SelectTrigger>
        <SelectValue placeholder={loading ? "Loading bins..." : error ? "Error loading bins" : placeholder} />
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

        {loading ? (
          <div className="flex items-center justify-center p-4">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground mr-2" />
            <span className="text-sm text-muted-foreground">Loading bins...</span>
          </div>
        ) : error ? (
          <div className="p-2 text-sm text-destructive text-center">
            {error}
          </div>
        ) : hasResults ? (
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

/*import React, { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../ui/select";
import { getNewBins } from "../services/inventoryApi"; // Ajusta ruta si es necesario

interface Bin {
  id: number;
  binCode: string;
  type: "good-condition" | "on-revision" | "scrap";
  description?: string;
}

interface BinSelectorProps {
  value: string; // binCode seleccionado
  onValueChange: (bin: { id: number; binCode: string }) => void; // devolvemos ambos
  placeholder?: string;
  required?: boolean;
}

export function BinSelector({
  value,
  onValueChange,
  placeholder = "Select a bin",
  required = false,
}: BinSelectorProps) {
  const [bins, setBins] = useState<Bin[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBins = async () => {
      try {
        const response = await getNewBins();
        // 🔸 Filtramos solo los bins de tipo good-condition
        const goodConditionBins = (response || []).filter(
          (b: Bin) => b.type === "good-condition"
        );
        setBins(goodConditionBins);
      } catch (error) {
        console.error("Error fetching bins:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBins();
  }, []);

  const handleValueChange = (selectedCode: string) => {
    const selectedBin = bins.find((b) => b.binCode === selectedCode);
    if (selectedBin) {
      onValueChange({ id: selectedBin.id, binCode: selectedBin.binCode });
    }
  };

  return (
    <Select value={value} onValueChange={handleValueChange} required={required}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={loading ? "Loading bins..." : placeholder} />
      </SelectTrigger>

      <SelectContent>
        {loading ? (
          <SelectItem disabled value="loading">
            Loading...
          </SelectItem>
        ) : bins.length > 0 ? (
          bins.map((bin) => (
            <SelectItem key={bin.id} value={bin.binCode}>
              {bin.binCode} — {bin.description || "No description"}
            </SelectItem>
          ))
        ) : (
          <SelectItem disabled value="none">
            No bins available
          </SelectItem>
        )}
      </SelectContent>
    </Select>
  );
}*/
