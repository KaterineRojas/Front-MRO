import { useState, useEffect } from 'react';
import { Article, CycleCountViewProps } from '../types';
import { mockArticles } from '../constants/mockData';
import { 
  getCycleCountDetail, 
  recordBatchCount as recordBatchCountAPI,
  completeCycleCount as apiCompleteCycleCount,
  pauseCycleCount,
  resumeCycleCount,
  mapEntryToArticle,
  mapStatusNameToUIStatus
} from '../services/cycleCountService';
import { useAppSelector } from '../../../../store/hooks';

interface UseInventoryCountReturn {
  articles: Article[];
  searchTerm: string;
  selectedZone: string;
  countType: 'Annual' | 'Biannual' | 'Spot Check';
  auditor: string;
  filteredArticles: Article[];
  countedArticles: Article[];
  pendingArticles: Article[];
  discrepancies: Article[];
  cycleCountId?: number;
  isLoading: boolean;
  setSearchTerm: (term: string) => void;
  handleCountUpdate: (articleId: string, physicalCount: number, notes?: string) => void;
  handleSaveCycleCount: () => void;
  handleCompleteCycleCount: () => void;
  sendPendingCounts: () => Promise<void>;
}

interface InitialConfig {
  zone: string;
  countType: 'Annual' | 'Biannual' | 'Spot Check';
  auditor: string;
}

