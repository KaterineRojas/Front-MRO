import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

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
}

const mockCycleCountHistory: CycleCountRecord[] = [
  {
    id: 1,
    date: '2025-09-25',
    completedDate: '2025-09-25 14:30:00',
    zone: 'All Zones',
    status: 'completed',
    countType: 'Annual',
    auditor: 'Felicia',
    totalItems: 7,
    counted: 7,
    discrepancies: 2,
    articles: [
      {
        code: 'AMX01-ZGC-R01-L04-B01',
        description: 'Premium Electronic Components',
        zone: 'Good Condition',
        totalRegistered: 25,
        physicalCount: 23,
        status: 'discrepancy',
        observations: 'Found 2 units missing from expected count'
      },
      {
        code: 'AMX01-ZGC-R02-L03-B05',
        description: 'Digital Multimeter Pro',
        zone: 'Good Condition',
        totalRegistered: 15,
        physicalCount: 15,
        status: 'match'
      },
      {
        code: 'AMX01-ZDM-R01-L02-B03',
        description: 'Cracked Display Panel',
        zone: 'Damaged',
        totalRegistered: 8,
        physicalCount: 8,
        status: 'match'
      },
      {
        code: 'AMX01-ZDM-R03-L01-B02',
        description: 'Used Battery Pack',
        zone: 'Damaged',
        totalRegistered: 12,
        physicalCount: 14,
        status: 'discrepancy',
        observations: 'Found 2 additional units not previously registered'
      },
      {
        code: 'AMX01-ZQT-R01-L01-B01',
        description: 'Unverified Components',
        zone: 'Quarantine',
        totalRegistered: 6,
        physicalCount: 6,
        status: 'match'
      },
      {
        code: 'AMX01-ZGC-R03-L02-B04',
        description: 'Industrial Sensors',
        zone: 'Good Condition',
        totalRegistered: 32,
        physicalCount: 32,
        status: 'match'
      },
      {
        code: 'AMX01-ZQT-R02-L03-B01',
        description: 'Testing Equipment',
        zone: 'Quarantine',
        totalRegistered: 4,
        physicalCount: 4,
        status: 'match'
      }
    ]
  },
  {
    id: 2,
    date: '2025-10-15',
    completedDate: '2025-10-15 10:45:00',
    zone: 'Good Condition',
    status: 'completed',
    countType: 'Biannual',
    auditor: 'Felicia',
    totalItems: 3,
    counted: 3,
    discrepancies: 0,
    articles: [
      {
        code: 'AMX01-ZGC-R01-L04-B01',
        description: 'Premium Electronic Components',
        zone: 'Good Condition',
        totalRegistered: 23,
        physicalCount: 23,
        status: 'match'
      },
      {
        code: 'AMX01-ZGC-R02-L03-B05',
        description: 'Digital Multimeter Pro',
        zone: 'Good Condition',
        totalRegistered: 15,
        physicalCount: 15,
        status: 'match'
      },
      {
        code: 'AMX01-ZGC-R03-L02-B04',
        description: 'Industrial Sensors',
        zone: 'Good Condition',
        totalRegistered: 32,
        physicalCount: 32,
        status: 'match'
      }
    ]
  },
  {
    id: 3,
    date: '2025-11-20',
    completedDate: '2025-11-20 16:15:00',
    zone: 'All Zones',
    status: 'completed',
    countType: 'Spot Check',
    auditor: 'Felicia',
    totalItems: 7,
    counted: 7,
    discrepancies: 3,
    articles: [
      {
        code: 'AMX01-ZGC-R01-L04-B01',
        description: 'Premium Electronic Components',
        zone: 'Good Condition',
        totalRegistered: 30,
        physicalCount: 28,
        status: 'discrepancy',
        observations: 'Missing 2 units'
      },
      {
        code: 'AMX01-ZGC-R02-L03-B05',
        description: 'Digital Multimeter Pro',
        zone: 'Good Condition',
        totalRegistered: 16,
        physicalCount: 16,
        status: 'match'
      },
      {
        code: 'AMX01-ZDM-R01-L02-B03',
        description: 'Cracked Display Panel',
        zone: 'Damaged',
        totalRegistered: 7,
        physicalCount: 9,
        status: 'discrepancy',
        observations: '2 additional units found'
      },
      {
        code: 'AMX01-ZDM-R03-L01-B02',
        description: 'Used Battery Pack',
        zone: 'Damaged',
        totalRegistered: 10,
        physicalCount: 8,
        status: 'discrepancy',
        observations: '2 units disposed'
      },
      {
        code: 'AMX01-ZQT-R01-L01-B01',
        description: 'Unverified Components',
        zone: 'Quarantine',
        totalRegistered: 5,
        physicalCount: 5,
        status: 'match'
      },
      {
        code: 'AMX01-ZGC-R03-L02-B04',
        description: 'Industrial Sensors',
        zone: 'Good Condition',
        totalRegistered: 28,
        physicalCount: 28,
        status: 'match'
      },
      {
        code: 'AMX01-ZQT-R02-L03-B01',
        description: 'Testing Equipment',
        zone: 'Quarantine',
        totalRegistered: 4,
        physicalCount: 4,
        status: 'match'
      }
    ]
  }
];

export function useCycleCountHistory() {
  const location = useLocation();
  
  // Combinar el historial mock con el guardado en sessionStorage
  // Los registros en sessionStorage sobrescriben los del mock por ID
  const [history, setHistory] = useState<CycleCountRecord[]>(() => {
    const savedHistory = sessionStorage.getItem('cycleCountHistory');

    const dynamicHistory: CycleCountRecord[] = savedHistory
      ? JSON.parse(savedHistory) as CycleCountRecord[]
      : [];

    const dynamicMap = new Map(
      dynamicHistory.map(record => [record.id, record])
    );

    const mergedHistory = mockCycleCountHistory.map(mockRecord =>
      dynamicMap.get(mockRecord.id) || mockRecord
    );

    dynamicHistory.forEach(record => {
      if (!mockCycleCountHistory.find(m => m.id === record.id)) {
        mergedHistory.unshift(record);
      }
    });

    return mergedHistory;
  });

  useEffect(() => {
    const savedHistory = sessionStorage.getItem('cycleCountHistory');

    const dynamicHistory: CycleCountRecord[] = savedHistory
      ? JSON.parse(savedHistory) as CycleCountRecord[]
      : [];

    // Create a map of dynamic records by ID
    const dynamicMap = new Map<number, CycleCountRecord>(
      dynamicHistory.map(record => [record.id, record])
    );

    // Merge: dynamic records override mock records with same ID
    const mergedHistory: CycleCountRecord[] = mockCycleCountHistory.map(
      mockRecord => dynamicMap.get(mockRecord.id) || mockRecord
    );

    // Add dynamic records that don't exist in mock
    dynamicHistory.forEach(record => {
      if (!mockCycleCountHistory.find(m => m.id === record.id)) {
        mergedHistory.unshift(record);
      }
    });

    setHistory(mergedHistory);
  }, [location.key]);

  return { history, setHistory };
}
