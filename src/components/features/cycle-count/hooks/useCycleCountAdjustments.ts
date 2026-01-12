import { useState } from 'react';
import { CycleCountDetailData, DiscrepancyAdjustment } from '../types';
import { recordCycleCountEntry, completeCycleCount } from '../services/cycleCountService';

interface UseCycleCountAdjustmentsReturn {
  adjustments: Record<string, string>;
  adjustmentReasons: Record<string, string>;
  isAdjustmentsApplied: boolean;
  handleAdjustmentChange: (code: string, value: string) => void;
  handleReasonChange: (code: string, value: string) => void;
  handleApplyAdjustments: (
    discrepancyArticles: any[],
    countData: CycleCountDetailData,
    onAdjustmentsApplied?: (data: CycleCountDetailData) => void
  ) => Promise<void>;
  setIsAdjustmentsApplied: (value: boolean) => void;
}

export function useCycleCountAdjustments(
  countData: CycleCountDetailData | null | undefined
): UseCycleCountAdjustmentsReturn {
  // Initialize from existing data if adjustments were already applied
  const [adjustments, setAdjustments] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    // Check if countData and articles exist before accessing
    if (countData?.articles) {
      countData.articles.forEach(article => {
        if (article.adjustment !== undefined) {
          initial[article.code] = article.adjustment.toString();
        }
      });
    }
    return initial;
  });

  const [adjustmentReasons, setAdjustmentReasons] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    // Check if countData and articles exist before accessing
    if (countData?.articles) {
      countData.articles.forEach(article => {
        if (article.adjustmentReason) {
          initial[article.code] = article.adjustmentReason;
        }
      });
    }
    return initial;
  });

  const [isAdjustmentsApplied, setIsAdjustmentsApplied] = useState(
    countData?.adjustmentsApplied || false
  );

  const handleAdjustmentChange = (code: string, value: string) => {
    // Don't allow negative numbers
    const numValue = parseInt(value);
    if (value !== '' && (isNaN(numValue) || numValue < 0)) {
      return;
    }

    setAdjustments(prev => ({
      ...prev,
      [code]: value
    }));
  };

  const handleReasonChange = (code: string, value: string) => {
    setAdjustmentReasons(prev => ({
      ...prev,
      [code]: value
    }));
  };

  const handleApplyAdjustments = async (
    discrepancyArticles: any[],
    countData: CycleCountDetailData,
    onAdjustmentsApplied?: (data: CycleCountDetailData) => void
  ) => {
    const recountsToApply: Array<{ article: any; newCount: number; reason: string }> = [];

    discrepancyArticles.forEach(article => {
      const newCount = adjustments[article.code];
      const reason = adjustmentReasons[article.code];

      if (newCount && newCount.trim() !== '') {
        const qty = parseInt(newCount);
        if (!isNaN(qty) && qty >= 0) {
          recountsToApply.push({
            article,
            newCount: qty,
            reason: reason || 'Recount - verification'
          });
        }
      }
    });

    if (recountsToApply.length === 0) {
      alert('Please enter at least one new count to update.');
      return;
    }

    const confirmMessage = `You are about to update the count for ${recountsToApply.length} item(s). This will replace the physical count with the new values. Do you want to proceed?`;

    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      console.log('Updating counts via API:', recountsToApply);

      // Call the backend to update each count
      // Note: We need the entryId for each article to call the API
      // This assumes articles have an entryId or we need to fetch it
      const updatePromises = recountsToApply.map(async ({ article, newCount, reason }) => {
        // TODO: Get entryId from article or make API call to get it
        // For now, we'll need to modify the article type to include entryId
        if (!article.entryId) {
          console.warn('Article missing entryId, cannot update:', article.code);
          return null;
        }

        return recordCycleCountEntry({
          entryId: article.entryId,
          physicalCount: newCount,
          countedByUserId: countData.countedByUserId || 0, // TODO: Get from auth context
          notes: reason
        });
      });

      await Promise.all(updatePromises);

      console.log('✅ All counts updated successfully. Now completing cycle count...');

      // After updating counts, complete the cycle count
      try {
        await completeCycleCount(countData.id);
        console.log('✅ Cycle count completed and adjustments applied by backend');
        alert('Counts updated and cycle count completed successfully! Inventory adjustments have been applied.');
      } catch (completeError) {
        console.error('❌ Error completing cycle count:', completeError);
        alert('Counts were updated, but failed to complete the cycle count. Please try completing manually.');
      }

      setIsAdjustmentsApplied(true);

      // Update the countData with new counts
      const updatedArticles = countData.articles.map(article => {
        const newCount = adjustments[article.code];
        const reason = adjustmentReasons[article.code];
        if (newCount && !isNaN(parseInt(newCount))) {
          const newPhysicalCount = parseInt(newCount);
          const newStatus = (newPhysicalCount === article.totalRegistered 
      ? 'match' 
      : 'discrepancy') as 'match' | 'discrepancy';
          return {
            ...article,
            physicalCount: newPhysicalCount,
            status: newStatus,
            observations: reason || article.observations
          };
        }
        return article;
      });

      const updatedData: CycleCountDetailData = {
        ...countData,
        articles: updatedArticles,
        adjustmentsApplied: true
      };

      if (onAdjustmentsApplied) {
        onAdjustmentsApplied(updatedData);
      }
    } catch (error) {
      console.error('Error updating counts:', error);
      alert('Failed to update counts. Please try again.');
    }
  };

  return {
    adjustments,
    adjustmentReasons,
    isAdjustmentsApplied,
    handleAdjustmentChange,
    handleReasonChange,
    handleApplyAdjustments,
    setIsAdjustmentsApplied
  };
}
