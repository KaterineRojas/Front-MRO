import { useEffect } from 'react';
import { BinManagerTab } from './tabs/BinManager/BinManagerTab';
import { useAppDispatch } from '../../../store/hooks';
import {
  fetchArticles,
  fetchKits,
  fetchBins,
  fetchTransactions
} from '../../../store/slices/inventorySlice';

export function InventoryManager() {
  const dispatch = useAppDispatch();

  // Load data on mount
  useEffect(() => {
    dispatch(fetchArticles());
    dispatch(fetchKits());
    dispatch(fetchBins());
    dispatch(fetchTransactions());
  }, [dispatch]);

  return <BinManagerTab />;
}
