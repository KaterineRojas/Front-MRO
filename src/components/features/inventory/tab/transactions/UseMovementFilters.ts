import { useState, useMemo } from 'react';
import type { Movement } from './types';

export function UseMovementFilters(movements: Movement[]) {
  const [filterType, setFilterType] = useState<string>('all');
  const [filterSubtype, setFilterSubtype] = useState<string>('all');
  const [filterUser, setFilterUser] = useState<string>('all');
  const [filterProject, setFilterProject] = useState<string>('all');

  const filteredMovements = useMemo(() => {
    return movements.filter((movement) => {
      if (filterType !== 'all' && movement.type !== filterType) return false;
      if (filterSubtype !== 'all' && movement.subtype !== filterSubtype) return false;
      if (filterUser !== 'all' && movement.user !== filterUser) return false;
      if (filterProject !== 'all' && movement.project !== filterProject) return false;
      return true;
    });
  }, [movements, filterType, filterSubtype, filterUser, filterProject]);

  const uniqueUsers = useMemo(() => [...new Set(movements.map((m) => m.user))], [movements]);
  const uniqueProjects = useMemo(() => [...new Set(movements.map((m) => m.project))], [movements]);

  return {
    filterType,
    setFilterType,
    filterSubtype,
    setFilterSubtype,
    filterUser,
    setFilterUser,
    filterProject,
    setFilterProject,
    filteredMovements,
    uniqueUsers,
    uniqueProjects,
  };
}
