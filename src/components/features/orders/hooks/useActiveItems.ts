import { useState, useEffect } from 'react';
import { getActiveItems } from '../services/purchaseService';
import { Item } from '../types/purchaseType';

export const useActiveItems = () => {
    const [items, setItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const refreshItems = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getActiveItems();
            setItems(data);
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const controller = new AbortController();

        const fetchData = async () => {
            try {
                const data = await getActiveItems(controller.signal);
                setItems(data);
                setError(null);
            } catch (err: any) {
                if (err.name !== 'AbortError') {
                    console.error("Fetch error:", err);
                    setError(err.message || 'Failed to load items.');
                }
            } finally {
                // Only stop loading if not aborted
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        };

        fetchData();

        return () => controller.abort();
    }, []);

    return { items, loading, error, refreshItems };
};