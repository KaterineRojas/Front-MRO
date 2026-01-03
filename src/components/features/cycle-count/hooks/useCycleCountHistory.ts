import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppSelector } from '../../../../store/hooks';
import { getCycleCounts, MappedCycleCountRecord, getCycleCountStatistics } from '../services/cycleCountService';

interface CountedArticle {
  code: string;
  description: string;
  zone: string;
  totalRegistered: number;
  physicalCount: number;
  status: 'match' | 'discrepancy';
  observations?: string;
  adjustment?: number;
  adjustmentReason?: string;
}

export interface CycleCountRecord {
  id: number;
  date: string;
  completedDate?: string;
  zone: string;
  status: 'in-progress' | 'completed';
  countType: 'Annual' | 'Biannual' | 'Spot Check';
  auditor: string;
  totalItems: number;
  counted: number;
  discrepancies: number;
  articles: CountedArticle[];
  adjustmentsApplied?: boolean;
  countName?: string;
}

/**
 * Converts MappedCycleCountRecord from API to CycleCountRecord for UI
 */
function mapApiRecordToUI(mappedRecord: MappedCycleCountRecord): CycleCountRecord {
  return {
    id: mappedRecord.id,
    date: mappedRecord.date,
    completedDate: mappedRecord.completedDate,
    zone: mappedRecord.zone,
    status: mappedRecord.status,
    countType: mappedRecord.countType,
    auditor: mappedRecord.auditor,
    totalItems: mappedRecord.totalItems,
    counted: mappedRecord.counted,
    discrepancies: mappedRecord.discrepancies,
    articles: [], // Articles will be loaded separately when viewing details
    adjustmentsApplied: mappedRecord.adjustmentsApplied,
    countName: mappedRecord.countName
  };
}

export function useCycleCountHistory() {
  const location = useLocation();
  const user = useAppSelector(state => state.auth.user);
  const warehouseId = user?.warehouseId || 1;
  
  const [history, setHistory] = useState<CycleCountRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchCycleCounts = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch cycle counts from API
        const { records } = await getCycleCounts(warehouseId, 1, 20);
        
        // Convert API records to UI format and fetch statistics for each
        const uiRecords = await Promise.all(
          records.map(async (record) => {
            try {
              // Fetch statistics for this cycle count
              const stats = await getCycleCountStatistics(record.id);
              
              // Update the record with correct statistics
              return {
                ...mapApiRecordToUI(record),
                totalItems: stats.totalEntries,
                counted: stats.countedEntries,
                discrepancies: stats.entriesWithVariance
              };
            } catch (error) {
              console.warn(`Failed to fetch statistics for cycle count ${record.id}:`, error);
              // Fallback to the record as-is if statistics fail
              return mapApiRecordToUI(record);
            }
          })
        );
        
        // Merge with any local records from sessionStorage (for in-progress counts saved locally)
        const savedHistory = sessionStorage.getItem('cycleCountHistory');
        const localHistory: CycleCountRecord[] = savedHistory
          ? JSON.parse(savedHistory) as CycleCountRecord[]
          : [];

        // Create a map of API records by ID
        const apiMap = new Map(uiRecords.map(record => [record.id, record]));
        
        // Merge: API records take precedence, but keep local-only records (those not in API)
        const mergedHistory: CycleCountRecord[] = [];
        
        // Add all API records
        uiRecords.forEach(record => mergedHistory.push(record));
        
        // Add local records that don't exist in API (e.g., newly created in-progress counts)
        localHistory.forEach(localRecord => {
          if (!apiMap.has(localRecord.id)) {
            mergedHistory.unshift(localRecord); // Add at the beginning
          }
        });

        // Sort by date descending (most recent first)
        mergedHistory.sort((a, b) => {
          const dateA = new Date(a.completedDate || a.date).getTime();
          const dateB = new Date(b.completedDate || b.date).getTime();
          return dateB - dateA;
        });

        setHistory(mergedHistory);
      } catch (err) {
        console.error('Error fetching cycle counts:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch cycle counts'));
        
        // Fallback to sessionStorage if API fails
        const savedHistory = sessionStorage.getItem('cycleCountHistory');
        if (savedHistory) {
          const localHistory: CycleCountRecord[] = JSON.parse(savedHistory);
          setHistory(localHistory);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchCycleCounts();
  }, [location.key, warehouseId]);

  return { history, setHistory, isLoading, error };
}
