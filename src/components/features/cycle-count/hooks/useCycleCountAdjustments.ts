import { useState } from 'react';
import { CycleCountDetailData, DiscrepancyAdjustment } from '../types';

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
  ) => void;
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

  const handleApplyAdjustments = (
    discrepancyArticles: any[],
    countData: CycleCountDetailData,
    onAdjustmentsApplied?: (data: CycleCountDetailData) => void
  ) => {
    const adjustmentsToApply: DiscrepancyAdjustment[] = [];

    discrepancyArticles.forEach(article => {
      const adjustedQty = adjustments[article.code];
      const reason = adjustmentReasons[article.code];

      if (adjustedQty && adjustedQty.trim() !== '') {
        const qty = parseInt(adjustedQty);
        if (!isNaN(qty) && qty >= 0) {
          adjustmentsToApply.push({
            code: article.code,
            adjustedQuantity: qty,
            reason: reason || 'Adjusted based on cycle count'
          });
        }
      }
    });

    if (adjustmentsToApply.length === 0) {
      alert('Please enter at least one adjustment quantity.');
      return;
    }

    // Here you would typically send this to your backend
    console.log('Applying adjustments:', adjustmentsToApply);

    const confirmMessage = `You are about to adjust ${adjustmentsToApply.length} item(s). This will update the inventory quantities. Do you want to proceed?`;

    if (window.confirm(confirmMessage)) {
      // Simulate API call
      alert('Inventory adjustments have been applied successfully!');

      // Don't clear the adjustments, just mark them as applied
      setIsAdjustmentsApplied(true);

      // Update the countData with adjustments
      const updatedArticles = countData.articles.map(article => {
        const adjustment = adjustments[article.code];
        const reason = adjustmentReasons[article.code];
        if (adjustment && !isNaN(parseInt(adjustment))) {
          return {
            ...article,
            adjustment: parseInt(adjustment),
            adjustmentReason: reason || 'Adjusted based on cycle count'
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