export function useInventoryCount(
  existingCountData: CycleCountViewProps['existingCountData'],
  onComplete?: CycleCountViewProps['onComplete'],
  onSaveProgress?: CycleCountViewProps['onSaveProgress'],
  initialConfig?: InitialConfig
): UseInventoryCountReturn {
  const user = useAppSelector(state => state.auth.user);
  const userId = Number(user?.id) || 1;
  
  // Track cycle count ID and entries mapping
  const [cycleCountId] = useState<number | undefined>(existingCountData?.id);
  const [entryIdMap, setEntryIdMap] = useState<Map<string, number>>(new Map());
  const [isLoading, setIsLoading] = useState(false);
  // Track dirty counts that need to be sent to server
  const [dirtyCounts, setDirtyCounts] = useState<Map<string, { physicalCount: number; notes?: string }>>(new Map());
  
  // Initialize articles - if continuing, use existing data; otherwise use mock data
  const [articles, setArticles] = useState<Article[]>(() => {
    if (existingCountData?.articles && existingCountData.articles.length > 0) {
      console.log('🔧 [useInventoryCount] Initializing with existingCountData articles:', existingCountData.articles.length);
      // Convert existing count data to Article format with proper type
      return existingCountData.articles.map(a => ({
        id: a.code, // Use code as id if id is not available
        code: a.code,
        description: a.description,
        type: 'non-consumable' as const, // Default type
        zone: a.zone,
        totalRegistered: a.totalRegistered,
        physicalCount: a.physicalCount,
        status: a.status,
        observations: a.observations,
        imageUrl: a.imageUrl
      }));
    }
    console.log('🔧 [useInventoryCount] Initializing with mock articles (will be replaced by API data if cycleCountId exists)');
    return mockArticles;
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  
  // Use initialConfig if provided, otherwise fall back to existingCountData or defaults
  console.log('🔧 [useInventoryCount] initialConfig:', initialConfig);
  console.log('🔧 [useInventoryCount] existingCountData:', existingCountData);
  
  const [selectedZone] = useState<string>(() => {
    const zone = initialConfig?.zone || existingCountData?.zone || 'all';
    console.log('🔧 [useInventoryCount] Setting selectedZone to:', zone, {
      fromInitialConfig: initialConfig?.zone,
      fromExistingCountData: existingCountData?.zone,
      final: zone
    });
    return zone;
  });
  const [countType] = useState<'Annual' | 'Biannual' | 'Spot Check'>(() => {
    const type = initialConfig?.countType || existingCountData?.countType || 'Annual';
    console.log('🔧 [useInventoryCount] Setting countType to:', type);
    return type;
  });
  const [auditor] = useState<string>(() => {
    const aud = initialConfig?.auditor || existingCountData?.auditor || '';
    console.log('🔧 [useInventoryCount] Setting auditor to:', aud);
    return aud;
  });

  // Load cycle count entries from API if cycleCountId is available
  // We need to load from API to get the entry IDs for recording counts,
  // even if we already have articles from existingCountData
  useEffect(() => {
    const loadCycleCountEntries = async () => {
      if (!cycleCountId) {
        console.log('🔧 [useInventoryCount] No cycleCountId, skipping API load');
        return;
      }

      try {
        setIsLoading(true);
        console.log('🔧 [useInventoryCount] Loading entries for cycle count:', cycleCountId);
        
        // Fetch cycle count detail with entries
        const cycleCountDetail = await getCycleCountDetail(cycleCountId);
        console.log('🔧 [useInventoryCount] Fetched cycle count detail:', {
          id: cycleCountDetail.id,
          zoneName: cycleCountDetail.zoneName,
          zoneId: cycleCountDetail.zoneId,
          entriesCount: cycleCountDetail.entries.length,
          firstEntry: cycleCountDetail.entries[0]
        });
        
        // ALWAYS create entry ID map for recording counts
        const newEntryIdMap = new Map<string, number>();
        cycleCountDetail.entries.forEach(entry => {
          newEntryIdMap.set(entry.binFullCode, entry.id);
        });
        
        console.log('🔧 [useInventoryCount] Created entryIdMap with', newEntryIdMap.size, 'entries');
        setEntryIdMap(newEntryIdMap);
        
        // ALWAYS remap articles from API entries to ensure we have the latest data structure
        // This ensures binFullCode is used instead of itemSku
        const mappedArticles = cycleCountDetail.entries.map(entry => 
          mapEntryToArticle(entry, cycleCountDetail.zoneName || 'Good Condition')
        );
        
        console.log('🔧 [useInventoryCount] Mapped articles from API:', {
          count: mappedArticles.length,
          firstArticle: mappedArticles[0],
          firstCode: mappedArticles[0]?.code,
          firstImageUrl: mappedArticles[0]?.imageUrl,
          articlesWithImages: mappedArticles.filter(a => a.imageUrl).length
        });
        
        // If we have existing count data, preserve the physicalCount and observations
        if (existingCountData?.articles && existingCountData.articles.length > 0) {
          console.log('🔧 [useInventoryCount] Merging with existing count data');
          const existingMap = new Map(existingCountData.articles.map(a => [a.id, a]));
          
          const mergedArticles = mappedArticles.map(article => {
            const existing = existingMap.get(article.id);
            if (existing && existing.physicalCount !== undefined) {
              return {
                ...article,
                physicalCount: existing.physicalCount,
                status: existing.status,
                observations: existing.observations
              };
            }
            return article;
          });
          
          setArticles(mergedArticles);
          console.log('✅ [useInventoryCount] Merged', mergedArticles.length, 'articles with existing counts');
        } else {
          setArticles(mappedArticles);
          console.log('✅ [useInventoryCount] Loaded', mappedArticles.length, 'articles from API');
        }
        
        console.log('🔧 [useInventoryCount] selectedZone:', selectedZone, '- Will show', selectedZone === 'all' ? 'all zones' : 'only ' + selectedZone);
      } catch (error) {
        console.error('❌ [useInventoryCount] Error loading cycle count entries:', error);
        // Keep existing articles on error
      } finally {
        setIsLoading(false);
      }
    };

    loadCycleCountEntries();
  }, [cycleCountId]);

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesZone = selectedZone === 'all' || article.zone === selectedZone;
    
    return matchesSearch && matchesZone;
  });
  
  // Log if no articles are shown after filtering
  if (articles.length > 0 && filteredArticles.length === 0) {
    console.log('🚨 [useInventoryCount] NO ARTICLES SHOWN - Filter issue detected:', {
      totalArticles: articles.length,
      selectedZone,
      articleZones: [...new Set(articles.map(a => a.zone))],
      firstArticle: articles[0],
      mismatch: articles[0].zone !== selectedZone && selectedZone !== 'all'
    });
  } else if (filteredArticles.length > 0) {
    console.log('✅ [useInventoryCount] Filtered articles:', {
      shown: filteredArticles.length,
      total: articles.length,
      selectedZone
    });
  }

  const countedArticles = articles.filter(a => a.status === 'match' || a.status === 'discrepancy');
  const pendingArticles = articles.filter(a => !a.status);
  const discrepancies = articles.filter(a => a.status === 'discrepancy');

  const handleCountUpdate = (articleId: string, physicalCount: number, notes?: string) => {
    console.log('🔧 [handleCountUpdate] Called with:', { articleId, physicalCount, notes });
    console.log('🔧 [handleCountUpdate] entryIdMap has', entryIdMap.size, 'entries');
    console.log('🔧 [handleCountUpdate] entryIdMap.has(articleId):', entryIdMap.has(articleId));
    
    // Update locally for immediate feedback
    setArticles(prev => prev.map(article => {
      if (article.id === articleId) {
        const status = physicalCount === article.totalRegistered ? 'match' : 'discrepancy';
        
        return {
          ...article,
          physicalCount,
          status,
          observations: notes || article.observations
        };
      }
      return article;
    }));

    // Mark this count as dirty (needs to be sent to server)
    // Will be sent in batch when Save Progress or Complete Count is clicked
    if (cycleCountId && entryIdMap.has(articleId)) {
      setDirtyCounts(prev => {
        const updated = new Map(prev);
        updated.set(articleId, { physicalCount, notes });
        console.log('🔧 [handleCountUpdate] Marked article as dirty. Total dirty counts:', updated.size);
        return updated;
      });
    }
  };

  /**
   * Sends pending counts to backend without pausing or navigating
   * Used before completing cycle count to ensure all counts are saved
   */
  const sendPendingCounts = async () => {
    if (!cycleCountId || dirtyCounts.size === 0) {
      console.log('🔧 [sendPendingCounts] No counts to send');
      return;
    }

    console.log('🔧 [sendPendingCounts] Sending', dirtyCounts.size, 'dirty counts...');
    
    try {
      // Check if cycle count is paused and resume if needed
      const currentState = await getCycleCountDetail(cycleCountId);
      if (currentState.statusName === 'Paused' || currentState.status === 1) {
        console.log('🔧 [sendPendingCounts] Resuming paused cycle count...');
        await resumeCycleCount(cycleCountId);
      }

      // Send counts in batch
      const counts = Array.from(dirtyCounts.entries()).map(([articleId, { physicalCount, notes }]) => {
        const entryId = entryIdMap.get(articleId);
        if (!entryId) {
          console.warn('⚠️ [sendPendingCounts] Article', articleId, 'missing from entryIdMap!');
          return null;
        }
        return {
          entryId,
          physicalCount,
          notes: notes || undefined
        };
      }).filter(c => c !== null) as Array<{ entryId: number; physicalCount: number; notes?: string }>;

      if (counts.length > 0) {
        await recordBatchCountAPI({
          countedByUserId: userId,
          counts
        });
        console.log('✅ [sendPendingCounts] Batch counts saved successfully');
        
        // Clear dirty counts after successful save
        setDirtyCounts(new Map());
      }
    } catch (error) {
      console.error('❌ [sendPendingCounts] Error:', error);
      throw error;
    }
  };

  const handleSaveCycleCount = async () => {
    console.log('🔧 [handleSaveCycleCount] Starting save progress');
    console.log('🔧 [handleSaveCycleCount] cycleCountId:', cycleCountId);
    console.log('🔧 [handleSaveCycleCount] selectedZone:', selectedZone);
    console.log('🔧 [handleSaveCycleCount] articles count:', articles.length);
    console.log('🔧 [handleSaveCycleCount] counted articles:', articles.filter(a => a.physicalCount !== undefined).length);
    console.log('🔧 [handleSaveCycleCount] dirty counts:', dirtyCounts.size);
    
    // If we have a cycle count ID, pause it via API
    if (cycleCountId) {
      try {
        // First, check if cycle count is paused and resume it if needed
        const currentState = await getCycleCountDetail(cycleCountId);
        console.log('🔧 [handleSaveCycleCount] Current cycle count status:', currentState.statusName);
        
        if (currentState.statusName === 'Paused' || currentState.status === 1) {
          console.log('🔧 [handleSaveCycleCount] Cycle count is paused, resuming before saving counts...');
          await resumeCycleCount(cycleCountId);
          console.log('✅ [handleSaveCycleCount] Cycle count resumed');
        }
        
        // Now send all dirty counts in batch to the API
        if (dirtyCounts.size > 0) {
          console.log('🔧 [handleSaveCycleCount] Sending', dirtyCounts.size, 'dirty counts to API...');
          
          const counts = Array.from(dirtyCounts.entries()).map(([articleId, { physicalCount, notes }]) => {
            const entryId = entryIdMap.get(articleId);
            if (!entryId) {
              console.warn('⚠️ [handleSaveCycleCount] Article', articleId, 'missing from entryIdMap!');
              return null;
            }
            return {
              entryId,
              physicalCount,
              notes: notes || undefined
            };
          }).filter(c => c !== null) as Array<{ entryId: number; physicalCount: number; notes?: string }>;
          
          if (counts.length > 0) {
            console.log('🔧 [handleSaveCycleCount] Sending batch with', counts.length, 'counts');
            await recordBatchCountAPI({
              countedByUserId: userId,
              counts
            });
            console.log('✅ [handleSaveCycleCount] Batch counts saved successfully');
            
            // Clear dirty counts after successful save
            setDirtyCounts(new Map());
          }
        } else {
          console.log('🔧 [handleSaveCycleCount] No dirty counts to save');
        }
        
        // Now pause the cycle count
        const pausedCycleCount = await pauseCycleCount(cycleCountId);
        console.log('✅ [useInventoryCount] Cycle count paused:', pausedCycleCount);
        console.log('🔍 [useInventoryCount] API returned statusName:', pausedCycleCount.statusName);
        
        // Use API's statusName to determine the actual status
        const actualStatus = mapStatusNameToUIStatus(pausedCycleCount.statusName);
        console.log('🔍 [useInventoryCount] Mapped to UI status:', actualStatus);
        
        // Prepare progress data from API response
        const progressData = {
          id: cycleCountId, // Include ID for history tracking
          date: new Date(pausedCycleCount.createdAt).toISOString().split('T')[0],
          zone: selectedZone,
          status: actualStatus,
          countType,
          auditor,
          totalItems: pausedCycleCount.totalEntries,
          counted: pausedCycleCount.countedEntries,
          discrepancies: pausedCycleCount.entries.filter(e => e.variance !== 0).length,
          articles: articles.map(a => ({
            id: a.id,
            type: a.type,
            code: a.code,
            description: a.description,
            zone: a.zone,
            totalRegistered: a.totalRegistered,
            physicalCount: a.physicalCount !== undefined ? a.physicalCount : 0,
            status: a.status,
            observations: a.observations
          }))
        };
        
        console.log('✅ [handleSaveCycleCount] Progress data prepared:', {
          id: progressData.id,
          zone: progressData.zone,
          counted: progressData.counted,
          total: progressData.totalItems,
          articlesCount: progressData.articles.length
        });
        
        if (onSaveProgress) {
          onSaveProgress(progressData);
        }
        
        alert('Cycle count progress saved successfully!');
        return;
      } catch (error) {
        console.error('❌ [useInventoryCount] Error pausing cycle count:', error);
        alert('Failed to pause cycle count. Please try again.');
        return;
      }
    }

    // Fallback to local save if no cycle count ID
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    
    // Filter only the articles from the selected zone (if not "all")
    const articlesToSave = selectedZone === 'all' 
      ? articles 
      : articles.filter(a => a.zone === selectedZone);
    
    const progressData = {
      date: `${year}-${month}-${day}`,
      zone: selectedZone,
      status: 'in-progress' as const,
      countType,
      auditor,
      totalItems: articlesToSave.length,
      counted: articlesToSave.filter(a => a.physicalCount !== undefined).length,
      discrepancies: articlesToSave.filter(a => a.status === 'discrepancy').length,
      articles: articlesToSave.map(a => ({
        id: a.id,
        type: a.type,
        code: a.code,
        description: a.description,
        zone: a.zone,
        totalRegistered: a.totalRegistered,
        physicalCount: a.physicalCount !== undefined ? a.physicalCount : 0,
        status: a.status,
        observations: a.observations
      }))
    };

    // Llamar al callback onSaveProgress
    if (onSaveProgress) {
      onSaveProgress(progressData);
    }
    
    alert('Cycle count progress saved successfully!');
  };

  const handleCompleteCycleCount = async () => {
    // Filter articles by selected zone (if not "all")
    const articlesToCount = selectedZone === 'all' 
      ? articles 
      : articles.filter(a => a.zone === selectedZone);
    
    // Check if all articles have been counted (have physicalCount defined)
    const countedArticles = articlesToCount.filter(a => a.physicalCount !== undefined);
    const uncountedArticles = articlesToCount.filter(a => a.physicalCount === undefined);
    const discrepancies = articlesToCount.filter(a => a.status === 'discrepancy');
    
    console.log('🔧 [handleCompleteCycleCount] Validation:', {
      totalArticles: articlesToCount.length,
      countedArticles: countedArticles.length,
      uncountedArticles: uncountedArticles.length,
      discrepancies: discrepancies.length,
      selectedZone
    });
    
    // Verificar que todos los artículos de la zona hayan sido contados
    if (uncountedArticles.length > 0) {
      console.warn('⚠️ [handleCompleteCycleCount] Uncounted articles:', uncountedArticles.map(a => a.code));
      alert(`Please count all items before completing. ${uncountedArticles.length} item(s) remaining in ${selectedZone === 'all' ? 'all zones' : selectedZone}.`);
      return;
    }

    // Verificar que se haya ingresado un auditor
    if (!auditor.trim()) {
      alert('Please enter an auditor name before completing the cycle count.');
      return;
    }

    // If we have a cycle count ID, complete it via API
    if (cycleCountId) {
      try {
        // First, check if cycle count is paused and resume it if needed
        const currentState = await getCycleCountDetail(cycleCountId);
        console.log('🔧 [handleCompleteCycleCount] Current cycle count status:', currentState.statusName);
        
        if (currentState.statusName === 'Paused' || currentState.status === 1) {
          console.log('🔧 [handleCompleteCycleCount] Cycle count is paused, resuming before saving counts...');
          await resumeCycleCount(cycleCountId);
          console.log('✅ [handleCompleteCycleCount] Cycle count resumed');
        }
        
        // Now send all dirty counts in batch to the API
        if (dirtyCounts.size > 0) {
          console.log('🔧 [handleCompleteCycleCount] Sending', dirtyCounts.size, 'dirty counts to API...');
          
          const counts = Array.from(dirtyCounts.entries()).map(([articleId, { physicalCount, notes }]) => {
            const entryId = entryIdMap.get(articleId);
            if (!entryId) {
              console.warn('⚠️ [handleCompleteCycleCount] Article', articleId, 'missing from entryIdMap!');
              return null;
            }
            return {
              entryId,
              physicalCount,
              notes: notes || undefined
            };
          }).filter(c => c !== null) as Array<{ entryId: number; physicalCount: number; notes?: string }>;
          
          if (counts.length > 0) {
            console.log('🔧 [handleCompleteCycleCount] Sending batch with', counts.length, 'counts');
            await recordBatchCountAPI({
              countedByUserId: userId,
              counts
            });
            console.log('✅ [handleCompleteCycleCount] Batch counts saved successfully');
            
            // Clear dirty counts after successful save
            setDirtyCounts(new Map());
          }
        } else {
          console.log('🔧 [handleCompleteCycleCount] No dirty counts to save');
        }
        
        // Now complete the cycle count
        const completedCycleCount = await apiCompleteCycleCount(cycleCountId);
        console.log('✅ [useInventoryCount] Cycle count completed:', completedCycleCount);
        console.log('🔍 [useInventoryCount] API returned statusName:', completedCycleCount.statusName);
        
        // Prepare completed data from API response
        // Use API's statusName to determine the actual status
        const actualStatus = mapStatusNameToUIStatus(completedCycleCount.statusName);
        console.log('🔍 [useInventoryCount] Mapped to UI status:', actualStatus);
        const completedData = {
          id: cycleCountId, // Include ID for history tracking
          date: new Date(completedCycleCount.createdAt).toISOString().split('T')[0],
          completedDate: completedCycleCount.completedAt 
            ? new Date(completedCycleCount.completedAt).toLocaleString('sv-SE').replace('T', ' ').substring(0, 19)
            : new Date().toLocaleString('sv-SE').replace('T', ' ').substring(0, 19),
          zone: selectedZone,
          status: actualStatus,
          countType,
          auditor,
          totalItems: completedCycleCount.totalEntries,
          counted: completedCycleCount.countedEntries,
          discrepancies: completedCycleCount.entries.filter(e => e.variance !== 0).length,
          articles: articlesToCount.map(a => ({
            id: a.id,
            type: a.type,   
            code: a.code,
            description: a.description,
            zone: a.zone,
            totalRegistered: a.totalRegistered,
            physicalCount: a.physicalCount!,
            status: a.status!,
            observations: a.observations
          }))
        };

        if (onComplete) {
          onComplete(completedData);
        }
        
        alert('Cycle count completed successfully!');
        return;
      } catch (error) {
        console.error('❌ [useInventoryCount] Error completing cycle count:', error);
        
        // Try to extract specific error message from API response
        let errorMessage = 'Failed to complete cycle count. Please try again.';
        if (error instanceof Error) {
          // Check if the error message contains the API's detailed message
          const match = error.message.match(/Status: \d+ (.+)/);
          if (match && match[1]) {
            errorMessage = match[1];
          }
        }
        
        alert(errorMessage);
        return;
      }
    }

    // Fallback to local completion if no cycle count ID
    // Preparar los datos del conteo completado
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    const completedData = {
      date: `${year}-${month}-${day}`,
      completedDate: `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`,
      zone: selectedZone,
      status: 'completed' as const,
      countType,
      auditor,
      totalItems: articlesToCount.length,
      counted: countedArticles.length,
      discrepancies: discrepancies.length,
      articles: articlesToCount.map(a => ({
        id: a.id,
        type: a.type,   
        code: a.code,
        description: a.description,
        zone: a.zone,
        totalRegistered: a.totalRegistered,
        physicalCount: a.physicalCount!,
        status: a.status!,
        observations: a.observations
      }))
    };

    // Llamar al callback onComplete
    if (onComplete) {
      onComplete(completedData);
    }
    
    alert('Cycle count completed successfully!');
  };

  return {
    articles,
    searchTerm,
    selectedZone,
    countType,
    auditor,
    filteredArticles,
    countedArticles,
    pendingArticles,
    discrepancies,
    cycleCountId,
    isLoading,
    setSearchTerm,
    handleCountUpdate,
    handleSaveCycleCount,
    handleCompleteCycleCount,
    sendPendingCounts
  };
}
