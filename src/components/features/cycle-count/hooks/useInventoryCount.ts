import { useState } from 'react';
import { Article, CycleCountViewProps } from '../types';
import { mockArticles } from '../constants/mockData';

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
  setSearchTerm: (term: string) => void;
  setSelectedZone: (zone: string) => void;
  setCountType: (type: 'Annual' | 'Biannual' | 'Spot Check') => void;
  setAuditor: (auditor: string) => void;
  handleCountUpdate: (articleId: string, physicalCount: number, notes?: string) => void;
  handleSaveCycleCount: () => void;
  handleCompleteCycleCount: () => void;
}

export function useInventoryCount(
  existingCountData: CycleCountViewProps['existingCountData'],
  onComplete?: CycleCountViewProps['onComplete'],
  onSaveProgress?: CycleCountViewProps['onSaveProgress']
): UseInventoryCountReturn {
  // Initialize articles - if continuing, use existing data; otherwise use mock data
  const [articles, setArticles] = useState<Article[]>(() => {
    if (existingCountData?.articles) {
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
        observations: a.observations
      }));
    }
    return mockArticles;
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedZone, setSelectedZone] = useState<string>(existingCountData?.zone || 'all');
  const [countType, setCountType] = useState<'Annual' | 'Biannual' | 'Spot Check'>(
    existingCountData?.countType || 'Annual'
  );
  const [auditor, setAuditor] = useState<string>(existingCountData?.auditor || '');

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesZone = selectedZone === 'all' || article.zone === selectedZone;
    
    return matchesSearch && matchesZone;
  });

  const countedArticles = articles.filter(a => a.status === 'match' || a.status === 'discrepancy');
  const pendingArticles = articles.filter(a => !a.status);
  const discrepancies = articles.filter(a => a.status === 'discrepancy');

  const handleCountUpdate = (articleId: string, physicalCount: number, notes?: string) => {
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
  };

  const handleSaveCycleCount = () => {
    // Save cycle count to backend
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

  const handleCompleteCycleCount = () => {
    // Filter articles by selected zone (if not "all")
    const articlesToCount = selectedZone === 'all' 
      ? articles 
      : articles.filter(a => a.zone === selectedZone);
    
    const countedArticles = articlesToCount.filter(a => a.status === 'match' || a.status === 'discrepancy');
    const discrepancies = articlesToCount.filter(a => a.status === 'discrepancy');
    
    // Verificar que todos los artículos de la zona hayan sido contados
    if (countedArticles.length < articlesToCount.length) {
      alert(`Please count all items in ${selectedZone === 'all' ? 'all zones' : selectedZone} before completing the cycle count.`);
      return;
    }

    // Verificar que se haya ingresado un auditor
    if (!auditor.trim()) {
      alert('Please enter an auditor name before completing the cycle count.');
      return;
    }

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
    setSearchTerm,
    setSelectedZone,
    setCountType,
    setAuditor,
    handleCountUpdate,
    handleSaveCycleCount,
    handleCompleteCycleCount
  };
}
