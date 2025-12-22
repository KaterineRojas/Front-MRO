import { useState, useEffect } from 'react';
import { Button } from '../../../ui/button';
import { Input } from '../../../ui/input';
import { Minus, Plus, MessageSquare } from 'lucide-react';
import { Article } from '../types';

interface CountInputProps {
  article: Article;
  onUpdate: (articleId: string, physicalCount: number, notes?: string) => void;
}

export function CountInput({ article, onUpdate }: CountInputProps) {
  const [countValue, setCountValue] = useState(article.physicalCount?.toString() || '');
  const [observations, setObservations] = useState(article.observations || '');
  const [showObservations, setShowObservations] = useState(false);

  // Update local state when article changes
  useEffect(() => {
    setCountValue(article.physicalCount?.toString() || '');
    setObservations(article.observations || '');
  }, [article.physicalCount, article.observations]);

  const handleSubmit = () => {
    const quantity = parseInt(countValue);
    if (!isNaN(quantity) && quantity >= 0) {
      onUpdate(article.id, quantity, observations.trim() || undefined);
    }
  };

  const handleQuickAdjust = (adjustment: number) => {
    const currentValue = parseInt(countValue) || 0;
    const newValue = Math.max(0, currentValue + adjustment);
    setCountValue(newValue.toString());
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleQuickAdjust(-1)}
          disabled={parseInt(countValue) <= 0}
        >
          <Minus className="h-3 w-3" />
        </Button>
        <Input
          type="number"
          value={countValue}
          onChange={(e) => setCountValue(e.target.value)}
          placeholder="0"
          className="w-20 text-center"
          min="0"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleQuickAdjust(1)}
        >
          <Plus className="h-3 w-3" />
        </Button>
        <Button
          size="sm"
          onClick={handleSubmit}
        >
          Count
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowObservations(!showObservations)}
          title="Add observations"
        >
          <MessageSquare className="h-3 w-3" />
        </Button>
      </div>
      {showObservations && (
        <Input
          type="text"
          value={observations}
          onChange={(e) => setObservations(e.target.value)}
          placeholder="Add observations..."
          className="w-full text-sm"
        />
      )}
    </div>
  );
}
